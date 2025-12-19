import { Router } from "express";
import User from "../models/User";
import UserOrganization from "../models/UserOrganization";
import Organization from "../models/Organization";

const router = Router();

router.get("/", async (req, res) => {
  const user = await User.findById(req.userId).lean();
  const memberships = await UserOrganization.find({ userId: req.userId }).lean();
  const orgIds = memberships.map(m => m.orgId);

  const orgs = await Organization.find({ _id: { $in: orgIds } }).lean();

  const orgsWithRole = orgs.map(o => {
    const m = memberships.find(x => String(x.orgId) === String(o._id));
    return { id: String(o._id), name: o.name, role: m?.role ?? "Member" };
  });

  res.json({
    user: {
      id: String(user?._id),
      email: user?.email,
      fullName: user?.fullName ?? "",
      activeOrgId: String(user?.activeOrgId),
    },
    orgs: orgsWithRole,
  });
});

router.post("/active-org", async (req, res) => {
  const { orgId } = req.body || {};
  if (!orgId) return res.status(400).json({ error: "orgId is required" });

  const membership = await UserOrganization.findOne({ userId: req.userId, orgId });
  if (!membership) return res.status(403).json({ error: "Not a member of that org" });

  await User.updateOne({ _id: req.userId }, { $set: { activeOrgId: orgId } });
  res.json({ ok: true, activeOrgId: orgId });
});

export default router;
