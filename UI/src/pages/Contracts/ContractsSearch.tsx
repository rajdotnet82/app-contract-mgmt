import type { SearchCriteria, ContractStatus } from "./types";

const STATUSES: ContractStatus[] = [
  "Draft",
  "Sent",
  "Signed",
  "Completed",
  "Cancelled",
];

type Props = {
  value: SearchCriteria;
  onChange: (next: SearchCriteria) => void;
  onClear: () => void;
};

export default function ContractsSearch({ value, onChange, onClear }: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
          placeholder="Search client, contract #, event type..."
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
        />

        <select
          className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
          value={value.status ?? ""}
          onChange={(e) =>
            onChange({ ...value, status: e.target.value as any })
          }
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            type="button"
            onClick={() => onChange({ ...value })}
          >
            Search
          </button>
          <button
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            type="button"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
