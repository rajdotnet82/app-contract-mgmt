// backend/src/middleware/claims.ts

export type JwtClaims = Record<string, unknown>;

const EMAIL_CLAIM = "https://app-contract-mgmt/email";

/** Returns the subject (Auth0 user id) */
export function getSubjectFromClaims(claims: JwtClaims): string | undefined {
  const sub = claims?.sub;
  return typeof sub === "string" && sub.length > 0 ? sub : undefined;
}

/**
 * Returns email from your namespaced custom claim first,
 * then falls back to standard "email" if present.
 */
export function getEmailFromClaims(claims: JwtClaims): string | undefined {
  const custom = (claims as any)?.[EMAIL_CLAIM];
  if (typeof custom === "string" && custom.length > 0) return custom;

  const email = (claims as any)?.email;
  if (typeof email === "string" && email.length > 0) return email;

  return undefined;
}
