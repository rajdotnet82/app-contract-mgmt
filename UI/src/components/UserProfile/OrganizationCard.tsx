import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import http from "../../api/http";
import { toAssetUrl } from "../../utils/assetUrl";

type ActiveOrg = { id: string; name: string; logoUrl?: string };

export default function OrganizationCard() {
  const nav = useNavigate();
  const [org, setOrg] = useState<ActiveOrg | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setLoadingOrg(true);
        const { data } = await http.get<ActiveOrg>("/api/orgs/active");
        if (!cancelled) setOrg(data);
      } catch (e: any) {
        const code = e?.response?.data?.code;
        if (code === "ORG_REQUIRED") {
          nav("/onboarding/org", { replace: true });
          return;
        }
        if (!cancelled)
          setError(
            e?.response?.data?.error ?? e?.message ?? "Failed to load org"
          );
      } finally {
        if (!cancelled) setLoadingOrg(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav]);

  async function onUploadLogo(file: File) {
    if (!org?.id) {
      setError("Organization is not loaded yet.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1) upload file (your backend route may return { url } or similar)
      const form = new FormData();
      form.append("file", file);

      const up = await http.post<{ url: string }>(
        "/api/uploads/org-logo",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const logoUrl = up.data.url;

      // 2) save logoUrl on org
      const updated = await http.put<{ ok: true; org: ActiveOrg }>(
        `/api/orgs/${org.id}`,
        {
          logoUrl,
        }
      );

      setOrg(updated.data.org);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? "Logo upload failed");
    } finally {
      setSaving(false);
    }
  }

  if (loadingOrg)
    return <div className="text-sm p-4">Loading organization…</div>;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="font-semibold">{org?.name ?? "Organization"}</div>

      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}

      <div className="mt-3 flex items-center gap-3">
        <img
          src={toAssetUrl(org?.logoUrl || "/placeholder-logo.png")}
          className="h-12 w-12 rounded-lg object-cover border"
        />
        <label className="text-sm">
          <input
            type="file"
            accept="image/*"
            disabled={!org?.id || saving}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadLogo(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <button
        className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-60"
        disabled={!org?.id || saving}
        onClick={() => {}}
        title={!org?.id ? "Organization must load first" : ""}
      >
        {saving ? "Saving…" : "Upload Logo"}
      </button>
    </div>
  );
}
