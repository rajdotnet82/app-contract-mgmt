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

export default function UserProfiles() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>("");
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  async function loadOrgs() {
    const { data } = await http.get<MeResponse>("/api/me");
    setOrgs(data.orgs || []);
    setActiveOrgId(data.user?.activeOrgId || "");
  }

  useEffect(() => {
    (async () => {
      try {
        await loadOrgs();
      } finally {
        setLoadingOrgs(false);
      }
    })();
  }, []);

  async function onSetActiveOrg(orgId: string) {
    await http.post("/api/me/active-org", { orgId });
    setActiveOrgId(orgId);
  }

  async function onRenameOrg(orgId: string, name: string) {
    const { data } = await http.put<{
      ok: boolean;
      org: { id: string; name: string };
    }>(`/api/orgs/${orgId}`, { name });

    setOrgs((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, name: data.org.name } : o))
    );
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
            <OrganizationCard
              orgs={orgs}
              activeOrgId={activeOrgId}
              onSetActiveOrg={onSetActiveOrg}
              onRenameOrg={onRenameOrg}
            />
          )}
        </div>
      </div>
    </>
  );
}
