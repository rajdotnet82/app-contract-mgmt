import mongoose, { Schema, InferSchemaType } from "mongoose";

const UserOrganizationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    role: { type: String, enum: ["Owner", "Admin", "Member"], default: "Owner" },
  },
  { timestamps: true }
);

UserOrganizationSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export type UserOrganization = InferSchemaType<typeof UserOrganizationSchema>;
export default mongoose.model("UserOrganization", UserOrganizationSchema);
