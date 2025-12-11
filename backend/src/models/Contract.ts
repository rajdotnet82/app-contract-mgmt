import mongoose, { Schema, Document } from "mongoose";

export interface ContractDocumentEntry {
  title: string;
  templateId?: mongoose.Types.ObjectId;
  contentHtml: string;
  status: "Draft" | "Sent" | "Signed";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Contract extends Document {
  contractNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  eventType: string;
  eventDate?: Date;
  status: "Draft" | "Sent" | "Signed" | "Completed" | "Cancelled";
  totalPrice?: number;
  retainerAmount?: number;
  signed: boolean;
  templateId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  documents?: ContractDocumentEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

// NEW: sub-schema for generated docs
const DocumentSchema = new Schema<ContractDocumentEntry>(
  {
    title: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: "Template" },
    contentHtml: { type: String, required: true },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Signed"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

const ContractSchema = new Schema<Contract>(
  {
    contractNumber: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: String,
    clientPhone: String,
    eventType: { type: String, required: true },
    eventDate: Date,
    status: {
      type: String,
      enum: ["Draft", "Sent", "Signed", "Completed", "Cancelled"],
      default: "Draft",
    },
    totalPrice: Number,
    retainerAmount: Number,
    signed: { type: Boolean, default: false },

    templateId: { type: Schema.Types.ObjectId, ref: "Template" },

    details: { type: Schema.Types.Mixed, default: {} },

    // NEW: documents array
    documents: {
      type: [DocumentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<Contract>("Contract", ContractSchema);
