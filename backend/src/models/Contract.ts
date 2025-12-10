import mongoose, { Schema, InferSchemaType } from "mongoose";

const ContractSchema = new Schema(
  {
    contractNumber: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Draft", "Active", "Expired", "Terminated"],
      default: "Draft",
    },
    counterparty: { type: String, required: true, trim: true },
    effectiveDate: { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

export type Contract = InferSchemaType<typeof ContractSchema>;

export default mongoose.model("Contract", ContractSchema);
