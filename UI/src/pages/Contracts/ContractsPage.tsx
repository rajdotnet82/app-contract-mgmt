import { useCallback, useEffect, useState } from "react";
import ContractsSearch from "./ContractsSearch";
import ContractsResults from "./ContractsResults";
import type { Contract, SearchCriteria } from "./types";
import { fetchContracts, deleteContract } from "./api";

export default function ContractsPage() {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    q: "",
    status: "",
  });
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (c: SearchCriteria) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchContracts(c);
      setItems(data);
    } catch {
      setError("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(criteria);
  }, [criteria, load]);

  async function handleDelete(id: string) {
    await deleteContract(id);
    await load(criteria);
  }

  return (
    <div>
      <ContractsSearch
        value={criteria}
        onChange={setCriteria}
        onClear={() => setCriteria({ q: "", status: "" })}
      />

      <ContractsResults
        items={items}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  );
}
