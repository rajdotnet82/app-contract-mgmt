import { Router } from "express";
import OrgInvite from "../models/OrgInvite";
import Organization from "../models/Organization";
import User from "../models/User";
import UserOrganization from "../models/UserOrganization";

const router = Router();

// GET invite details (requires login because /api is protected globally)
router.get("/:token", async (req: any, res) => {
  const { token } = req.params;

  const invite = await OrgInvite.findOne({ token }).lean();
  if (!invite) return res.status(404).json({ error: "Invite not found" });

  // Expire if needed
  if (invite.status === "pending" && invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
    await OrgInvite.updateOne({ _id: invite._id }, { $set: { status: "expired" } });
    return res.status(400).json({ error: "Invite expired", status: "expired" });
  }

  const org = await Organization.findById(invite.orgId).select("name logoUrl").lean();
  if (!org) return res.status(404).json({ error: "Organization not found" });

  return res.json({
    token,
    status: invite.status,
    expiresAt: invite.expiresAt,
    email: invite.email,
    role: invite.role,
    org: {
      id: String(invite.orgId),
      name: org.name,
      logoUrl: (org as any).logoUrl ?? "",
    },
  });
});

// POST accept invite
router.post("/:token/accept", async (req: any, res) => {
  const { token } = req.params;

  const invite = await OrgInvite.findOne({ token });
  if (!invite) return res.status(404).json({ error: "Invite not found" });

  // expire check
  if (invite.status === "pending" && invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    invite.status = "expired";
    await invite.save();
    return res.status(400).json({ error: "Invite expired" });
  }

  if (invite.status !== "pending") {
    return res.status(400).json({ error: `Invite is not usable (status=${invite.status})` });
  }

  if (!req.userId) return res.status(401).json({ error: "Missing user context" });

  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ error: "User not found" });

  // ✅ SECURITY: invite is bound to email
  if (String(user.email).toLowerCase() !== String(invite.email).toLowerCase()) {
    return res.status(403).json({
      error: "Invite email does not match your login email",
    });
  }

  // Create membership (idempotent)
  try {
    await UserOrganization.updateOne(
      { userId: user._id, orgId: invite.orgId },
      { $setOnInsert: { role: invite.role } },
      { upsert: true }
    );
  } catch {
    // ignore duplicate key in rare race conditions
  }

  // Set active org
  await User.updateOne({ _id: user._id }, { $set: { activeOrgId: invite.orgId } });

  // Mark invite accepted
  invite.status = "accepted";
  invite.acceptedByUserId = user._id as any;
  invite.acceptedAt = new Date();
  await invite.save();

  return res.json({
    ok: true,
    orgId: String(invite.orgId),
    role: invite.role,
  });
});

export default router;
