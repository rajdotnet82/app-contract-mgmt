import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContract } from "./api"; // existing
import { generateDraft } from "./api"; // NEW
import { Contract } from "./types";
import { listTemplates } from "../Templates/api";
import { Template } from "../Templates/types";
import TemplateDrivenFields from "./TemplateDrivenFields";

export default function ContractDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<Contract | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | "">("");
  const [details, setDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false); // NEW

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const [contract, templatesData] = await Promise.all([
          getContract(id),
          listTemplates({}),
        ]);

        setItem(contract);
        setTemplates(templatesData);

        setDetails(contract.details ?? {});

        if (contract.templateId) {
          setSelectedTemplateId(String(contract.templateId));
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  if (loading || !item) {
    return <div>Loading…</div>;
  }

  const latestDocument =
    item.documents && item.documents.length > 0
      ? item.documents[item.documents.length - 1]
      : undefined;

  return (
    <div className="space-y-6">
      {/* ... your existing contract summary header ... */}

      {/* TEMPLATE SELECTION */}
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col">
            <label className="text-sm font-medium text-gray-700">
              Template
            </label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
              value={selectedTemplateId ?? ""}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              <option value="">Select a template</option>
              {templates.map((tpl) => (
                <option key={tpl._id} value={tpl._id}>
                  {tpl.name}
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <p className="mt-1 text-xs text-gray-500">
                {selectedTemplate.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {/* Save template + fields button you already had */}
            <button
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              disabled={!selectedTemplate || saving}
              onClick={async () => {
                if (!selectedTemplate || !item) return;
                setSaving(true);
                try {
                  // your existing updateContract call here (if you already have it)
                  // e.g., const updated = await updateContract(item._id, {
                  //   templateId: selectedTemplate._id,
                  //   details,
                  // });
                  // setItem(updated);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving…" : "Save Template & Fields"}
            </button>

            {/* NEW: Generate Draft */}
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedTemplate || savingDraft}
              onClick={async () => {
                if (!selectedTemplate || !item) {
                  alert("Please select a template first.");
                  return;
                }
                setSavingDraft(true);
                try {
                  const updated = await generateDraft(item._id, {
                    templateId: selectedTemplate._id,
                    details,
                  });
                  setItem(updated);
                  // Keep local details in sync with what backend persisted
                  setDetails(updated.details ?? details);
                } catch (err) {
                  console.error(err);
                  alert("Failed to generate draft.");
                } finally {
                  setSavingDraft(false);
                }
              }}
            >
              {savingDraft ? "Generating…" : "Generate Draft"}
            </button>
          </div>
        </div>

        {/* Dynamic fields driven by the template */}
        {selectedTemplate && (
          <div className="mt-4">
            <TemplateDrivenFields
              placeholders={selectedTemplate.placeholders}
              details={details}
              onChange={setDetails}
            />
          </div>
        )}
      </div>

      {/* DOCUMENT PREVIEW */}
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 text-sm font-medium text-gray-700">
          Generated Contract Draft
        </h2>

        {!latestDocument && (
          <p className="text-sm text-gray-500">
            No draft generated yet. Fill in the fields above and click{" "}
            <span className="font-semibold">Generate Draft</span>.
          </p>
        )}

        {latestDocument && (
          <>
            <div className="mb-2 text-xs text-gray-500">
              {latestDocument.title} •{" "}
              {latestDocument.createdAt &&
                new Date(latestDocument.createdAt).toLocaleString()}
            </div>
            <div
              className="prose max-w-none rounded-md border bg-gray-50 p-4 text-sm"
              // ⚠️ This is expected for HTML preview. Content comes from your template + data.
              dangerouslySetInnerHTML={{ __html: latestDocument.contentHtml }}
            />
          </>
        )}
      </div>
    </div>
  );
}
