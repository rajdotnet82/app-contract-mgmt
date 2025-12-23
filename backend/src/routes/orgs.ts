import { Router } from "express";
import { requireActiveOrg } from "../middleware/requireActiveOrg";
import { createOrg, getActiveOrg, updateActiveOrg } from "../controllers/orgsController";

const router = Router();

// NOTE:
// These routes are mounted under `/api` where `server.ts` already applies:
//   requireAuth (Auth0 JWT) + attachContext (sets req.userId/req.activeOrgId)
// So we don't re-apply requireAuth here.

// ✅ Onboarding endpoint (must work WITHOUT org)
router.post("/", createOrg);

// ✅ Requires org
router.get("/active", requireActiveOrg, getActiveOrg);
router.put("/active", requireActiveOrg, updateActiveOrg);

export default router;
