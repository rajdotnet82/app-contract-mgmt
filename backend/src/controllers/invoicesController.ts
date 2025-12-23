// server/src/controllers/invoices.controller.ts
import Invoice from "../models/Invoice";
import Organization from "../models/Organization";

function hydrateFromOrg(org: any) {
  return {
    name: org?.name ?? "",
    email: org?.email ?? "",
    phone: org?.phone ?? "",
    addressLine1: org?.addressLine1 ?? "",
    addressLine2: org?.addressLine2 ?? "",
    city: org?.city ?? "",
    state: org?.state ?? "",
    postalCode: org?.postalCode ?? "",
    country: org?.country ?? "",
    businessNumber: org?.businessNumber ?? "",
    logoUrl: org?.logoUrl ?? "",
  };
}

function recalcTotals(invoice: any) {
  const items = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  for (const li of items) {
    const rate = Number(li.rate ?? 0);
    const qty = Number(li.qty ?? 0);
    li.amount = Number((rate * qty).toFixed(2));
  }

  const subtotal = Number(items.reduce((s: number, x: any) => s + Number(x.amount ?? 0), 0).toFixed(2));
  const taxPercent = Number(invoice.taxPercent ?? 0);
  const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));
  const paidAmount = Number(invoice.paidAmount ?? 0);
  const balanceDue = Number((total - paidAmount).toFixed(2));

  invoice.subtotal = subtotal;
  invoice.taxAmount = taxAmount;
  invoice.total = total;
  invoice.balanceDue = balanceDue;
}

export async function listInvoices(req: any, res: any) {
  const orgId = req.user?.orgId || req.user?.activeOrgId;
  const q = String(req.query.q ?? "").trim();

  const filter: any = { orgId };
  if (q) filter.number = { $regex: q, $options: "i" };

  const invoices = await Invoice.find(filter).sort({ invoiceDate: -1 }).lean();
  res.json(invoices);
}

export async function getInvoice(req: any, res: any) {
  const orgId = req.user?.orgId || req.user?.activeOrgId;
  const invoice = await Invoice.findOne({ _id: req.params.id, orgId });
  if (!invoice) return res.status(404).json({ error: "Not found" });

  // ✅ make sure from is hydrated if org has new details
  const org = await Organization.findById(orgId).lean();
  if (org) {
    invoice.from = hydrateFromOrg(org);
    await invoice.save();
  }

  res.json(invoice);
}

export async function createInvoice(req: any, res: any) {
  const orgId = req.user?.orgId || req.user?.activeOrgId;
  if (!orgId) return res.status(400).json({ error: "No org" });

  const org = await Organization.findById(orgId).lean();
  if (!org) return res.status(404).json({ error: "Org not found" });

  const body = req.body ?? {};

  const invoice = new Invoice({
    orgId,
    fromUserId: req.user?._id,

    clientId: body.clientId || undefined,

    number: body.number,
    status: body.status ?? "Draft",
    currency: body.currency ?? "USD",
    invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,

    from: hydrateFromOrg(org), // ✅ FULL org snapshot
    billTo: body.billTo ?? undefined,
    lineItems: body.lineItems ?? [],

    taxPercent: body.taxPercent ?? 0,
    paidAmount: body.paidAmount ?? 0,
    notes: body.notes ?? "",

    activity: [{ type: "Created", message: "Invoice created", at: new Date() }],
  });

  recalcTotals(invoice);

  await invoice.save();
  res.status(201).json(invoice);
}

export async function updateInvoice(req: any, res: any) {
  const orgId = req.user?.orgId || req.user?.activeOrgId;
  const invoice = await Invoice.findOne({ _id: req.params.id, orgId });
  if (!invoice) return res.status(404).json({ error: "Not found" });

  const org = await Organization.findById(orgId).lean();
  if (!org) return res.status(404).json({ error: "Org not found" });

  const body = req.body ?? {};

  // standard fields
  if (body.clientId !== undefined) invoice.clientId = body.clientId || undefined;
  if (body.number !== undefined) invoice.number = body.number;
  if (body.status !== undefined) invoice.status = body.status;
  if (body.currency !== undefined) invoice.currency = body.currency;
  if (body.invoiceDate !== undefined) invoice.invoiceDate = new Date(body.invoiceDate);
  if (body.dueDate !== undefined) invoice.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
  if (body.notes !== undefined) invoice.notes = body.notes;

  // billTo/lineItems/tax/paid
  if (body.billTo !== undefined) invoice.billTo = body.billTo || undefined;
  if (body.lineItems !== undefined) invoice.lineItems = body.lineItems || [];
  if (body.taxPercent !== undefined) invoice.taxPercent = Number(body.taxPercent ?? 0);
  if (body.paidAmount !== undefined) invoice.paidAmount = Number(body.paidAmount ?? 0);

  // ✅ ALWAYS re-hydrate from org snapshot on update
  invoice.from = hydrateFromOrg(org);

  recalcTotals(invoice);

  // activity is a Mongoose DocumentArray. Don't overwrite it with [].
  if (!invoice.activity) {
    // In practice this is usually already initialized by schema defaults.
    (invoice as any).activity = [];
  }
  invoice.activity.push({ type: "Updated", message: "Invoice updated", at: new Date() } as any);

  await invoice.save();
  res.json(invoice);
}

export async function deleteInvoice(req: any, res: any) {
  const orgId = req.user?.orgId || req.user?.activeOrgId;
  const result = await Invoice.deleteOne({ _id: req.params.id, orgId });
  res.json({ ok: result.deletedCount === 1 });
}
