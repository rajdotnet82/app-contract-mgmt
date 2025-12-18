import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contractsRouter from "./src/routes/contracts";
import { connectDb } from "./src/config/db";
import templatesRouter from "./src/routes/templates";
import clientsRouter from "./src/routes/clients"; 
import invoicesRouter from "./src/routes/invoices"; 

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "contract-mgmt-api" });
});

app.use("/api/contracts", contractsRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/invoices", invoicesRouter);

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  await connectDb(process.env.MONGO_URI as string);
  app.listen(PORT, () => console.log(`✅ API on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error("❌ Startup error", err);
  process.exit(1);
});
