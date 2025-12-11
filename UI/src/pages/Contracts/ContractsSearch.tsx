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
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="w-full md:w-96 rounded-lg border border-stroke bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-strokedark"
          placeholder="Search by client, contract #, event..."
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
        />

        <select
          className="w-full md:w-56 rounded-lg border border-stroke bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-strokedark"
          value={value.status ?? ""}
          onChange={(e) =>
            onChange({ ...value, status: e.currentTarget.value as any })
          }
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="rounded-lg border border-stroke px-4 py-2 dark:border-strokedark"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
