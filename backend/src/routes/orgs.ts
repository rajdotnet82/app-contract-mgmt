import { Router } from "express";
import crypto from "crypto";
import Organization from "../models/Organization";
import UserOrganization from "../models/UserOrganization";
import User from "../models/User";
import OrgInvite from "../models/OrgInvite";

const router = Router();

function isAdminRole(role?: string) {
  return role === "Owner" || role === "Admin";
}

/**
 * ✅ Onboarding: Create an Organization.
 * Allowed even when user has no activeOrgId yet.
 *
 * POST /api/orgs
 * body: { name: string }
 */
router.post("/", async (req: any, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

  if (!req.userId) return res.status(401).json({ error: "Missing user context" });
  if (!name || name.length < 2) return res.status(400).json({ error: "Organization name is required" });

  const org = await Organization.create({ name });

  // Create membership as Owner
  await UserOrganization.create({
    userId: req.userId,
    orgId: org._id,
    role: "Owner",
  });

  // Set active org
  await User.updateOne({ _id: req.userId }, { $set: { activeOrgId: org._id } });

  return res.status(201).json({
    ok: true,
    org: { id: String(org._id), name: org.name, logoUrl: (org as any).logoUrl ?? "" },
    activeOrgId: String(org._id),
  });
});

// GET active org branding (used by InvoicePreview)
router.get("/active", async (req: any, res) => {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED", message: "Organization setup required" });

  const org = await Organization.findById(orgId).select("name logoUrl").lean();
  if (!org) return res.status(404).json({ error: "Organization not found" });

  return res.json({ id: String(orgId), name: org.name, logoUrl: (org as any).logoUrl ?? "" });
});

// Get active org admins for "Invoice From" dropdown
router.get("/active/admins", async (req: any, res) => {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED", message: "Organization setup required" });

  const memberships = await UserOrganization.find({ orgId }).lean();
  const userIds = memberships.map((m: any) => m.userId);

  const users = await User.find({ _id: { $in: userIds } }).lean();

  const items = memberships
    .map((m: any) => {
      const u = users.find((x: any) => String(x._id) === String(m.userId));
      if (!u) return null;
      return {
        id: String(u._id),
        role: m.role,
        fullName: u.fullName ?? "",
        email: u.email,
        phone: u.phone ?? "",
        address: u.address ?? {},
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const ra = a.role === "Owner" ? 0 : 1;
      const rb = b.role === "Owner" ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return (a.fullName || a.email).toLowerCase().localeCompare((b.fullName || b.email).toLowerCase());
    });

  return res.json(items);
});

/**
 * ✅ Admin creates invite for active org
 * POST /api/orgs/active/invites
 * body: { email: string, role?: "Admin"|"Member" }
 */
router.post("/active/invites", async (req: any, res) => {
  const orgId = req.activeOrgId;
  if (!orgId) return res.status(403).json({ code: "ORG_REQUIRED", message: "Organization setup required" });
  if (!req.userId) return res.status(401).json({ error: "Missing user context" });

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const role = req.body?.role === "Admin" ? "Admin" : "Member";

  if (!email || !email.includes("@")) return res.status(400).json({ error: "Valid email is required" });

  // Ensure inviter is admin in this org
  const membership = await UserOrganization.findOne({ userId: req.userId, orgId }).lean();
  if (!membership || !isAdminRole((membership as any).role)) {
    return res.status(403).json({ error: "Admin access required" });
  }

  // Create token + expiry
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await OrgInvite.create({
    orgId,
    email,
    role,
    token,
    status: "pending",
    expiresAt,
    createdByUserId: req.userId,
  });

  // UI can build the link using token (or backend can include an ENV-based baseUrl later)
  return res.status(201).json({
    ok: true,
    invite: {
      id: String(invite._id),
      token: invite.token,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
    },
  });
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
    patch.logoUrl = logoUrl.length ? logoUrl : "";
  }

  const org = await Organization.findByIdAndUpdate(orgId, { $set: patch }, { new: true })
    .select("name logoUrl")
    .lean();

  if (!org) return res.status(404).json({ error: "Organization not found" });

  return res.json({ ok: true, org });
});

export default router;
