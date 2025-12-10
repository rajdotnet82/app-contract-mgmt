import type { Contract, ContractStatus } from "./types";
import { useState } from "react";

const STATUSES: ContractStatus[] = [
  "Draft",
  "Sent",
  "Signed",
  "Completed",
  "Cancelled",
];

type Props = {
  initial?: Partial<Contract>;
  onSubmit: (values: Partial<Contract>) => Promise<void>;
  submitLabel: string;
};

export default function ContractForm({
  initial = {},
  onSubmit,
  submitLabel,
}: Props) {
  const [values, setValues] = useState<Partial<Contract>>({
    contractNumber: "",
    clientName: "",
    eventType: "",
    status: "Draft",
    totalPrice: 0,
    retainerAmount: 0,
    signed: false,
    ...initial,
  });

  return (
    <form
      className="grid gap-4 rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(values);
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          placeholder="Contract # (e.g., PH-0001)"
          value={values.contractNumber ?? ""}
          onChange={(e) =>
            setValues({ ...values, contractNumber: e.target.value })
          }
        />
        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          placeholder="Client Name"
          value={values.clientName ?? ""}
          onChange={(e) => setValues({ ...values, clientName: e.target.value })}
        />
        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          placeholder="Event Type (Wedding, Corporate, etc.)"
          value={values.eventType ?? ""}
          onChange={(e) => setValues({ ...values, eventType: e.target.value })}
        />
        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          type="date"
          value={
            values.eventDate
              ? new Date(values.eventDate).toISOString().slice(0, 10)
              : ""
          }
          onChange={(e) => setValues({ ...values, eventDate: e.target.value })}
        />

        <select
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          value={values.status ?? "Draft"}
          onChange={(e) =>
            setValues({ ...values, status: e.target.value as any })
          }
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          placeholder="Package Name (optional)"
          value={values.packageName ?? ""}
          onChange={(e) =>
            setValues({ ...values, packageName: e.target.value })
          }
        />

        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          type="number"
          placeholder="Total Price"
          value={values.totalPrice ?? 0}
          onChange={(e) =>
            setValues({ ...values, totalPrice: Number(e.target.value) })
          }
        />
        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark"
          type="number"
          placeholder="Retainer Amount"
          value={values.retainerAmount ?? 0}
          onChange={(e) =>
            setValues({ ...values, retainerAmount: Number(e.target.value) })
          }
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(values.signed)}
          onChange={(e) => setValues({ ...values, signed: e.target.checked })}
        />
        <span className="text-sm">Signed</span>
      </label>

      <div>
        <button className="rrounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
