import { Request, Response } from "express";
import ContractModel from "../models/Contract";

const ALLOWED_SORT = new Set(["createdAt", "eventDate"]);

export async function listContracts(req: Request, res: Response) {
  const {
    q = "",
    status,
    sortBy = "createdAt",
    sortDir = "desc",
  } = req.query as {
    q?: string;
    status?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  };

  const sortField = ALLOWED_SORT.has(sortBy) ? sortBy : "createdAt";
  const direction = sortDir === "asc" ? 1 : -1;

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (q.trim()) {
    const s = q.trim();
    filter.$or = [
      { contractNumber: { $regex: s, $options: "i" } },
      { clientName: { $regex: s, $options: "i" } },
      { eventType: { $regex: s, $options: "i" } },
      { packageName: { $regex: s, $options: "i" } },
    ];
  }

  const items = await ContractModel.find(filter).sort({ [sortField]: direction });

  res.json(items);
}

export async function getContract(req: Request, res: Response) {
  const { id } = req.params;
  const item = await ContractModel.findById(id);

  if (!item) return res.status(404).json({ message: "Contract not found" });

  res.json(item);
}

export async function createContract(req: Request, res: Response) {
  const {
    contractNumber,
    clientName,
    eventType,
    eventDate,
    status,
    packageName,
    totalPrice,
    retainerAmount,
    signed,
  } = req.body;

  if (!contractNumber || !clientName || !eventType) {
    return res.status(400).json({
      message: "contractNumber, clientName, and eventType are required",
    });
  }

  const created = await ContractModel.create({
    contractNumber,
    clientName,
    eventType,
    eventDate,
    status,
    packageName,
    totalPrice,
    retainerAmount,
    signed,
  });

  res.status(201).json(created);
}

export async function updateContract(req: Request, res: Response) {
  const { id } = req.params;

  const updated = await ContractModel.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  if (!updated) return res.status(404).json({ message: "Contract not found" });

  res.json(updated);
}

export async function deleteContract(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await ContractModel.findByIdAndDelete(id);

  if (!deleted) return res.status(404).json({ message: "Contract not found" });

  res.json({ ok: true });
}
