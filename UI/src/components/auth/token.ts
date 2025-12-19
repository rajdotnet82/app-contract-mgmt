let getter: null | (() => Promise<string>) = null;

export function setTokenGetter(fn: () => Promise<string>) {
  getter = fn;
}

export async function getToken(): Promise<string> {
  if (!getter) throw new Error("Token getter not set. User may not be logged in yet.");
  return getter();
}
