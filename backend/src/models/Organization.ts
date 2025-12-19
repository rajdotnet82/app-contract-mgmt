import mongoose, { Schema, InferSchemaType } from "mongoose";

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export type Organization = InferSchemaType<typeof OrganizationSchema>;
export default mongoose.model("Organization", OrganizationSchema);
