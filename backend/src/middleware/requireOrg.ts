import type { Request, Response, NextFunction } from "express";

export function requireOrg(req: any, res: Response, next: NextFunction) {
  const orgId = req.user?.activeOrgId || req.user?.orgId;
  if (!orgId) {
    return res.status(403).json({
      code: "ORG_REQUIRED",
      message: "Organization setup required",
    });
  }
  next();
}
