import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TemplateForm from "./TemplateForm";
import type { Template } from "./types";
import { getTemplateById, updateTemplate } from "./api";

export default function TemplateEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [initial, setInitial] = useState<Partial<Template> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const data = await getTemplateById(id);
        setInitial(data);
      } catch {
        setError("Failed to load template");
      }
    })();
  }, [id]);

  if (!id) return null;

  if (error) {
    return (
      <div className="rounded-2xl border border-stroke bg-white p-6 text-red-600 dark:border-strokedark dark:bg-boxdark">
        {error}
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="rounded-2xl border border-stroke bg-white p-6 text-sm text-gray-500 dark:border-strokedark dark:bg-boxdark">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-black dark:text-white">
        Edit Template
      </h1>

      <TemplateForm
        initial={initial}
        submitLabel="Save Changes"
        onSubmit={async (values) => {
          await updateTemplate(id, values);
          nav("/templates");
        }}
      />
    </div>
  );
}
