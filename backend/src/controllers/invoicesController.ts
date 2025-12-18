import { Request, Response } from "express";
import InvoiceModel, { InvoiceStatus, InvoiceLineItem } from "../models/Invoice";

const ALLOWED_SORT = new Set(["createdAt", "invoiceDate", "dueDate", "number", "balanceDue"]);

function toNumber(value: any, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function computeLineItems(items: any[]): InvoiceLineItem[] {
  return (items ?? []).map((li) => {
    const rate = toNumber(li.rate, 0);
    const qty = toNumber(li.qty, 0);
    const amount = Number.isFinite(Number(li.amount)) ? toNumber(li.amount, rate * qty) : rate * qty;
    return {
      description: String(li.description ?? "").trim(),
      rate,
      qty,
      amount,
    };
  });
}

function computeTotals(params: {
  lineItems: InvoiceLineItem[];
  taxPercent?: any;
  paidAmount?: any;
}) {
  const subtotal = params.lineItems.reduce((sum, li) => sum + toNumber(li.amount, 0), 0);
  const taxPercent = Math.max(0, toNumber(params.taxPercent, 0));
  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;

  const paidAmount = Math.max(0, toNumber(params.paidAmount, 0));
  const balanceDue = Math.max(0, total - paidAmount);

  return {
    taxPercent,
    subtotal,
    taxAmount,
    total,
    paidAmount,
    balanceDue,
  };
}

function normalizeStatus(raw?: any): InvoiceStatus | undefined {
  if (!raw) return undefined;
  const s = String(raw);
  if (s === "Draft" || s === "Sent" || s === "Paid" || s === "Void") return s;
  return undefined;
}

export async function listInvoices(req: Request, res: Response) {
  const {
    q = "",
    status,
    sortBy = "invoiceDate",
    sortDir = "desc",
  } = req.query as {
    q?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  };

  const filter: any = {};

  const s = String(q || "").trim();
  if (s) {
    // Search on invoice number + billTo name/email
    filter.$or = [
      { number: { $regex: s, $options: "i" } },
      { "billTo.name": { $regex: s, $options: "i" } },
      { "billTo.email": { $regex: s, $options: "i" } },
    ];
  }

  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus) filter.status = normalizedStatus;

  const sortField = ALLOWED_SORT.has(sortBy) ? sortBy : "invoiceDate";
  const direction = String(sortDir).toLowerCase() === "asc" ? 1 : -1;

  const items = await InvoiceModel.find(filter).sort({ [sortField]: direction });

  res.json(items);
}

export async function getInvoice(req: Request, res: Response) {
  const { id } = req.params;
  const item = await InvoiceModel.findById(id);

  if (!item) return res.status(404).json({ message: "Invoice not found" });

  res.json(item);
}

export async function createInvoice(req: Request, res: Response) {
  const body = req.body ?? {};

  const lineItems = computeLineItems(body.lineItems ?? []);

  const totals = computeTotals({
    lineItems,
    taxPercent: body.taxPercent,
    paidAmount: body.paidAmount,
  });

  const doc = await InvoiceModel.create({
    number: body.number,
    status: normalizeStatus(body.status) ?? "Draft",
    currency: body.currency ?? "USD",

    invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    terms: body.terms,

    from: body.from,
    billTo: body.billTo,

    lineItems,

    taxPercent: totals.taxPercent,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,

    paidAmount: totals.paidAmount,
    balanceDue: totals.balanceDue,

    notes: body.notes,

    activity: [
      {
        type: "Created",
        message: `Invoice created`,
        at: new Date(),
      },
    ],
  });

  res.status(201).json(doc);
}

export async function updateInvoice(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body ?? {};

  const existing = await InvoiceModel.findById(id);
  if (!existing) return res.status(404).json({ message: "Invoice not found" });

  const lineItems = computeLineItems(body.lineItems ?? existing.lineItems);

  const totals = computeTotals({
    lineItems,
    taxPercent: body.taxPercent ?? existing.taxPercent,
    paidAmount: body.paidAmount ?? existing.paidAmount,
  });

  const nextStatus = normalizeStatus(body.status) ?? existing.status;

  // Basic activity logging
  const activity = [...(existing.activity ?? [])];
  activity.push({
    type: "Updated",
    message: "Invoice updated",
    at: new Date(),
  });

  if (nextStatus !== existing.status) {
    activity.push({
      type: "StatusChanged",
      message: `Status changed: ${existing.status} → ${nextStatus}`,
      at: new Date(),
    });
  }

  existing.number = body.number ?? existing.number;
  existing.status = nextStatus;

  existing.currency = body.currency ?? existing.currency;

  if (body.invoiceDate) existing.invoiceDate = new Date(body.invoiceDate);
  if (body.dueDate !== undefined) existing.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
  if (body.terms !== undefined) existing.terms = body.terms;

  if (body.from) existing.from = body.from;
  if (body.billTo) existing.billTo = body.billTo;

  existing.lineItems = lineItems;

  existing.taxPercent = totals.taxPercent;
  existing.subtotal = totals.subtotal;
  existing.taxAmount = totals.taxAmount;
  existing.total = totals.total;

  existing.paidAmount = totals.paidAmount;
  existing.balanceDue = totals.balanceDue;

  if (body.notes !== undefined) existing.notes = body.notes;

  existing.activity = activity;

  await existing.save();

  const updated = await InvoiceModel.findById(existing._id);
  res.json(updated ?? existing);
}

export async function deleteInvoice(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await InvoiceModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Invoice not found" });

  res.json({ ok: true });
}
