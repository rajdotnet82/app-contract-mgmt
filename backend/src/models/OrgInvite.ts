import mongoose, { Schema, InferSchemaType } from "mongoose";

const OrgInviteSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    role: { type: String, enum: ["Admin", "Member"], default: "Member" },

    token: { type: String, required: true, unique: true, index: true },

    status: { type: String, enum: ["pending", "accepted", "revoked", "expired"], default: "pending" },
    expiresAt: { type: Date, required: true, index: true },

    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    acceptedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

OrgInviteSchema.index({ orgId: 1, email: 1, status: 1 });

export type OrgInvite = InferSchemaType<typeof OrgInviteSchema>;
export default mongoose.model("OrgInvite", OrgInviteSchema);
