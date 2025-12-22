import { describe, it, expect, vi } from "vitest";
import { requireActiveOrg } from "../requireActiveOrg";

function makeRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("requireActiveOrg middleware", () => {
  it("returns 403 when activeOrgId is missing", () => {
    const req: any = { activeOrgId: undefined };
    const res = makeRes();
    const next = vi.fn();

    requireActiveOrg(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();

    const payload = res.json.mock.calls[0][0];
    // Assert minimally (avoid brittle full-object matching)
    expect(payload).toMatchObject({
      code: "ORG_REQUIRED",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when activeOrgId exists", () => {
    const req: any = { activeOrgId: "org_123" };
    const res = makeRes();
    const next = vi.fn();

    requireActiveOrg(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
