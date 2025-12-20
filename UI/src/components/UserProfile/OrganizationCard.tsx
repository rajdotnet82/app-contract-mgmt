import React, { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import { toAssetUrl } from "../../utils/assetUrl";

/**
 * OrganizationCard (safe)
 * - Handles org being undefined during initial load
 * - Uploads logo => POST /api/uploads/org-logo (multipart, field name "file") => { url }
 * - Saves org => PUT /api/orgs/:orgId with { name?, logoUrl? }
 */

type Org = {
  _id: string;
  name: string;
  logoUrl?: string;
};

type Props = {
  org?: Org | null; // ✅ allow undefined/null safely
  onUpdated?: (updated: Org) => void;
};

export default function OrganizationCard({ org, onUpdated }: Props) {
  // ✅ Safe defaults so it never crashes
  const orgId = org?._id ?? "";
  const initialName = org?.name ?? "";
  const initialLogo = org?.logoUrl ?? "";

  const [draftName, setDraftName] = useState(initialName);
  const [draftLogoUrl, setDraftLogoUrl] = useState<string>(initialLogo);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Sync local draft when org prop loads/changes
  useEffect(() => {
    setDraftName(org?.name ?? "");
    setDraftLogoUrl(org?.logoUrl ?? "");
  }, [org?._id, org?.name, org?.logoUrl]);

  const dirty = useMemo(() => {
    if (!org) return false;
    return (
      (draftName ?? "").trim() !== (org.name ?? "").trim() ||
      (draftLogoUrl ?? "") !== (org.logoUrl ?? "")
    );
  }, [draftName, draftLogoUrl, org]);

  async function uploadLogo(file: File) {
    setUploading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await http.post<{ url: string }>(
        "/api/uploads/org-logo",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const url = res.data?.url;
      if (!url) throw new Error("Upload failed (missing url)");

      setDraftLogoUrl(url);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? "Logo upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!orgId) {
      setError("Organization is not loaded yet.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: any = {};
      const trimmedName = (draftName ?? "").trim();

      if (trimmedName.length < 2) {
        setSaving(false);
        setError("Organization name must be at least 2 characters.");
        return;
      }

      // Only send changed fields
      if (!org || trimmedName !== (org.name ?? "").trim())
        payload.name = trimmedName;
      if (!org || (draftLogoUrl ?? "") !== (org.logoUrl ?? ""))
        payload.logoUrl = draftLogoUrl ?? "";

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const res = await http.put<{ ok: boolean; org: Org }>(
        `/api/orgs/${orgId}`,
        payload
      );
      const updated = res.data?.org ?? {
        _id: orgId,
        name: trimmedName,
        logoUrl: draftLogoUrl,
      };

      onUpdated?.(updated);

      // sync drafts
      setDraftName(updated.name ?? trimmedName);
      setDraftLogoUrl(updated.logoUrl ?? draftLogoUrl);
    } catch (e: any) {
      setError(
        e?.response?.data?.error ?? e?.message ?? "Failed to save organization"
      );
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setDraftName(org?.name ?? "");
    setDraftLogoUrl(org?.logoUrl ?? "");
    setError(null);
  }

  // ✅ If org not loaded yet, render a friendly skeleton instead of crashing
  if (!org) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Organization
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Loading organization…
        </div>
        <div className="mt-4 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Organization
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Name and branding logo
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty || saving || uploading}
            className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm disabled:opacity-60"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving || uploading}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Logo */}
        <div className="md:col-span-1">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Logo
          </div>

          <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4 flex items-center justify-center">
            {draftLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toAssetUrl(draftLogoUrl)}
                alt="Organization logo"
                className="max-h-24 w-auto object-contain"
              />
            ) : (
              <div className="text-sm text-gray-400">No logo uploaded</div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={saving || uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadLogo(file);
                  e.currentTarget.value = "";
                }}
              />
              {uploading ? "Uploading…" : "Upload logo"}
            </label>

            {draftLogoUrl ? (
              <button
                type="button"
                className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm"
                onClick={() => setDraftLogoUrl("")}
                disabled={saving || uploading}
              >
                Remove
              </button>
            ) : null}
          </div>

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tip: PNG with transparent background looks best on invoices.
          </div>
        </div>

        {/* Org fields */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Organization name
            </label>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              disabled={saving || uploading}
              className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
              placeholder="e.g., Sheraj Photography"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Logo URL
            </label>
            <input
              value={draftLogoUrl ?? ""}
              readOnly
              className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
              placeholder="Upload a logo to generate a URL"
            />
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            This org logo will be used on invoice preview/PDF.
          </div>
        </div>
      </div>
    </div>
  );
}
