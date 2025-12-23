// src/context/MeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, type Me } from "../api/me";

type MeState = {
  me: Me | null;
  loading: boolean;
  error: string;
  refreshMe: () => Promise<Me | null>;
};

const Ctx = createContext<MeState | null>(null);

export function MeProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshMe = async () => {
    try {
      setError("");
      const data = await getMe();
      setMe(data);
      return data;
    } catch (e: any) {
      setMe(null);
      setError(
        e?.response?.data?.error ?? e?.message ?? "Failed to load /api/me"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ me, loading, error, refreshMe }),
    [me, loading, error]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMe() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMe must be used inside <MeProvider>");
  return v;
}

export function hasOrg(me: Me | null) {
  const orgId = me?.activeOrgId ?? me?.orgId;
  return !!orgId;
}
