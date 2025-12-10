import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "contract-mgmt-api" });
});

type ContractListItem = {
  id: string;
  title: string;
  status: "Draft" | "Active" | "Expired";
  counterparty: string;
};

const dummyContracts: ContractListItem[] = [
  {
    id: "C-1001",
    title: "Photography Services Agreement",
    status: "Draft",
    counterparty: "Acme Corp",
  },
  {
    id: "C-1002",
    title: "Software Consulting SOW",
    status: "Active",
    counterparty: "Northwind",
  },
];

app.get("/api/contracts", (req, res) => {
  res.json(dummyContracts);
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
