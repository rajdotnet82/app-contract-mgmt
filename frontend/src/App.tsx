import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function App() {
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({
    contractNumber: "",
    title: "",
    counterparty: "",
    status: "Draft",
  });
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await axios.get(`${API_BASE}/api/contracts`);
      setContracts(data);
    } catch {
      setError("Failed to load contracts");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post(`${API_BASE}/api/contracts`, form);
      setContracts((prev) => [data, ...prev]);
      setForm({
        contractNumber: "",
        title: "",
        counterparty: "",
        status: "Draft",
      });
    } catch (e) {
      setError("Failed to create contract");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Contract Management</h1>

      <form
        onSubmit={create}
        style={{ display: "grid", gap: 8, marginBottom: 20 }}
      >
        <input
          placeholder="Contract Number (e.g., C-1001)"
          value={form.contractNumber}
          onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
        />
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Counterparty"
          value={form.counterparty}
          onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Draft</option>
          <option>Active</option>
          <option>Expired</option>
          <option>Terminated</option>
        </select>

        <button type="submit">Create Contract</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ border: "1px solid #ddd", borderRadius: 8 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr 140px 1fr",
            gap: 8,
            padding: 12,
            fontWeight: 600,
            borderBottom: "1px solid #ddd",
            background: "#fafafa",
          }}
        >
          <span>Number</span>
          <span>Title</span>
          <span>Status</span>
          <span>Counterparty</span>
        </div>

        {contracts.map((c) => (
          <div
            key={c._id}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr 140px 1fr",
              gap: 8,
              padding: 12,
              borderBottom: "1px solid #eee",
            }}
          >
            <span>{c.contractNumber}</span>
            <span>{c.title}</span>
            <span>{c.status}</span>
            <span>{c.counterparty}</span>
          </div>
        ))}

        {contracts.length === 0 && (
          <div style={{ padding: 12 }}>No contracts yet.</div>
        )}
      </div>
    </div>
  );
}
