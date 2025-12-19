import { Router } from "express";
import Organization from "../models/Organization";
import UserOrganization from "../models/UserOrganization";
import User from "../models/User";

const router = Router();

router.post("/", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) return res.status(400).json({ error: "name is required" });

  const org = await Organization.create({ name, createdByUserId: req.userId });
  await UserOrganization.create({ userId: req.userId, orgId: org._id, role: "Owner" });

  // make it active immediately
  await User.updateOne({ _id: req.userId }, { $set: { activeOrgId: org._id } });

  res.json({ org: { id: String(org._id), name: org.name } });
});

export default router;
