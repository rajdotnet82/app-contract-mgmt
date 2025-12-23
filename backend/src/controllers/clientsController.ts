import { Request, Response } from "express";
import ClientModel from "../models/Client";

function cleanString(v: any): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

export async function listClients(req: Request, res: Response) {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED" });

  const { q = "" } = req.query as { q?: string };
  const search = String(q).trim();

  const filter: any = { orgId };

  if (search) {
    // orgId + search
    filter.$and = [
      { orgId },
      {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      },
    ];
    delete filter.orgId;
  }

  const items = await ClientModel.find(filter).sort({ createdAt: -1 });
  res.json(items);
}

export async function getClient(req: Request, res: Response) {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED" });

  const { id } = req.params;
  const item = await ClientModel.findOne({ _id: id, orgId });
  if (!item) return res.status(404).json({ message: "Client not found" });

  res.json(item);
}

export async function createClient(req: Request, res: Response) {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED" });

  const body = req.body ?? {};

  // Do NOT accept orgId from UI — server owns tenant boundary
  const fullName =
    cleanString(body.fullName) ||
    [cleanString(body.firstName), cleanString(body.lastName)].filter(Boolean).join(" ") ||
    "Client";

  const doc = await ClientModel.create({
    orgId,

    fullName,

    firstName: cleanString(body.firstName),
    lastName: cleanString(body.lastName),

    email: cleanString(body.email),
    phone: cleanString(body.phone),

    addressLine1: cleanString(body.addressLine1),
    addressLine2: cleanString(body.addressLine2),
    city: cleanString(body.city),
    state: cleanString(body.state),
    postalCode: cleanString(body.postalCode),
    country: cleanString(body.country),

    notes: body.notes,
  });

  res.status(201).json(doc);
}

export async function updateClient(req: Request, res: Response) {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED" });

  const { id } = req.params;
  const body = req.body ?? {};

  const existing = await ClientModel.findOne({ _id: id, orgId });
  if (!existing) return res.status(404).json({ message: "Client not found" });

  // Update fields (never allow orgId change)
  if (body.fullName !== undefined) existing.fullName = cleanString(body.fullName) || existing.fullName;

  if (body.firstName !== undefined) existing.firstName = cleanString(body.firstName);
  if (body.lastName !== undefined) existing.lastName = cleanString(body.lastName);

  // If fullName not provided but first/last changed, rebuild fullName if it was derived
  if (body.fullName === undefined && (body.firstName !== undefined || body.lastName !== undefined)) {
    const rebuilt = [existing.firstName, existing.lastName].filter(Boolean).join(" ").trim();
    if (rebuilt) existing.fullName = rebuilt;
  }

  if (body.email !== undefined) existing.email = cleanString(body.email);
  if (body.phone !== undefined) existing.phone = cleanString(body.phone);

  if (body.addressLine1 !== undefined) existing.addressLine1 = cleanString(body.addressLine1);
  if (body.addressLine2 !== undefined) existing.addressLine2 = cleanString(body.addressLine2);
  if (body.city !== undefined) existing.city = cleanString(body.city);
  if (body.state !== undefined) existing.state = cleanString(body.state);
  if (body.postalCode !== undefined) existing.postalCode = cleanString(body.postalCode);
  if (body.country !== undefined) existing.country = cleanString(body.country);

  if (body.notes !== undefined) existing.notes = body.notes;

  await existing.save();

  const updated = await ClientModel.findOne({ _id: existing._id, orgId });
  res.json(updated ?? existing);
}

export async function deleteClient(req: Request, res: Response) {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED" });

  const { id } = req.params;

  const deleted = await ClientModel.findOneAndDelete({ _id: id, orgId });
  if (!deleted) return res.status(404).json({ message: "Client not found" });

  res.json({ ok: true });
}

// Optional: wipe all clients in CURRENT org (matches your “delete old data” approach)
export async function purgeClients(req: Request, res: Response) {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED" });

  const result = await ClientModel.deleteMany({ orgId });
  res.json({ ok: true, deletedCount: result.deletedCount ?? 0 });
}
