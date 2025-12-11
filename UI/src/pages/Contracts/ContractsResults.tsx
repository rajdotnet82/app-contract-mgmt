import { useNavigate } from "react-router-dom";
import type { Contract, ContractStatus } from "./types";

const STATUSES: ContractStatus[] = [
  "Draft",
  "Sent",
  "Signed",
  "Completed",
  "Cancelled",
];

type Props = {
  items: Contract[];
  loading: boolean;
  error?: string;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: ContractStatus) => Promise<void>;
};

export default function ContractsResults({
  items,
  loading,
  error,
  onDelete,
  onStatusChange,
}: Props) {
  const nav = useNavigate();

  return (
    <div className="rounded-2xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Contracts
        </h2>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => nav("/contracts/new")}
        >
          Add Contract
        </button>
      </div>

      {loading && <div className="py-6 text-sm text-gray-500">Loading...</div>}
      {error && <div className="py-3 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Event Date</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Signed</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-stroke dark:border-strokedark"
                >
                  <td className="px-3 py-2">{c.contractNumber}</td>
                  <td className="px-3 py-2">{c.clientName}</td>
                  <td className="px-3 py-2">{c.eventType}</td>
                  <td className="px-3 py-2">
                    {c.eventDate
                      ? new Date(c.eventDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-3 py-2">
                    <select
                      className="rounded-md border border-stroke bg-transparent px-2 py-1 text-sm dark:border-strokedark"
                      value={c.status}
                      onChange={async (e) => {
                        const next = e.currentTarget.value as ContractStatus;
                        if (next !== c.status) {
                          await onStatusChange(c._id, next);
                        }
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-2">${c.totalPrice ?? 0}</td>
                  <td className="px-3 py-2">{c.signed ? "Yes" : "No"}</td>

                  <td className="px-3 py-2">
                    <div className="flex gap-3">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => nav(`/contracts/${c._id}`)}
                      >
                        View
                      </button>
                      <button
                        className="text-blue-600 underline"
                        onClick={() => nav(`/contracts/${c._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 underline"
                        onClick={async () => {
                          const ok = window.confirm("Delete this contract?");
                          if (ok) await onDelete(c._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-sm text-gray-500" colSpan={8}>
                    No contracts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
