// UI/src/components/UserProfile/UserInfoCard.tsx
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import http from "../../api/http";

type MeUser = {
  email: string;
  fullName: string;
  phone?: string;
  bio?: string;
};

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { isAuthenticated, user: auth0User } = useAuth0();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [me, setMe] = useState<MeUser | null>(null);

  // edit form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  async function load() {
    const { data } = await http.get<{ user: MeUser }>("/api/me");
    setMe(data.user);

    setFullName(data.user.fullName || "");
    setPhone(data.user.phone || "");
    setBio(data.user.bio || "");
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function openEdit() {
    if (!me) return;
    setFullName(me.fullName || "");
    setPhone(me.phone || "");
    setBio(me.bio || "");
    openModal();
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        fullName,
        phone,
        bio,
      };

      const { data } = await http.put<{ ok: boolean; user: MeUser }>(
        "/api/me/profile",
        payload
      );

      setMe(data.user);
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  const displayEmail =
    me?.email || (auth0User?.email as string | undefined) || "";

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Personal Information
          </h4>

          <button
            onClick={openEdit}
            disabled={!isAuthenticated || loading || !me}
            title={!isAuthenticated ? "Sign in to edit" : "Edit"}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
          >
            Edit
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        ) : !me ? (
          <div className="text-sm text-red-600">Unable to load profile.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {me.fullName || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {displayEmail || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {me.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bio</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {me.bio || "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
          </div>

          <div className="space-y-5">
            <div>
              <Label>Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={displayEmail} disabled />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-555-5555"
              />
            </div>

            <div>
              <Label>Bio</Label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio (e.g., Photographer, Studio Owner)"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
