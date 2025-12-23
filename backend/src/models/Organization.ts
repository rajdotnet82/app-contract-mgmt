import mongoose, { Schema } from "mongoose";

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ Contact info (for Invoice "From")
    email: { type: String },
    phone: { type: String },

    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },

    businessNumber: { type: String },
    website: { type: String },

    logoUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", OrganizationSchema);
