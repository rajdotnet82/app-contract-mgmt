import { Router } from "express";
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientsController";

const router = Router();

router.get("/", listClients);
router.get("/:id", getClient);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
