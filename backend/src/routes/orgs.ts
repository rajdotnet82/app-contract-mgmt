import { Router } from "express";
import Organization from "../models/Organization";
import UserOrganization from "../models/UserOrganization";

const router = Router();

function isOrgAdmin(role?: string) {
  return role === "Owner" || role === "Admin";
}

router.put("/:orgId", async (req, res) => {
  const { orgId } = req.params;
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) return res.status(400).json({ error: "name is required" });

  const membership = await UserOrganization.findOne({
    userId: req.userId,
    orgId,
  }).lean();

  const role = membership?.role;
  const isAdmin = role === "Owner" || role === "Admin";

  if (!membership || !isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  const org = await Organization.findByIdAndUpdate(
    orgId,
    { $set: { name } },
    { new: true }
  ).lean();

  return res.json({ ok: true, org: { id: String(org?._id), name: org?.name ?? "" } });
});

export default router;
