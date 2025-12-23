import { describe, it, expect } from "vitest";
import { getEmailFromClaims, getSubjectFromClaims } from "../claims";

describe("claims helpers", () => {
  it("extracts subject (sub) from JWT claims", () => {
    const claims = { sub: "auth0|123" };
    expect(getSubjectFromClaims(claims)).toBe("auth0|123");
  });

  it("extracts email from custom namespaced claim", () => {
    const claims = { "https://app-contract-mgmt/email": "raj@example.com" };
    expect(getEmailFromClaims(claims)).toBe("raj@example.com");
  });

  it("falls back to standard email claim when namespaced is missing", () => {
    const claims = { email: "fallback@example.com" };
    expect(getEmailFromClaims(claims)).toBe("fallback@example.com");
  });

  it("returns undefined when email claim is missing", () => {
    const claims = { sub: "auth0|123" };
    expect(getEmailFromClaims(claims)).toBeUndefined();
  });
});
