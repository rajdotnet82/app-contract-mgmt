export function isOrgRequiredError(err: any): boolean {
  const status = err?.response?.status;
  const code = err?.response?.data?.code;
  return status === 403 && code === "ORG_REQUIRED";
}
