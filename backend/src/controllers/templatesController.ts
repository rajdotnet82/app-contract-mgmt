import { Request, Response } from "express";
import TemplateModel from "../models/Template";

export async function listTemplates(req: Request, res: Response) {
  const { q = "" } = req.query as { q?: string };

  const filter: any = {};
  if (q.trim()) {
    const s = q.trim();
    filter.$or = [
      { name: { $regex: s, $options: "i" } },
      { description: { $regex: s, $options: "i" } },
    ];
  }

  const items = await TemplateModel.find(filter).sort({ updatedAt: -1 });
  res.json(items);
}

export async function getTemplate(req: Request, res: Response) {
  const { id } = req.params;

  const item = await TemplateModel.findById(id);
  if (!item) return res.status(404).json({ message: "Template not found" });

  res.json(item);
}

export async function createTemplate(req: Request, res: Response) {
  const { name, description, content, placeholders } = req.body;

  if (!name || !content) {
    return res.status(400).json({ message: "name and content are required" });
  }

  const created = await TemplateModel.create({
    name,
    description,
    content,
    placeholders: Array.isArray(placeholders) ? placeholders : [],
  });

  res.status(201).json(created);
}

export async function updateTemplate(req: Request, res: Response) {
  const { id } = req.params;

  const updated = await TemplateModel.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  if (!updated) return res.status(404).json({ message: "Template not found" });
  res.json(updated);
}

export async function deleteTemplate(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await TemplateModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Template not found" });

  res.json({ ok: true });
}

