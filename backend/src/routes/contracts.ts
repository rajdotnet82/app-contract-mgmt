import { Router } from "express";
import {
  listContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
} from "../controllers/contractsController";

const router = Router();

router.get("/", listContracts);
router.get("/:id", getContract);
router.post("/", createContract);
router.put("/:id", updateContract);
router.delete("/:id", deleteContract);

export default router;
