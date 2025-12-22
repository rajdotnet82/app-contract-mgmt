import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { connectDb } from "./src/config/db";
import { requireAuth } from "./src/middleware/auth";
import { attachContext } from "./src/middleware/context";
import { requireActiveOrg } from "./src/middleware/requireActiveOrg";

import meRouter from "./src/routes/me";
import orgsRouter from "./src/routes/orgs";
import invitesRouter from "./src/routes/invites";
import contractsRouter from "./src/routes/contracts";
import templatesRouter from "./src/routes/templates";
import clientsRouter from "./src/routes/clients";
import invoicesRouter from "./src/routes/invoices";
import uploadRoutes from "./src/routes/uploads";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "contract-mgmt-api" });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Protect ALL /api routes consistently
const api = express.Router();
api.use(requireAuth, attachContext);

// Allowed even when org is not set (onboarding / invite acceptance)
api.use("/me", meRouter);
api.use("/orgs", orgsRouter);
api.use("/invites", invitesRouter);

// Everything below requires activeOrgId
api.use(requireActiveOrg);

api.use("/contracts", contractsRouter);
api.use("/templates", templatesRouter);
api.use("/clients", clientsRouter);
api.use("/invoices", invoicesRouter);
api.use("/uploads", uploadRoutes);

app.use("/api", api);

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  await connectDb(process.env.MONGO_URI as string);
  app.listen(PORT, () => console.log(`✅ API on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error("❌ Startup error", err);
  process.exit(1);
});
