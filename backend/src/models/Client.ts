import mongoose, { Schema, InferSchemaType } from "mongoose";

const SecondaryContactSchema = new Schema(
  {
    name: { type: String, trim: true },
    role: { type: String, trim: true }, // Bride, Groom, Parent, Planner, etc.
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const ClientSchema = new Schema(
  {
    // Core identity
    clientType: {
      type: String,
      enum: ["individual", "couple", "business"],
      default: "individual",
    },
    // How you see them in UI: "Priya & Arjun", "Google – Events Team"
    displayName: { type: String, required: true, trim: true },

    primaryContactName: { type: String, required: true, trim: true },
    primaryEmail: { type: String, required: true, trim: true },
    primaryPhone: { type: String, trim: true },

    // Optional extra fields
    partnerName: { type: String, trim: true }, // for couples
    companyName: { type: String, trim: true }, // for business clients

    // Billing & address
    billingName: { type: String, trim: true },
    billingEmail: { type: String, trim: true },
    billingPhone: { type: String, trim: true },
    address: { type: AddressSchema },

    // Additional contacts (parents, planners, siblings, etc.)
    secondaryContacts: { type: [SecondaryContactSchema], default: [] },

    // Photography / event profile
    category: { type: String, trim: true }, // Wedding, Family, Corporate...
    referralSource: { type: String, trim: true }, // Google, Instagram, Bark...
    communicationPreference: { type: String, trim: true }, // WhatsApp, Text, Email
    instagramHandle: { type: String, trim: true },
    preferredLanguage: { type: String, trim: true },

    // CRM-style fields
    status: {
      type: String,
      enum: ["Lead", "Active", "Past", "VIP", "Cold"],
      default: "Lead",
    },
    tags: { type: [String], default: [] },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export type Client = InferSchemaType<typeof ClientSchema>;
export default mongoose.model("Client", ClientSchema);
