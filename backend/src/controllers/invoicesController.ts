import { Request, Response } from "express";
import InvoiceModel, { InvoiceStatus, InvoiceLineItem } from "../models/Invoice";
import Organization from "../models/Organization";

const ALLOWED_SORT = new Set(["createdAt", "invoiceDate", "dueDate", "number", "balanceDue"]);

function toNumber(value: any, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function computeLineItems(items: any[]): InvoiceLineItem[] {
  const safeItems = (items ?? []).map((li) => {
    const rawDesc = String(li?.description ?? "");
    const desc = rawDesc.trim();

    const rate = toNumber(li?.rate, 0);
    const qty = toNumber(li?.qty, 1); // default qty to 1 if missing

    // ✅ Mongoose requires description, so never allow empty
    const safeDescription = desc.length > 0 ? desc : "Item";

    const amount =
      Number.isFinite(Number(li?.amount))
        ? toNumber(li.amount, rate * qty)
        : rate * qty;

    return {
      description: safeDescription,
      rate,
      qty,
      amount,
    };
  });

  // Optional: if nothing provided, still create one default line
  return safeItems.length > 0
    ? safeItems
    : [{ description: "Item", rate: 0, qty: 1, amount: 0 }];
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

  const orgId = req.activeOrgId;
  const filter: any = orgId
    ? { $or: [{ orgId }, { orgId: { $exists: false } }] }
    : {};

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
  const orgId = req.activeOrgId;
  const item = orgId
    ? await InvoiceModel.findOne({ _id: id, $or: [{ orgId }, { orgId: { $exists: false } }] })
    : await InvoiceModel.findById(id);

  if (!item) return res.status(404).json({ message: "Invoice not found" });

  res.json(item);
}

export async function createInvoice(req: Request, res: Response) {
  const body = req.body ?? {};
  const orgId = req.activeOrgId;
  const fromUserId = req.userId;

  // Defaults that make "New invoice" work even if UI sends minimal payload.
  const now = new Date();
  const generatedNumber =
    body.number ??
    `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

  // Use org name as a sensible default for the "from" party.
  let orgName: string | undefined;
  if (orgId) {
    const org = await Organization.findById(orgId).select("name");
    orgName = org?.name;
  }

  const fromParty = body.from ?? { name: orgName ?? "My Organization" };
  // billTo.name is required; use a placeholder so the document is valid.
  const billToParty = body.billTo ?? { name: "Client" };

  const lineItems = computeLineItems(body.lineItems ?? []);

  const totals = computeTotals({
    lineItems,
    taxPercent: body.taxPercent,
    paidAmount: body.paidAmount,
  });

  const doc = await InvoiceModel.create({
    orgId: orgId ?? undefined,
    fromUserId: fromUserId ?? undefined,

    number: generatedNumber,
    status: normalizeStatus(body.status) ?? "Draft",
    currency: body.currency ?? "USD",

    invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : now,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    terms: body.terms,

    from: fromParty,
    billTo: billToParty,

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

  const orgId = req.activeOrgId;
  const existing = orgId
    ? await InvoiceModel.findOne({ _id: id, $or: [{ orgId }, { orgId: { $exists: false } }] })
    : await InvoiceModel.findById(id);
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

  const updated = orgId
    ? await InvoiceModel.findOne({ _id: existing._id, $or: [{ orgId }, { orgId: { $exists: false } }] })
    : await InvoiceModel.findById(existing._id);
  res.json(updated ?? existing);
}

export async function deleteInvoice(req: Request, res: Response) {
  const { id } = req.params;

  const orgId = req.activeOrgId;
  const deleted = orgId
    ? await InvoiceModel.findOneAndDelete({ _id: id, $or: [{ orgId }, { orgId: { $exists: false } }] })
    : await InvoiceModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Invoice not found" });

  res.json({ ok: true });
}
