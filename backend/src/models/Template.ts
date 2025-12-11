import mongoose, { Schema, InferSchemaType } from "mongoose";

const PlaceholderSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },   // "event.weddingDate"
    label: { type: String, required: true, trim: true }, // "Wedding Date"

    group: { type: String, trim: true },                 // "Event"
    type: {
      type: String,
      default: "text",
      enum: [
        "text",
        "number",
        "date",
        "time",
        "email",
        "phone",
        "boolean",
        "textarea",
        "select",
      ],
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },            // for select
  },
  { _id: false }
);

const TemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // HTML from rich text editor
    content: { type: String, required: true },

    placeholders: { type: [PlaceholderSchema], default: [] },
  },
  { timestamps: true }
);

export type Template = InferSchemaType<typeof TemplateSchema>;
export default mongoose.model("Template", TemplateSchema);
