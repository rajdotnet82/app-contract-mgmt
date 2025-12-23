import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrg } from "../middleware/requireOrg";
import { createOrg, getActiveOrg, updateActiveOrg } from "../controllers/orgsController";

const router = Router();

// ✅ Onboarding endpoints (must work WITHOUT org)
router.post("/", requireAuth, createOrg);

// ✅ Requires org
router.get("/active", requireAuth, requireOrg, getActiveOrg);
router.put("/active", requireAuth, requireOrg, updateActiveOrg);

export default router;
