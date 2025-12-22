import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import http from "../../api/http";

type OrgSummary = { id: string; name: string; role: string };

type MeResponse = {
  user: { activeOrgId?: string };
  orgs: OrgSummary[];
};

function isOrgBypassRoute(pathname: string) {
  // These must be allowed even when user has no org yet
  if (pathname.startsWith("/onboarding/org")) return true;
  if (pathname.startsWith("/invite/")) return true;
  return false;
}

export default function RequireOrg() {
  const location = useLocation();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // If we're already on onboarding/invite page, do not force redirect.
        if (isOrgBypassRoute(location.pathname)) {
          if (!cancelled) setChecking(false);
          return;
        }

        const { data } = await http.get<MeResponse>("/api/me");
        const orgs = data.orgs ?? [];
        const activeOrgId = data.user?.activeOrgId ?? "";

        const hasOrg = orgs.length > 0 && !!activeOrgId;

        if (!hasOrg) {
          // Force org setup
          navigate("/onboarding/org", { replace: true });
          return;
        }

        if (!cancelled) setChecking(false);
      } catch (e: any) {
        // In rare cases, /api/me could fail; safest fallback is onboarding
        if (!cancelled) {
          navigate("/onboarding/org", { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate]);

  if (checking) return <div className="p-6">Checking organization…</div>;

  return <Outlet />;
}
