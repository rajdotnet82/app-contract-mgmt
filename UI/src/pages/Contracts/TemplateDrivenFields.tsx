import type { Placeholder } from "../Templates/types";

type Props = {
  placeholders: Placeholder[];
  details: Record<string, any>;
  onChange: (nextDetails: Record<string, any>) => void;
};

function getByPath(obj: any, path: string) {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setByPath(obj: any, path: string, value: any) {
  const keys = path.split(".");
  const copy = { ...(obj ?? {}) };
  let cur: any = copy;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = cur[k] && typeof cur[k] === "object" ? { ...cur[k] } : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return copy;
}

function inputClass() {
  return "w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark";
}

export default function TemplateDrivenFields({
  placeholders,
  details,
  onChange,
}: Props) {
  const groups = new Map<string, Placeholder[]>();
  placeholders.forEach((p) => {
    const g = p.group?.trim() || "General";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(p);
  });

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([groupName, items]) => (
        <div
          key={groupName}
          className="rounded-xl border border-stroke p-4 dark:border-strokedark"
        >
          <h3 className="mb-3 text-base font-semibold text-black dark:text-white">
            {groupName}
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            {items.map((p) => {
              const type = p.type ?? "text";
              const value = getByPath(details, p.key);

              const label = (
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {p.label}{" "}
                  {p.required ? <span className="text-red-500">*</span> : null}
                </label>
              );

              if (type === "textarea") {
                return (
                  <div key={p.key}>
                    {label}
                    <textarea
                      className={inputClass() + " min-h-[90px]"}
                      value={value ?? ""}
                      onChange={(e) =>
                        onChange(
                          setByPath(details, p.key, e.currentTarget.value)
                        )
                      }
                    />
                  </div>
                );
              }

              if (type === "boolean") {
                return (
                  <div key={p.key} className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) =>
                        onChange(
                          setByPath(details, p.key, e.currentTarget.checked)
                        )
                      }
                    />
                    <span className="text-sm text-black dark:text-white">
                      {p.label}
                    </span>
                  </div>
                );
              }

              if (type === "select") {
                return (
                  <div key={p.key}>
                    {label}
                    <select
                      className={inputClass()}
                      value={value ?? ""}
                      onChange={(e) =>
                        onChange(
                          setByPath(details, p.key, e.currentTarget.value)
                        )
                      }
                    >
                      <option value="">Select...</option>
                      {(p.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              const htmlType =
                type === "date"
                  ? "date"
                  : type === "time"
                  ? "time"
                  : type === "email"
                  ? "email"
                  : type === "number"
                  ? "number"
                  : "text";

              return (
                <div key={p.key}>
                  {label}
                  <input
                    type={htmlType}
                    className={inputClass()}
                    value={value ?? ""}
                    onChange={(e) =>
                      onChange(setByPath(details, p.key, e.currentTarget.value))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
