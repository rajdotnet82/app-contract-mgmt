// server/src/routes/invoices.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoicesController";

const router = Router();

router.get("/", requireAuth, listInvoices);
router.get("/:id", requireAuth, getInvoice);
router.post("/", requireAuth, createInvoice);
router.put("/:id", requireAuth, updateInvoice);
router.delete("/:id", requireAuth, deleteInvoice);

export default router;
