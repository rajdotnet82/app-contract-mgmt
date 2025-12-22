import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import http from "../../api/http";

type InviteDetails = {
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  email: string;
  role: "Admin" | "Member";
  org: {
    id: string;
    name: string;
    logoUrl?: string;
  };
};

export default function InviteAcceptPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setLoading(true);

        const { data } = await http.get<InviteDetails>(`/api/invites/${token}`);
        if (!cancelled) setInvite(data);
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.response?.data?.error ?? e?.message ?? "Failed to load invite"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function acceptInvite() {
    if (!token) return;
    setAccepting(true);
    setError(null);

    try {
      await http.post(`/api/invites/${token}/accept`);

      // Now user has activeOrgId; go to app
      navigate("/", { replace: true });
    } catch (e: any) {
      setError(
        e?.response?.data?.error ?? e?.message ?? "Failed to accept invite"
      );
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Organization Invite
        </h1>

        {loading ? (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Loading invite…
          </div>
        ) : error ? (
          <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : invite ? (
          <div className="mt-4">
            <div className="text-sm text-gray-700 dark:text-gray-200">
              You’ve been invited to join:
            </div>

            <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {invite.org?.name}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Role: <span className="font-medium">{invite.role}</span>
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Invited email:{" "}
                <span className="font-medium">{invite.email}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Status: {invite.status}
              </div>
            </div>

            {invite.status !== "pending" ? (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                This invite is not usable (status: <b>{invite.status}</b>).
              </div>
            ) : (
              <button
                onClick={acceptInvite}
                disabled={accepting}
                className="mt-5 w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                {accepting ? "Accepting…" : "Accept Invite"}
              </button>
            )}

            <button
              onClick={() => navigate("/onboarding/org")}
              className="mt-3 w-full rounded-lg border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 text-sm"
            >
              Create a new organization instead
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
