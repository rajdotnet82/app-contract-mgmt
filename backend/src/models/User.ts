import mongoose, { Schema, InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    auth0Sub: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    fullName: { type: String, trim: true },
    activeOrgId: { type: Schema.Types.ObjectId, ref: "Organization", default: null },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema>;
export default mongoose.model("User", UserSchema);
