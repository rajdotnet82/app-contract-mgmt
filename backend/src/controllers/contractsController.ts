import ContractModel from "../models/Contract";

export async function getContracts(req: any, res: any) {
  const contracts = await ContractModel.find().sort({ createdAt: -1 });
  res.json(contracts);
}

export async function createContract(req: any, res: any) {
  const { contractNumber, title, counterparty, status, effectiveDate, expiryDate } = req.body;

  if (!contractNumber || !title || !counterparty) {
    return res.status(400).json({ message: "contractNumber, title, counterparty are required" });
  }

  const created = await ContractModel.create({
    contractNumber,
    title,
    counterparty,
    status,
    effectiveDate,
    expiryDate,
  });

  res.status(201).json(created);
}
