import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContractForm from "./ContractForm";
import type { Contract } from "./types";
import { getContractById, updateContract } from "./api";

export default function ContractEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [initial, setInitial] = useState<Partial<Contract> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const data = await getContractById(id);
        setInitial(data);
      } catch {
        setError("Failed to load contract");
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
        Edit Contract
      </h1>

      <ContractForm
        initial={initial}
        submitLabel="Next"
        onSubmit={async (values) => {
          await updateContract(id, values);
          nav("/contracts/" + id);
        }}
      />
    </div>
  );
}
