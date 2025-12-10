import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContractForm from "./ContractForm";
import { getContractById, updateContract } from "./api";
import type { Contract } from "./types";

export default function ContractEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [initial, setInitial] = useState<Partial<Contract> | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const data = await getContractById(id);
      setInitial(data);
    })();
  }, [id]);

  if (!id) return null;
  if (!initial) return <div className="text-sm text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-black dark:text-white">
        Edit Contract
      </h1>

      <ContractForm
        initial={initial}
        submitLabel="Save Changes"
        onSubmit={async (values) => {
          await updateContract(id, values);
          nav("/contracts");
        }}
      />
    </div>
  );
}
