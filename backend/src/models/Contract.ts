import mongoose, { Schema, InferSchemaType } from "mongoose";

const ContractSchema = new Schema(
  {
    // --- your existing core fields ---
    contractNumber: { type: String, required: true },
    clientName: { type: String, required: true },
    eventType: { type: String, required: true },
    eventDate: { type: Date },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Signed", "Completed", "Cancelled"],
      default: "Draft",
    },
    totalPrice: { type: Number },
    retainerAmount: { type: Number },
    signed: { type: Boolean, default: false },

    // --- new ---
    templateId: { type: Schema.Types.ObjectId, ref: "Template" },

    // Flexible data bucket for long-form inputs
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type Contract = InferSchemaType<typeof ContractSchema>;
export default mongoose.model("Contract", ContractSchema);
