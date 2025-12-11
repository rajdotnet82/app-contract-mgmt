import { useNavigate } from "react-router-dom";
import TemplateForm from "./TemplateForm";
import { createTemplate } from "./api";

export default function TemplateCreatePage() {
  const nav = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-black dark:text-white">
        Add Template
      </h1>

      <TemplateForm
        submitLabel="Create Template"
        onSubmit={async (values) => {
          await createTemplate(values);
          nav("/templates");
        }}
      />
    </div>
  );
}
