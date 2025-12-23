// src/components/RequireOrg.tsx
import { Navigate, useLocation } from "react-router-dom";
import { hasOrg, useMe } from "../context/MeContext";

export default function RequireOrg({ children }: { children: JSX.Element }) {
  const { me, loading } = useMe();
  const loc = useLocation();

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading…</div>;

  // If not logged in, you can redirect to /signin (adjust to your app)
  if (!me) return <Navigate to="/signin" replace />;

  if (!hasOrg(me)) {
    return (
      <Navigate to="/onboarding/org" replace state={{ from: loc.pathname }} />
    );
  }

  return children;
}
