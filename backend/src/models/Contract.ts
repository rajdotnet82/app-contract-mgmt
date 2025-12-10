import mongoose, { Schema, InferSchemaType } from "mongoose";

const ContractSchema = new Schema(
  {
    contractNumber: { type: String, required: true, unique: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: false },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Signed", "Completed", "Cancelled"],
      default: "Draft",
    },

    packageName: { type: String, trim: true },
    totalPrice: { type: Number, default: 0 },
    retainerAmount: { type: Number, default: 0 },
    signed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type Contract = InferSchemaType<typeof ContractSchema>;
export default mongoose.model("Contract", ContractSchema);
