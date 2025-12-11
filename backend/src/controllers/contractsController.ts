import { Request, Response } from "express";
import ContractModel from "../models/Contract";
import TemplateModel from "../models/Template";

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

// --- Helpers for draft generation ---

function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

function renderTemplate(content: string, data: any): string {
  if (!content) return "";
  return content.replace(/{{\s*([\w.]+)\s*}}/g, (_match, rawPath: string) => {
    const path = rawPath.trim();
    const value = getByPath(data, path);
    return value != null ? String(value) : "";
  });
}

// --- Generate Draft ---

export async function generateDraft(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { templateId, details } = req.body as {
      templateId: string;
      details: Record<string, any>;
    };

    if (!templateId) {
      return res.status(400).json({ message: "templateId is required" });
    }

    const contract = await ContractModel.findById(id);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const template = await TemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Update contract with latest template & details
    (contract as any).templateId = template._id;
    (contract as any).details = details ?? (contract as any).details ?? {};

    const contractObj = contract.toObject();
    const mergedContext = {
      ...contractObj,
      ...(details ?? contractObj.details ?? {}),
    };

    const contentHtml = renderTemplate(template.content ?? "", mergedContext);

    // Ensure documents array exists (requires documents in Contract schema)
    const docs = (contract as any).documents ?? [];
    docs.push({
      title: template.name,
      templateId: template._id,
      contentHtml,
      status: "Draft",
    });
    (contract as any).documents = docs;

    await contract.save();

    const updated = await ContractModel.findById(contract._id);

    return res.json(updated ?? contract);
  } catch (err) {
    console.error("Error generating draft", err);
    return res.status(500).json({ message: "Failed to generate draft" });
  }
}
