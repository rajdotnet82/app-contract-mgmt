import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Contract } from "./types";
import { getContractById, updateContract } from "./api";

import type { Template } from "../Templates/types";
import { fetchTemplates, getTemplateById } from "../Templates/api";
import TemplateDrivenFields from "./TemplateDrivenFields";

function money(n?: number) {
  const val = Number(n ?? 0);
  return `$${val.toLocaleString()}`;
}

export default function ContractDetailsPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [item, setItem] = useState<Contract | null>(null);
  const [error, setError] = useState("");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [details, setDetails] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const balanceDue = useMemo(() => {
    if (!item) return 0;
    const total = Number(item.totalPrice ?? 0);
    const retainer = Number(item.retainerAmount ?? 0);
    return Math.max(total - retainer, 0);
  }, [item]);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        setError("");
        const data = await getContractById(id);
        setItem(data);
        setDetails(data.details ?? {});
      } catch {
        setError("Failed to load contract");
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchTemplates({ q: "" });
        setTemplates(list);
      } catch {
        // ignore MVP
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!item?.templateId) return;
      try {
        const t = await getTemplateById(item.templateId);
        setSelectedTemplate(t);
      } catch {
        // ignore MVP
      }
    })();
  }, [item?.templateId]);

  if (!id) {
    return (
      <div className="rounded-2xl border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
        Missing contract id.
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-stroke bg-white p-6 text-red-600 dark:border-strokedark dark:bg-boxdark">
        {error}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-2xl border border-stroke bg-white p-6 text-sm text-gray-500 dark:border-strokedark dark:bg-boxdark">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Contract
          </div>
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            {item.contractNumber}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-lg border border-stroke px-4 py-2 dark:border-strokedark"
            onClick={() => nav("/contracts")}
          >
            Back
          </button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => nav(`/contracts/${item._id}/edit`)}
          >
            Edit Core
          </button>
        </div>
      </div>

      {/* Core details card */}
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Info label="Client" value={item.clientName} />
          <Info label="Event Type" value={item.eventType} />
          <Info
            label="Event Date"
            value={
              item.eventDate
                ? new Date(item.eventDate).toLocaleDateString()
                : "-"
            }
          />
          <Info label="Status" value={item.status} />
          <Info label="Signed" value={item.signed ? "Yes" : "No"} />
          <Info label="Total Price" value={money(item.totalPrice)} />
          <Info label="Retainer" value={money(item.retainerAmount)} />
          <Info label="Balance Due" value={money(balanceDue)} />
        </div>
      </div>

      {/* Template-driven form */}
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Template Fields
          </h2>

          <div className="flex-1" />

          <select
            className="w-full md:w-80 rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
            value={selectedTemplate?._id ?? ""}
            onChange={async (e) => {
              const tid = e.currentTarget.value;
              if (!tid) {
                setSelectedTemplate(null);
                return;
              }
              const found = templates.find((x) => x._id === tid);
              const t = found ?? (await getTemplateById(tid));
              setSelectedTemplate(t);
            }}
          >
            <option value="">Select template...</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!selectedTemplate || saving}
            onClick={async () => {
              if (!selectedTemplate) return;
              setSaving(true);
              try {
                await updateContract(item._id, {
                  templateId: selectedTemplate._id,
                  details,
                });
                const refreshed = await getContractById(item._id);
                setItem(refreshed);
                setDetails(refreshed.details ?? {});
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save Fields"}
          </button>
        </div>

        {!selectedTemplate ? (
          <div className="text-sm text-gray-500">
            Select a template to display its dynamic fields.
          </div>
        ) : (
          <TemplateDrivenFields
            placeholders={selectedTemplate.placeholders ?? []}
            details={details}
            onChange={setDetails}
          />
        )}
      </div>

      {/* Documents placeholder */}
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Documents
          </h2>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => {
              if (!selectedTemplate) {
                alert("Please select a template first.");
                return;
              }
              alert(
                "Draft generation UI is enabled. Next step: wire backend save."
              );
            }}
          >
            Generate Draft
          </button>
        </div>

        <div className="rounded-lg border border-dashed border-stroke p-6 text-sm text-gray-500 dark:border-strokedark">
          This will show document versions generated from templates (and later
          AI).
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-1 text-base text-black dark:text-white">{value}</div>
    </div>
  );
}
