import { Request, Response } from "express";
import ClientModel from "../models/Client";

const ALLOWED_SORT = new Set(["createdAt", "displayName"]);

export async function listClients(req: Request, res: Response) {
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

  if (q && q.trim()) {
    const s = q.trim();
    filter.$or = [
      { displayName: { $regex: s, $options: "i" } },
      { primaryContactName: { $regex: s, $options: "i" } },
      { primaryEmail: { $regex: s, $options: "i" } },
      { primaryPhone: { $regex: s, $options: "i" } },
      { companyName: { $regex: s, $options: "i" } },
    ];
  }

  const items = await ClientModel.find(filter).sort({ [sortField]: direction });

  res.json(items);
}

export async function getClient(req: Request, res: Response) {
  const { id } = req.params;
  const item = await ClientModel.findById(id);

  if (!item) return res.status(404).json({ message: "Client not found" });

  res.json(item);
}

export async function createClient(req: Request, res: Response) {
  try {
    const {
      clientType,
      displayName,
      primaryContactName,
      primaryEmail,
      primaryPhone,
      partnerName,
      companyName,
      billingName,
      billingEmail,
      billingPhone,
      address,
      secondaryContacts,
      category,
      referralSource,
      communicationPreference,
      instagramHandle,
      preferredLanguage,
      status,
      tags,
      notes,
    } = req.body;

    if (!displayName || !primaryContactName || !primaryEmail) {
      return res.status(400).json({
        message: "displayName, primaryContactName and primaryEmail are required",
      });
    }

    const created = await ClientModel.create({
      clientType,
      displayName,
      primaryContactName,
      primaryEmail,
      primaryPhone,
      partnerName,
      companyName,
      billingName,
      billingEmail,
      billingPhone,
      address,
      secondaryContacts,
      category,
      referralSource,
      communicationPreference,
      instagramHandle,
      preferredLanguage,
      status,
      tags,
      notes,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating client", err);
    res.status(500).json({ message: "Failed to create client" });
  }
}

export async function updateClient(req: Request, res: Response) {
  const { id } = req.params;

  const updated = await ClientModel.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  if (!updated) return res.status(404).json({ message: "Client not found" });

  res.json(updated);
}

export async function deleteClient(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await ClientModel.findByIdAndDelete(id);

  if (!deleted) return res.status(404).json({ message: "Client not found" });

  res.json({ ok: true });
}
