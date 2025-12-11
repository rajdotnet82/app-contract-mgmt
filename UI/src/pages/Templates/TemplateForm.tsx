import { useState } from "react";
import type { Placeholder, PlaceholderType, Template } from "./types";
import RichTextEditor from "../../components/RichTextEditor";

const TYPES: PlaceholderType[] = [
  "text",
  "number",
  "date",
  "time",
  "email",
  "phone",
  "boolean",
  "textarea",
  "select",
];

type Props = {
  initial?: Partial<Template>;
  submitLabel: string;
  onSubmit: (values: Partial<Template>) => Promise<void>;
};

function emptyPlaceholder(): Placeholder {
  return {
    key: "",
    label: "",
    type: "text",
    required: false,
    group: "",
    options: [],
  };
}

export default function TemplateForm({
  initial = {},
  submitLabel,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Partial<Template>>({
    name: "",
    description: "",
    content: "",
    placeholders: [],
    ...initial,
  });

  const placeholders = (values.placeholders ?? []) as Placeholder[];

  function updatePlaceholder(i: number, patch: Partial<Placeholder>) {
    const next = [...placeholders];
    next[i] = { ...next[i], ...patch };
    setValues({ ...values, placeholders: next });
  }

  function addPlaceholder() {
    setValues({
      ...values,
      placeholders: [...placeholders, emptyPlaceholder()],
    });
  }

  function removePlaceholder(i: number) {
    const next = placeholders.filter((_, idx) => idx !== i);
    setValues({ ...values, placeholders: next });
  }

  return (
    <form
      className="space-y-6 rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(values);
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          placeholder="Template Name"
          value={values.name ?? ""}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
        />

        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          placeholder="Short Description (optional)"
          value={values.description ?? ""}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
        />
      </div>

      {/* Rich content */}
      <div>
        <div className="mb-2 text-sm font-medium text-black dark:text-white">
          Template Content
        </div>

        <RichTextEditor
          value={values.content ?? ""}
          placeholder="Write your template here. Use placeholders like {{client1.fullName}}, {{event.weddingDate}}, {{pricing.total}}..."
          onChange={(html) => setValues({ ...values, content: html })}
        />

        <div className="mt-2 text-xs text-gray-500">
          Tip: Use placeholders like{" "}
          <span className="font-medium">{"{{client1.fullName}}"}</span>,{" "}
          <span className="font-medium">{"{{event.weddingDate}}"}</span>,{" "}
          <span className="font-medium">{"{{pricing.total}}"}</span>.
        </div>
      </div>

      {/* Placeholders */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-black dark:text-white">
            Placeholders
          </div>
          <button
            type="button"
            className="rounded-lg border border-stroke px-3 py-1 text-sm dark:border-strokedark"
            onClick={addPlaceholder}
          >
            Add Placeholder
          </button>
        </div>

        <div className="space-y-3">
          {placeholders.length === 0 && (
            <div className="text-sm text-gray-500">
              No placeholders added yet.
            </div>
          )}

          {placeholders.map((p, i) => {
            const type = p.type ?? "text";
            const optionsString = (p.options ?? []).join(", ");

            return (
              <div
                key={i}
                className="rounded-lg border border-stroke p-3 dark:border-strokedark"
              >
                <div className="grid gap-2 md:grid-cols-6">
                  <input
                    className="md:col-span-2 rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
                    placeholder="key (e.g., event.weddingDate)"
                    value={p.key}
                    onChange={(e) =>
                      updatePlaceholder(i, { key: e.target.value })
                    }
                  />
                  <input
                    className="md:col-span-2 rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
                    placeholder="label (e.g., Wedding Date)"
                    value={p.label}
                    onChange={(e) =>
                      updatePlaceholder(i, { label: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
                    placeholder="group (Event)"
                    value={p.group ?? ""}
                    onChange={(e) =>
                      updatePlaceholder(i, { group: e.target.value })
                    }
                  />
                  <select
                    className="rounded-lg border border-stroke bg-transparent px-2 py-2 text-sm dark:border-strokedark"
                    value={type}
                    onChange={(e) =>
                      updatePlaceholder(i, {
                        type: e.currentTarget.value as any,
                      })
                    }
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={p.required ?? false}
                      onChange={(e) =>
                        updatePlaceholder(i, { required: e.target.checked })
                      }
                    />
                    Required
                  </label>

                  {type === "select" && (
                    <input
                      className="w-full md:w-96 rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
                      placeholder="options (comma separated)"
                      value={optionsString}
                      onChange={(e) =>
                        updatePlaceholder(i, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  )}

                  <button
                    type="button"
                    className="ml-auto rounded-lg border border-stroke px-3 py-1 text-sm text-red-600 dark:border-strokedark"
                    onClick={() => removePlaceholder(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
