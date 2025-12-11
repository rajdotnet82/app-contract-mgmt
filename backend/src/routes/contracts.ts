import express from "express";
import {
  listContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  generateDraft, // 👈 add this
} from "../controllers/contractsController";

const router = express.Router();

router.get("/", listContracts);
router.get("/:id", getContract);
router.post("/", createContract);
router.put("/:id", updateContract);
router.delete("/:id", deleteContract);

// NEW: generate draft endpoint
router.post("/:id/generate-draft", generateDraft);

export default router;
