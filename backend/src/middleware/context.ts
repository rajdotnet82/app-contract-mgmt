import type { Request, Response, NextFunction } from "express";
import User from "../models/User";
import UserOrganization from "../models/UserOrganization";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      activeOrgId?: string;
      // NOTE: do NOT redeclare `auth` here.
      // express-oauth2-jwt-bearer already augments Express.Request with:
      //   auth?: VerifyJwtResult
      // Re-declaring it as `any` causes TS2717.
    }
  }
}

export async function attachContext(req: Request, res: Response, next: NextFunction) {
  try {
    const sub = req.auth?.payload?.sub;

    // Prefer your custom claim, but allow standard email as fallback
    const email =
      req.auth?.payload?.["https://app-contract-mgmt/email"] ??
      req.auth?.payload?.email;

    if (!sub) return res.status(401).json({ error: "Missing auth subject" });
    if (!email) return res.status(401).json({ error: "Missing email in token (add scope/profile)" });

    // 1) Ensure user exists
    let user = await User.findOne({ auth0Sub: sub });
    if (!user) {
      user = await User.create({
        auth0Sub: sub,
        email: String(email).toLowerCase(),
      });
    } else if (user.email !== String(email).toLowerCase()) {
      // keep email updated if Auth0 changes it
      user.email = String(email).toLowerCase();
      await user.save();
    }

    // 2) Load memberships
    const memberships = await UserOrganization.find({ userId: user._id }).lean();

    // If user has NO orgs, we do NOT auto-create one.
    // Still set req.userId so onboarding/invite endpoints can work.
    if (memberships.length === 0) {
      req.userId = String(user._id);
      req.activeOrgId = undefined;
      return next();
    }

    // 3) Ensure activeOrgId is valid
    const active = user.activeOrgId ? String(user.activeOrgId) : null;
    const isValid = active ? memberships.some((m: any) => String(m.orgId) === active) : false;

    if (!isValid) {
      user.activeOrgId = memberships[0].orgId;
      await user.save();
    }

    req.userId = String(user._id);
    req.activeOrgId = user.activeOrgId ? String(user.activeOrgId) : undefined;

    return next();
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to attach context", detail: e?.message });
  }
}
