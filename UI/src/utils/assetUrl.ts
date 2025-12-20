// UI/src/utils/assetUrl.ts

// Vite: use import.meta.env
// If you ever move to CRA/Next, you’ll adjust this in one place.
const DEFAULT_API_BASE = "http://localhost:5000";

/**
 * Where your API is running.
 * In local dev set: VITE_API_BASE_URL=http://localhost:5000
 */
export function apiBaseUrl(): string {
  // @ts-ignore - Vite provides import.meta.env
  const v = (import.meta?.env?.VITE_API_BASE_URL as string) || "";
  return (v || DEFAULT_API_BASE).replace(/\/$/, "");
}

/**
 * Converts stored relative paths (like "/uploads/x.png") into an absolute URL
 * pointing at the API server, while leaving absolute URLs unchanged.
 */
export function toAssetUrl(pathOrUrl?: string | null): string {
  const v = (pathOrUrl || "").trim();
  if (!v) return "";

  // already absolute
  if (/^https?:\/\//i.test(v)) return v;

  // path-only ("/uploads/...")
  if (v.startsWith("/")) return `${apiBaseUrl()}${v}`;

  // bare path ("uploads/...")
  return `${apiBaseUrl()}/${v}`;
}
