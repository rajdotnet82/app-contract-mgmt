import mongoose, { Schema, InferSchemaType } from "mongoose";

const AddressSchema = new Schema(
  {
    line1: { type: String, trim: true, default: "" },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    auth0Sub: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    fullName: { type: String, trim: true },
    activeOrgId: { type: Schema.Types.ObjectId, ref: "Organization", default: null },
    phone: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    address: { type: AddressSchema, default: () => ({}) },
    locale: { type: String, trim: true, default: "en-US" },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema>;
export default mongoose.model("User", UserSchema);
