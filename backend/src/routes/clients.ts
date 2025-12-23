import express from "express";
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  purgeClients,
} from "../controllers/clientsController";

const router = express.Router();

router.get("/", listClients);

// keep before "/:id"
router.delete("/purge", purgeClients);

router.get("/:id", getClient);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
