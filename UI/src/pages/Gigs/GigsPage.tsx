// import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { listInvoices, type Invoice } from "./api";
// import { isOrgRequiredError } from "../../api/errors";

export default function GigsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 className="text-lg font-semibold">Gigs</h1>
        <button
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          onClick={() => navigate("/gigs/new")}
        >
          New Gig
        </button>
      </div>
    </div>
  );
}
