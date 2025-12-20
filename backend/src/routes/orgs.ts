import { Router } from "express";
import Organization from "../models/Organization";
import UserOrganization from "../models/UserOrganization";
import User from "../models/User";

const router = Router();

function isAdminRole(role?: string) {
  return role === "Owner" || role === "Admin";
}

// GET active org branding (used by InvoicePreview)
router.get("/active", async (req: any, res) => {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(400).json({ error: "Missing active org" });

  // Ensure caller is at least a member of this org
  const membership = await UserOrganization.findOne({ userId: req.userId, orgId }).lean();
  if (!membership) return res.status(403).json({ error: "Organization access required" });

  const org = await Organization.findById(orgId).select("name logoUrl").lean();
  if (!org) return res.status(404).json({ error: "Organization not found" });

  return res.json(org);
});

// GET owners/admins in active org (for invoice "From" dropdown)
router.get("/active/admins", async (req: any, res) => {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(400).json({ error: "Missing active org" });

  // Ensure caller belongs to org
  const caller = await UserOrganization.findOne({ userId: req.userId, orgId }).lean();
  if (!caller) return res.status(403).json({ error: "Organization access required" });

  // Get memberships for Owner/Admin
  const adminMemberships = await UserOrganization.find({
    orgId,
    role: { $in: ["Owner", "Admin"] },
  }).lean();

  const userIds = adminMemberships.map((m: any) => m.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select("fullName email phone address")
    .lean();

  const roleByUserId = new Map<string, string>();
  for (const m of adminMemberships as any[]) {
    roleByUserId.set(String(m.userId), m.role);
  }

  const items = (users as any[])
    .map((u) => ({
      id: String(u._id),
      role: roleByUserId.get(String(u._id)) ?? "Admin",
      fullName: u.fullName ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      address: u.address ?? {},
    }))
    .sort((a, b) => {
      // Owners first
      const ra = a.role === "Owner" ? 0 : 1;
      const rb = b.role === "Owner" ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return (a.fullName || a.email).toLowerCase().localeCompare((b.fullName || b.email).toLowerCase());
    });

  return res.json(items);
});

// Update org name/logoUrl (Owner/Admin only)
router.put("/:orgId", async (req: any, res) => {
  const { orgId } = req.params;
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
  const logoUrl = typeof req.body?.logoUrl === "string" ? req.body.logoUrl.trim() : undefined;

  const membership = await UserOrganization.findOne({ userId: req.userId, orgId }).lean();
  if (!membership || !isAdminRole((membership as any).role)) {
    return res.status(403).json({ error: "Admin access required" });
  }

  const patch: any = {};
  if (name !== undefined) {
    if (name.length < 2) return res.status(400).json({ error: "Organization name is required" });
    patch.name = name;
  }
  if (logoUrl !== undefined) {
    // allow clearing logo
    patch.logoUrl = logoUrl.length ? logoUrl : "";
  }

  const org = await Organization.findByIdAndUpdate(orgId, { $set: patch }, { new: true })
    .select("name logoUrl")
    .lean();

  if (!org) return res.status(404).json({ error: "Organization not found" });

  return res.json({ ok: true, org });
});

export default router;
