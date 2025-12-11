export type PlaceholderType =
  | "text"
  | "number"
  | "date"
  | "time"
  | "email"
  | "phone"
  | "boolean"
  | "textarea"
  | "select";

export type Placeholder = {
  key: string;
  label: string;
  group?: string;
  type?: PlaceholderType;
  required?: boolean;
  options?: string[];
};

export type Template = {
  _id: string;
  name: string;
  description?: string;
  content: string; // HTML from rich editor
  placeholders: Placeholder[];
  createdAt?: string;
  updatedAt?: string;
};

export type TemplateSearchCriteria = {
  q: string;
};
