import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

type ActiveOrg = {
  id?: string; // backend returns id
  _id?: string; // allow _id too, just in case
  name: string;
  logoUrl?: string;
};

type OrgGateProps = {
  children: React.ReactNode;
  fallbackTo?: string;
};

function getOrgId(org: ActiveOrg | null | undefined): string | undefined {
  if (!org) return undefined;
  return (org as any).id || (org as any)._id;
}

export default function OrgGate({
  children,
  fallbackTo = "/profile",
}: OrgGateProps) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<ActiveOrg | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (org ? org.name : "Organization Required"),
    [org]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const { data } = await http.get<ActiveOrg | null>("/api/orgs/active");
        if (cancelled) return;

        const orgId = getOrgId(data ?? null);

        if (!data || !orgId) {
          setOrg(null);
        } else {
          setOrg(data);
        }
      } catch (e: any) {
        if (cancelled) return;

        const status = e?.response?.status;
        const code = e?.response?.data?.code;

        if (status === 403 && code === "ORG_REQUIRED") {
          setOrg(null);
        } else {
          setError(
            e?.response?.data?.message ||
              e?.message ||
              "Failed to load organization"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Loading…</h2>
        <div>Checking your organization…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Error</h2>
        <div style={{ marginBottom: 16 }}>{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!org) {
    return (
      <div style={{ padding: 24, maxWidth: 720 }}>
        <h2 style={{ marginBottom: 8 }}>{title}</h2>

        <p style={{ marginBottom: 16 }}>
          You must belong to an organization to access invoices, contracts,
          templates, and clients.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate(fallbackTo)}>
            Go to Profile (Create / Join Org)
          </button>

          <button onClick={() => navigate("/invites")}>Accept an Invite</button>
        </div>

        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>
          Tip: If you are the admin, create an org in Profile and invite users
          to join.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
