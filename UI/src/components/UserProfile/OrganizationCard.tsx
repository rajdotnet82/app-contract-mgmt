import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

type OrgSummary = { id: string; name: string; role: string };

function isOrgAdmin(role?: string) {
  return role === "Owner" || role === "Admin";
}

export default function OrganizationCard({
  orgs,
  activeOrgId,
  onSetActiveOrg,
  onRenameOrg,
}: {
  orgs: OrgSummary[];
  activeOrgId: string;
  onSetActiveOrg: (orgId: string) => Promise<void>;
  onRenameOrg: (orgId: string, name: string) => Promise<void>;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [editing, setEditing] = useState<OrgSummary | null>(null);
  const [name, setName] = useState("");

  function openEdit(org: OrgSummary) {
    setEditing(org);
    setName(org.name);
    openModal();
  }

  async function save() {
    if (!editing) return;
    await onRenameOrg(editing.id, name);
    closeModal();
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Organizations
          </h4>
        </div>

        <div className="space-y-3">
          {orgs.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No organizations found.
            </div>
          ) : (
            orgs.map((org) => {
              const admin = isOrgAdmin(org.role);
              const isActive = org.id === activeOrgId;

              return (
                <div
                  key={org.id}
                  className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {org.name}
                      </div>
                      {isActive ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Role: {org.role || "Member"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetActiveOrg(org.id)}
                      >
                        Set Active
                      </Button>
                    ) : null}

                    {admin ? (
                      <Button size="sm" onClick={() => openEdit(org)}>
                        Edit
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        You can edit if you&apos;re admin
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            Edit Organization
          </h4>

          <div className="space-y-5">
            <div>
              <Label>Organization Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
