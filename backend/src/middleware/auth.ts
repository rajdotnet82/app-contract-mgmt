import "dotenv/config";
import { auth } from "express-oauth2-jwt-bearer";

const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;
const audience = process.env.AUTH0_AUDIENCE;

if (!issuerBaseURL) {
  throw new Error("Missing env AUTH0_ISSUER_BASE_URL. Example: https://dev-xxxx.us.auth0.com");
}
if (!audience) {
  throw new Error("Missing env AUTH0_AUDIENCE (your API Identifier in Auth0).");
}

export const requireAuth = auth({
  issuerBaseURL,
  audience,
  tokenSigningAlg: "RS256",
});
