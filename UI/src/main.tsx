import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Auth0Provider } from "@auth0/auth0-react";

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as
  | string
  | undefined;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

if (!auth0Domain || !auth0ClientId) {
  // Fail fast so misconfig is obvious during dev
  throw new Error(
    "Missing Auth0 config. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in UI/.env"
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <Auth0Provider
          domain={auth0Domain}
          clientId={auth0ClientId}
          authorizationParams={{
            redirect_uri: `${window.location.origin}`,
          }}
        >
          <App />
        </Auth0Provider>
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>
);
