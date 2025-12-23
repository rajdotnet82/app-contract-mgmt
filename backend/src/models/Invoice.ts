// server/src/models/Invoice.ts
import mongoose, { Schema, InferSchemaType } from "mongoose";

const InvoicePartySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },

    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },

    businessNumber: { type: String },
    logoUrl: { type: String },
  },
  { _id: false }
);

const LineItemSchema = new Schema(
  {
    description: { type: String, default: "" },
    rate: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User" },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },

    number: { type: String, required: true },
    status: { type: String, default: "Draft" },

    currency: { type: String, default: "USD" },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date },

    from: { type: InvoicePartySchema, required: true },
    billTo: { type: InvoicePartySchema, required: false },
    lineItems: { type: [LineItemSchema], default: [] },

    taxPercent: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },

    notes: { type: String },

    activity: {
      type: [
        {
          type: { type: String },
          message: { type: String },
          at: { type: Date },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export type InvoiceDoc = InferSchemaType<typeof InvoiceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export default mongoose.model("Invoice", InvoiceSchema);
