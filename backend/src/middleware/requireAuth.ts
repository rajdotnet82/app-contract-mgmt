import type { Request, Response, NextFunction } from "express";

/**
 * NOTE:
 * - This middleware should ONLY authenticate and populate req.user.
 * - DO NOT enforce org membership here.
 *
 * Replace the "TODO" section with your existing JWT/Auth0 verification logic.
 */
export async function requireAuth(req: any, res: Response, next: NextFunction) {
  try {
    // ✅ TODO: Replace with your actual auth verification
    // Example shape we need downstream:
    // req.user = { _id: "<mongoUserId>", email: "...", activeOrgId?: "<orgId>" }

    if (!req.user) {
      // If you currently attach req.user in another middleware, remove this check.
      // Otherwise, do your JWT verify here and set req.user.
      return res.status(401).json({ error: "Unauthorized" });
    }

    return next();
  } catch (err: any) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
