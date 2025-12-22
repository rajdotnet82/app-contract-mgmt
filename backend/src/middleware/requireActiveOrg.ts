import type { Request, Response, NextFunction } from "express";

export function requireActiveOrg(req: Request, res: Response, next: NextFunction) {
  if (!req.activeOrgId) {
    return res.status(403).json({
      code: "ORG_REQUIRED",
      message: "Organization setup required",
    });
  }
  return next();
}
