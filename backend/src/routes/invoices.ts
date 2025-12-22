import express from "express";
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  purgeInvoices,
} from "../controllers/invoicesController";

const router = express.Router();

router.get("/", listInvoices);

// Must be defined before "/:id"
router.delete("/purge", purgeInvoices);

router.get("/:id", getInvoice);
router.post("/", createInvoice);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

export default router;
