import { useState } from "react";
import type { Contract } from "./types";

type Props = {
  initial?: Partial<Contract>;
  submitLabel: string;
  onSubmit: (values: Partial<Contract>) => Promise<void>;
};

export default function ContractForm({
  initial = {},
  submitLabel,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Partial<Contract>>({
    contractNumber: "",
    clientName: "",
    eventType: "",
    eventDate: "",
    status: "Draft",
    totalPrice: 0,
    retainerAmount: 0,
    signed: false,
    ...initial,
  });

  function fieldClass() {
    return "w-full rounded-lg border border-stroke bg-transparent px-3 py-2 dark:border-strokedark";
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
          className={fieldClass()}
          placeholder="Contract #"
          value={values.contractNumber ?? ""}
          onChange={(e) =>
            setValues({ ...values, contractNumber: e.target.value })
          }
          required
        />
        <input
          className={fieldClass()}
          placeholder="Client display name"
          value={values.clientName ?? ""}
          onChange={(e) => setValues({ ...values, clientName: e.target.value })}
          required
        />
        <input
          className={fieldClass()}
          placeholder="Event type (Wedding, Corporate...)"
          value={values.eventType ?? ""}
          onChange={(e) => setValues({ ...values, eventType: e.target.value })}
          required
        />
        <input
          type="date"
          className={fieldClass()}
          value={(values.eventDate as any) ?? ""}
          onChange={(e) => setValues({ ...values, eventDate: e.target.value })}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          type="number"
          className={fieldClass()}
          placeholder="Total price"
          value={values.totalPrice ?? 0}
          onChange={(e) =>
            setValues({ ...values, totalPrice: Number(e.target.value) })
          }
        />
        <input
          type="number"
          className={fieldClass()}
          placeholder="Retainer"
          value={values.retainerAmount ?? 0}
          onChange={(e) =>
            setValues({ ...values, retainerAmount: Number(e.target.value) })
          }
        />
        <select
          className={fieldClass()}
          value={values.status ?? "Draft"}
          onChange={(e) =>
            setValues({ ...values, status: e.currentTarget.value as any })
          }
        >
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Signed">Signed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(values.signed)}
          onChange={(e) => setValues({ ...values, signed: e.target.checked })}
        />
        Mark as signed (manual for now)
      </label>

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
