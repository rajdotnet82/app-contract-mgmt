// src/pages/Onboarding/OrgOnboardingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrg } from "../../api/orgs";
import { hasOrg, useMe } from "../../context/MeContext";

export default function OrgOnboardingPage() {
  const navigate = useNavigate();
  const { me, refreshMe } = useMe();

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // If user already has org, leave immediately
  if (hasOrg(me)) {
    return (
      <div className="p-6 text-sm">
        Organization already set.{" "}
        <button onClick={() => navigate("/", { replace: true })}>
          Go home
        </button>
      </div>
    );
  }

  const onCreate = async () => {
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Organization name is required");
      return;
    }

    setBusy(true);
    try {
      await createOrg({ name: trimmed });

      // ✅ critical: refresh /api/me so guards stop redirecting back here
      const updatedMe = await refreshMe();

      // If backend updates user.activeOrgId correctly, we can leave
      if (updatedMe && (updatedMe.activeOrgId || updatedMe.orgId)) {
        navigate("/profile", { replace: true });
      } else {
        // Backend created org, but /api/me doesn't reflect it yet.
        // Still navigate; user can refresh once backend is fixed.
        navigate("/profile", { replace: true });
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          e?.response?.data?.error ??
          e?.message ??
          "Create failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">
          Set up your Organization
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          You must create or join an organization to use the system.
        </p>

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700">
            Organization Name
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="e.g., Sheraj Photography"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={onCreate}
          disabled={busy}
        >
          {busy ? "Creating…" : "Create Organization"}
        </button>

        <div className="mt-4 text-xs text-gray-500">
          If you were invited to an organization, open your invite link (ex:
          /invite/&lt;token&gt;).
        </div>
      </div>
    </div>
  );
}
