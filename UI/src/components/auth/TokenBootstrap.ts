import { setTokenGetter } from "./token";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export function TokenBootstrap() {
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } =
    useAuth0();

  useEffect(() => {
    if (!isAuthenticated) return;

    let inFlight: Promise<string> | null = null;

    setTokenGetter(async () => {
      // prevent 5 components from triggering 5 token calls at once
      if (inFlight) return inFlight;

      inFlight = (async () => {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: "openid profile email",
            },
          });
          return token;
        } catch (e: any) {
          const code = e?.error ?? e?.code;

          // These mean "silent auth can't continue; user must interact"
          if (
            code === "consent_required" ||
            code === "login_required" ||
            code === "interaction_required"
          ) {
            await loginWithRedirect({
              authorizationParams: {
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                scope: "openid profile email",
              },
              appState: {
                returnTo: window.location.pathname + window.location.search,
              },
            });

            // loginWithRedirect navigates away; return empty just to satisfy TS
            return "";
          }

          throw e;
        } finally {
          inFlight = null;
        }
      })();

      return inFlight;
    });
  }, [isAuthenticated, getAccessTokenSilently, loginWithRedirect]);

  return null;
}
