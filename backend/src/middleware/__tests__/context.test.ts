import { describe, it, expect, vi, beforeEach } from "vitest";
import { attachContext } from "../context";

// context.ts imports default exports: import User from "../models/User"; etc.
// So mock DEFAULT exports.
vi.mock("../../models/User", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../models/UserOrganization", () => ({
  default: {
    find: vi.fn(),
  },
}));

import User from "../../models/User";
import UserOrganization from "../../models/UserOrganization";

function makeRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("attachContext middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user if missing, then sets req.userId", async () => {
    // User not found
    (User.findOne as any).mockResolvedValue(null);

    // Created user doc
    const createdUser = {
      _id: "u1",
      activeOrgId: undefined,
      save: vi.fn().mockResolvedValue(undefined),
    };
    (User.create as any).mockResolvedValue(createdUser);

    // No org memberships
    (UserOrganization.find as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    });

    const req: any = {
      auth: {
        payload: {
          sub: "auth0|abc",
          "https://app-contract-mgmt/email": "a@b.com",
        },
      },
    };
    const res = makeRes();
    const next = vi.fn();

    await attachContext(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ auth0Sub: "auth0|abc" });
    expect(User.create).toHaveBeenCalled(); // don’t over-specify args; keep resilient
    expect(req.userId).toBe("u1");
    expect(req.activeOrgId).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("loads existing user and sets activeOrgId from membership", async () => {
    const existingUser = {
      _id: "u2",
      activeOrgId: undefined,
      save: vi.fn().mockResolvedValue(undefined),
    };
    (User.findOne as any).mockResolvedValue(existingUser);

    (UserOrganization.find as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue([{ orgId: "org_123" }]),
    });

    const req: any = {
      auth: {
        payload: {
          sub: "auth0|xyz",
          "https://app-contract-mgmt/email": "x@y.com",
        },
      },
    };
    const res = makeRes();
    const next = vi.fn();

    await attachContext(req, res, next);

    expect(req.userId).toBe("u2");
    expect(req.activeOrgId).toBe("org_123");
    expect(existingUser.save.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns an error when required claims are missing (e.g., sub)", async () => {
    // Your middleware returns an error response when sub is missing.
    const req: any = { auth: { payload: {} } };
    const res = makeRes();
    const next = vi.fn();

    await attachContext(req, res, next);

    expect(res.status).toHaveBeenCalled(); // exact status depends on your implementation
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
