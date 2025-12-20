import mongoose, { Schema, Document } from "mongoose";

export interface Organization extends Document {
  name: string;
  logoUrl?: string;
}

const OrganizationSchema = new Schema<Organization>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<Organization>("Organization", OrganizationSchema);
