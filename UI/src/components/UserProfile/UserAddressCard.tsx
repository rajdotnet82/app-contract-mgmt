import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import http from "../../api/http";

type Address = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type MeUser = { address?: Address };

const emptyAddress: Address = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [address, setAddress] = useState<Address>(emptyAddress);

  async function load() {
    const { data } = await http.get<{ user: MeUser }>("/api/me");
    setAddress(data.user.address ?? emptyAddress);
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

  function open() {
    openModal();
  }

  async function save() {
    setSaving(true);
    try {
      const { data } = await http.put<{ ok: boolean; user: MeUser }>(
        "/api/me/profile",
        { address }
      );
      setAddress(data.user.address ?? emptyAddress);
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  const cityState =
    [address.city, address.state].filter(Boolean).join(", ") || "—";

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Address
          </h4>
          <button
            onClick={open}
            className="text-sm font-medium text-blue-600 hover:underline"
            disabled={loading}
          >
            Edit
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Street</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.line1 || "—"}
              </p>
              {address.line2 ? (
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {address.line2}
                </p>
              ) : null}
            </div>

            <div>
              <p className="text-xs text-gray-500">City/State</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {cityState}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Postal Code</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.postalCode || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Country</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.country || "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            Edit Address
          </h4>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Address Line 1</Label>
              <Input
                value={address.line1}
                onChange={(e) =>
                  setAddress({ ...address, line1: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Address Line 2</Label>
              <Input
                value={address.line2}
                onChange={(e) =>
                  setAddress({ ...address, line2: e.target.value })
                }
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input
                value={address.postalCode}
                onChange={(e) =>
                  setAddress({ ...address, postalCode: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
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
