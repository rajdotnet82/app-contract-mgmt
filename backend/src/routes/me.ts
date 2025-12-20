// backend/src/routes/me.ts
import { Router } from "express";
import User from "../models/User";
import UserOrganization from "../models/UserOrganization";
import Organization from "../models/Organization";

const router = Router();

function getAuth0Sub(req: any): string | undefined {
  // Try common locations used by different JWT middlewares
  return (
    req.auth?.payload?.sub ||
    req.user?.sub ||
    req.user?.auth0Sub ||
    req.auth0Sub ||
    req.sub
  );
}

router.get("/", async (req: any, res) => {
  try {
    // Prefer Mongo _id if middleware sets it correctly
    let user = await User.findById(req.userId).lean();

    // Fallback: lookup by Auth0 sub (very common)
    if (!user) {
      const sub = getAuth0Sub(req);
      if (!sub) return res.status(401).json({ error: "Missing auth subject" });
      user = await User.findOne({ auth0Sub: sub }).lean();
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    const memberships = await UserOrganization.find({ userId: user._id }).lean();
    const orgIds = memberships.map((m) => m.orgId);

    const orgs = await Organization.find({ _id: { $in: orgIds } }).lean();

    const orgsWithRole = orgs.map((o) => {
      const m = memberships.find((x) => String(x.orgId) === String(o._id));
      return { id: String(o._id), name: o.name, role: m?.role ?? "Member" };
    });

    return res.json({
      user: {
        id: String(user._id),
        email: user.email ?? "",
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        bio: user.bio ?? "",
        locale: user.locale ?? "en-US",
        address: user.address ?? {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        activeOrgId: user.activeOrgId ? String(user.activeOrgId) : "",
      },
      orgs: orgsWithRole,
    });
  } catch (err: any) {
    console.error("GET /api/me error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", async (req: any, res) => {
  try {
    const body = req.body || {};
    const patch: any = {};

    // Personal info
    if (typeof body.fullName === "string") patch.fullName = body.fullName.trim();
    if (body.phone != null) patch.phone = String(body.phone).trim(); // tolerant
    if (typeof body.bio === "string") patch.bio = body.bio.trim();
    if (typeof body.locale === "string") patch.locale = body.locale.trim();

    // Address (nested)
    if (body.address && typeof body.address === "object") {
      const a = body.address;
      const setIfString = (key: string, value: any) => {
        if (value != null) patch[key] = String(value).trim();
      };

      setIfString("address.line1", a.line1);
      setIfString("address.line2", a.line2);
      setIfString("address.city", a.city);
      setIfString("address.state", a.state);
      setIfString("address.postalCode", a.postalCode);
      setIfString("address.country", a.country);
    }

    // Identify user robustly (Mongo _id OR Auth0 sub)
    let query: any = null;

    // If req.userId looks like a Mongo ObjectId, try that
    if (typeof req.userId === "string" && /^[0-9a-fA-F]{24}$/.test(req.userId)) {
      query = { _id: req.userId };
    } else if (req.userId) {
      // Some middlewares set req.userId to ObjectId object
      query = { _id: req.userId };
    } else {
      query = null;
    }

    // Fallback to auth0Sub when _id matching fails
    const sub = getAuth0Sub(req);
    if (!query && !sub) return res.status(401).json({ error: "Missing auth subject" });

    let result = query ? await User.updateOne(query, { $set: patch }) : null;

    if (!result || result.matchedCount === 0) {
      if (!sub) return res.status(404).json({ error: "User not found for this token" });
      result = await User.updateOne({ auth0Sub: sub }, { $set: patch });
    }

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found for this token" });
    }

    // Read back updated user (by sub if possible, else by req.userId)
    let updated = null as any;

    if (sub) {
      updated = await User.findOne({ auth0Sub: sub }).lean();
    }
    if (!updated) {
      updated = await User.findById(req.userId).lean();
    }
    if (!updated) {
      return res.status(404).json({ error: "User not found after update" });
    }

    return res.json({
      ok: true,
      user: {
        id: String(updated._id),
        email: updated.email ?? "",
        fullName: updated.fullName ?? "",
        phone: updated.phone ?? "",
        bio: updated.bio ?? "",
        locale: updated.locale ?? "en-US",
        address: updated.address ?? {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        activeOrgId: updated.activeOrgId ? String(updated.activeOrgId) : "",
      },
    });
  } catch (err: any) {
    console.error("PUT /api/me/profile error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/active-org", async (req: any, res) => {
  try {
    const { orgId } = req.body || {};
    if (!orgId) return res.status(400).json({ error: "orgId is required" });

    // Resolve current user
    let user = await User.findById(req.userId).lean();
    if (!user) {
      const sub = getAuth0Sub(req);
      if (!sub) return res.status(401).json({ error: "Missing auth subject" });
      user = await User.findOne({ auth0Sub: sub }).lean();
    }
    if (!user) return res.status(404).json({ error: "User not found" });

    const membership = await UserOrganization.findOne({ userId: user._id, orgId }).lean();
    if (!membership) return res.status(403).json({ error: "Not a member of that org" });

    await User.updateOne({ _id: user._id }, { $set: { activeOrgId: orgId } });

    return res.json({ ok: true, activeOrgId: orgId });
  } catch (err: any) {
    console.error("POST /api/me/active-org error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
