import mongoose, { Schema, Document, Types } from "mongoose";

export interface Client extends Document {
  orgId: Types.ObjectId; // 🔒 required tenant boundary

  fullName: string;
  firstName?: string;
  lastName?: string;

  email?: string;
  phone?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const ClientSchema = new Schema<Client>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },

    fullName: { type: String, required: true, trim: true },

    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },

    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },

    notes: { type: String },
  },
  { timestamps: true }
);

// Helpful indexes for org-scoped search/listing
ClientSchema.index({ orgId: 1, createdAt: -1 });
ClientSchema.index({ orgId: 1, fullName: 1 });
// If you want “unique email per org”, uncomment:
// ClientSchema.index({ orgId: 1, email: 1 }, { unique: true, sparse: true });

export default mongoose.model<Client>("Client", ClientSchema);
