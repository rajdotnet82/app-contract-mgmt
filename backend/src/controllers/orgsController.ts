import Organization from "../models/Organization";
import User from "../models/User";

export async function createOrg(req: any, res: any) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const name = String(req.body?.name ?? "").trim();
  if (!name) return res.status(400).json({ error: "Organization name is required" });

  const org = await Organization.create({
    name,
    createdByUserId: userId,
    email: req.body?.email,
    phone: req.body?.phone,
    addressLine1: req.body?.addressLine1,
    addressLine2: req.body?.addressLine2,
    city: req.body?.city,
    state: req.body?.state,
    postalCode: req.body?.postalCode,
    country: req.body?.country,
    businessNumber: req.body?.businessNumber,
    website: req.body?.website,
    logoUrl: req.body?.logoUrl,
  });

  await User.findByIdAndUpdate(
    userId,
    {
      $set: { activeOrgId: org._id },
      $addToSet: { orgIds: org._id },
    },
    { new: true }
  );

  return res.status(201).json(org);
}

export async function getActiveOrg(req: any, res: any) {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED", message: "Organization setup required" });

  const org = await Organization.findById(orgId).lean();
  if (!org) return res.status(404).json({ error: "Org not found" });

  return res.json(org);
}

export async function updateActiveOrg(req: any, res: any) {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED", message: "Organization setup required" });

  const patch = req.body ?? {};

  const update: any = {
    name: patch.name,
    email: patch.email,
    phone: patch.phone,
    addressLine1: patch.addressLine1,
    addressLine2: patch.addressLine2,
    city: patch.city,
    state: patch.state,
    postalCode: patch.postalCode,
    country: patch.country,
    businessNumber: patch.businessNumber,
    website: patch.website,
    logoUrl: patch.logoUrl,
  };

  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  const org = await Organization.findByIdAndUpdate(orgId, { $set: update }, { new: true }).lean();
  if (!org) return res.status(404).json({ error: "Org not found" });

  return res.json(org);
}
