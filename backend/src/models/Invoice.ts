import mongoose, { Schema, Document, Types } from "mongoose";

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Void";

export interface InvoiceLineItem {
  description: string; // multi-line ok
  rate: number;        // e.g., 200
  qty: number;         // e.g., 2
  amount: number;      // rate * qty (stored for convenience)
}

export interface InvoiceParty {
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  businessNumber?: string; // optional
  logoUrl?: string;        // optional (but you’ll mostly use Organization.logoUrl)
}

export interface InvoiceActivityEntry {
  type: "Created" | "Updated" | "StatusChanged" | "Emailed" | "PdfGenerated" | "PaymentRecorded";
  message?: string;
  at?: Date;
}

export interface Invoice extends Document {
  // Multi-tenant scoping
  orgId?: Types.ObjectId;

  // Links
  fromUserId?: Types.ObjectId;
  clientId?: Types.ObjectId;

  number: string;
  status: InvoiceStatus;

  currency: string; // "USD"
  invoiceDate: Date;
  dueDate?: Date;
  terms?: string;

  // Snapshots
  from: InvoiceParty;
  billTo: InvoiceParty;

  lineItems: InvoiceLineItem[];

  taxPercent?: number;
  subtotal: number;
  taxAmount: number;
  total: number;

  paidAmount: number;
  balanceDue: number;

  notes?: string;

  activity: InvoiceActivityEntry[];

  createdAt?: Date;
  updatedAt?: Date;
}

const LineItemSchema = new Schema<InvoiceLineItem>(
  {
    description: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 0 },
    // ✅ not required — server can compute; prevents validation failures if UI forgets to send it
    amount: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const PartySchema = new Schema<InvoiceParty>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
    businessNumber: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
  },
  { _id: false }
);

const ActivitySchema = new Schema<InvoiceActivityEntry>(
  {
    type: { type: String, required: true },
    message: { type: String, trim: true },
    at: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<Invoice>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },

    fromUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },

    number: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Paid", "Void"],
      default: "Draft",
    },

    currency: { type: String, default: "USD", trim: true },

    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date },
    terms: { type: String, trim: true },

    from: { type: PartySchema, required: true },
    billTo: { type: PartySchema, required: true },

    lineItems: { type: [LineItemSchema], default: [] },

    taxPercent: { type: Number, default: 0, min: 0 },

    subtotal: { type: Number, required: true, min: 0, default: 0 },
    taxAmount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },

    paidAmount: { type: Number, required: true, min: 0, default: 0 },
    balanceDue: { type: Number, required: true, min: 0, default: 0 },

    notes: { type: String },

    activity: { type: [ActivitySchema], default: [] },
  },
  { timestamps: true }
);

// ✅ Uniqueness within org (keeps legacy invoices without orgId unaffected)
InvoiceSchema.index(
  { orgId: 1, number: 1 },
  { unique: true, partialFilterExpression: { orgId: { $exists: true } } }
);

// ✅ Helpful indexes for list/sort screens
InvoiceSchema.index({ orgId: 1, createdAt: -1 });
InvoiceSchema.index({ orgId: 1, invoiceDate: -1 });
InvoiceSchema.index({ orgId: 1, status: 1, dueDate: 1 });

export default mongoose.model<Invoice>("Invoice", InvoiceSchema);
