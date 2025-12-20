// UI/src/components/UserProfile/UserMetaData.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import http from "../../api/http";

type OrgSummary = { id: string; name: string; role: string };

type Address = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type MeUser = {
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  bio?: string;
  locale?: string;
  address?: Address;
  activeOrgId?: string;
};

type MeResponse = {
  user: MeUser;
  orgs: OrgSummary[];
};

const LOCALES = [
  { label: "English (United States)", value: "en-US" },
  { label: "English (United Kingdom)", value: "en-GB" },
  { label: "English (India)", value: "en-IN" },
  { label: "Hindi (India)", value: "hi-IN" },
  { label: "Telugu (India)", value: "te-IN" },
  { label: "Tamil (India)", value: "ta-IN" },
  { label: "Spanish (United States)", value: "es-US" },
  { label: "Spanish (Mexico)", value: "es-MX" },
  { label: "French (France)", value: "fr-FR" },
  { label: "German (Germany)", value: "de-DE" },
];

function normalizeLocale(input?: string) {
  if (!input) return "";
  const hit = LOCALES.find(
    (l) => l.value.toLowerCase() === input.toLowerCase()
  );
  return hit?.value ?? input;
}

export default function UserMetaData() {
  const { user: auth0User, isAuthenticated } = useAuth0();
  const { isOpen, openModal, closeModal } = useModal();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [me, setMe] = useState<MeUser | null>(null);
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);

  // Edit form state
  const [fullName, setFullName] = useState("");
  const [locale, setLocale] = useState("en-US");

  const activeOrg = useMemo(() => {
    const activeOrgId = me?.activeOrgId;
    if (!activeOrgId) return null;
    return orgs.find((o) => o.id === activeOrgId) ?? null;
  }, [me?.activeOrgId, orgs]);

  const displayName = useMemo(() => {
    return (
      me?.fullName ||
      (auth0User?.name as string | undefined) ||
      (auth0User?.nickname as string | undefined) ||
      me?.email ||
      "User"
    );
  }, [me?.fullName, me?.email, auth0User?.name, auth0User?.nickname]);

  const displayEmail = useMemo(() => {
    return me?.email || (auth0User?.email as string | undefined) || "";
  }, [me?.email, auth0User?.email]);

  const displayPicture = useMemo(() => {
    return (
      (auth0User?.picture as string | undefined) || "/images/user/owner.jpg"
    );
  }, [auth0User?.picture]);

  async function load() {
    const { data } = await http.get<MeResponse>("/api/me");
    setMe(data.user);
    setOrgs(data.orgs || []);
    setFullName(data.user.fullName || "");
    setLocale(
      normalizeLocale(data.user.locale) ||
        normalizeLocale((auth0User?.locale as string) || "") ||
        "en-US"
    );
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit() {
    if (!me) return;
    setFullName(me.fullName || "");
    setLocale(
      normalizeLocale(me.locale) ||
        normalizeLocale((auth0User?.locale as string) || "") ||
        "en-US"
    );
    openModal();
  }

  async function save() {
    if (!me) return;
    setSaving(true);
    try {
      const payload = {
        fullName,
        locale,
      };

      const { data } = await http.put<{ ok: boolean; user: MeUser }>(
        "/api/me/profile",
        payload
      );
      setMe(data.user);
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={displayPicture}
              alt="avatar"
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                {displayName}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {displayEmail || "—"}
              </p>

              {activeOrg ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active Org:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {activeOrg.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({activeOrg.role})
                  </span>
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active Org: —
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openEdit}
              disabled={!isAuthenticated || loading}
              title={!isAuthenticated ? "Sign in to edit" : "Edit"}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              Edit
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        ) : null}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profile
            </h4>
          </div>

          <div className="space-y-5">
            <div>
              <Label>Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={displayEmail} disabled />
            </div>

            <div>
              <Label>Language & Region (Locale)</Label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
              >
                {LOCALES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
