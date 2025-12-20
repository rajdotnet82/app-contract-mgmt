import type { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Organization from "../models/Organization";
import UserOrganization from "../models/UserOrganization";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      activeOrgId?: string;
      auth?: any; // express-oauth2-jwt-bearer sets req.auth
    }
  }
}

export async function attachContext(req: Request, res: Response, next: NextFunction) {
  try {
    const sub = req.auth?.payload?.sub;

    // Prefer your custom claim, but allow standard `email` as a fallback.
    const email =
      req.auth?.payload?.["https://app-contract-mgmt/email"] ??
      req.auth?.payload?.email;

    if (!sub) return res.status(401).json({ error: "Missing auth subject" });
    if (!email) return res.status(401).json({ error: "Missing email in token (add scope/profile)" });

    // 1) ensure user exists
    let user = await User.findOne({ auth0Sub: sub });
    if (!user) user = await User.create({ auth0Sub: sub, email });

    // 2) memberships
    let memberships = await UserOrganization.find({ userId: user._id });

    // 3) if none -> create default org + link user as Owner + set active
    if (memberships.length === 0) {
      const org = await Organization.create({
        name: "My Organization",
        createdByUserId: user._id,
      });

      await UserOrganization.create({ userId: user._id, orgId: org._id, role: "Owner" });

      user.activeOrgId = org._id;
      await user.save();

      req.userId = String(user._id);
      req.activeOrgId = String(org._id);
      return next();
    }

    // 4) active org must be valid
    const active = user.activeOrgId ? String(user.activeOrgId) : null;
    const isValid = active ? memberships.some(m => String(m.orgId) === active) : false;

    if (!isValid) {
      user.activeOrgId = memberships[0].orgId;
      await user.save();
    }

    req.userId = String(user._id);
    req.activeOrgId = String(user.activeOrgId);
    next();
  } catch (e: any) {
    res.status(500).json({ error: "Failed to attach context", detail: e?.message });
  }
}
