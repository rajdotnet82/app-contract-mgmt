import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import OrganizationCard from "../components/UserProfile/OrganizationCard";
import PageMeta from "../components/common/PageMeta";
import http from "../api/http";

type OrgSummary = { id: string; name: string; role: string };

type MeResponse = {
  user: { activeOrgId: string };
  orgs: OrgSummary[];
};

// This matches GET /api/orgs/active response
type ActiveOrg = {
  _id: string;
  name: string;
  logoUrl?: string;
};

export default function UserProfiles() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>("");
  const [activeOrg, setActiveOrg] = useState<ActiveOrg | null>(null);

  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingActiveOrg, setLoadingActiveOrg] = useState(true);

  async function loadOrgsAndActiveOrg() {
    const { data } = await http.get<MeResponse>("/api/me");
    const nextOrgs = data.orgs || [];
    const nextActiveOrgId = data.user?.activeOrgId || "";

    setOrgs(nextOrgs);
    setActiveOrgId(nextActiveOrgId);

    // If user has an active org, load full org details (name + logoUrl)
    if (nextActiveOrgId) {
      const orgRes = await http.get<ActiveOrg>("/api/orgs/active");
      setActiveOrg(orgRes.data);
    } else {
      setActiveOrg(null);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoadingOrgs(true);
        setLoadingActiveOrg(true);
        await loadOrgsAndActiveOrg();
      } finally {
        setLoadingOrgs(false);
        setLoadingActiveOrg(false);
      }
    })();
  }, []);

  async function onSetActiveOrg(orgId: string) {
    // Persist active org
    await http.post("/api/me/active-org", { orgId });

    // Update local state
    setActiveOrgId(orgId);

    // Reload active org branding (logo/name)
    setLoadingActiveOrg(true);
    try {
      const orgRes = await http.get<ActiveOrg>("/api/orgs/active");
      setActiveOrg(orgRes.data);
    } finally {
      setLoadingActiveOrg(false);
    }
  }

  // This is used by OrganizationCard after saving org name/logo
  function handleUpdatedOrg(updated: ActiveOrg) {
    setActiveOrg(updated);

    // Also update the org list display name (so your org switcher reflects rename)
    setOrgs((prev) =>
      prev.map((o) => (o.id === updated._id ? { ...o, name: updated.name } : o))
    );
  }

  // Optional: if you still use rename elsewhere
  async function onRenameOrg(orgId: string, name: string) {
    const { data } = await http.put<{
      ok: boolean;
      org: { _id?: string; id?: string; name: string; logoUrl?: string };
    }>(`/api/orgs/${orgId}`, { name });

    // support either _id or id, depending on backend response
    const updatedId = data.org._id ?? data.org.id ?? orgId;

    setOrgs((prev) =>
      prev.map((o) => (o.id === updatedId ? { ...o, name: data.org.name } : o))
    );

    // If renaming active org, update activeOrg too
    if (activeOrg && activeOrg._id === updatedId) {
      setActiveOrg((prev) => (prev ? { ...prev, name: data.org.name } : prev));
    }
  }

  return (
    <>
      <PageMeta title="Profile" description="User Profile" />
      <PageBreadcrumb pageTitle="Profile" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>

        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />

          {loadingOrgs ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading organizations…
            </div>
          ) : (
            <>
              {/* If you have an org switcher UI, call onSetActiveOrg(orgId) there */}
              {/* Example placeholder if you want a simple switcher: */}
              {orgs.length > 1 ? (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                  <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Active Organization
                  </div>
                  <div className="mt-3">
                    <select
                      value={activeOrgId}
                      onChange={(e) => onSetActiveOrg(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                    >
                      {orgs.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              {loadingActiveOrg ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading organization details…
                </div>
              ) : (
                <OrganizationCard
                  org={activeOrg}
                  onUpdated={handleUpdatedOrg}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
