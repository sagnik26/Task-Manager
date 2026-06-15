import { UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listProjectMembers } from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";
import { useAddProjectMember } from "@/modules/projects/hooks/useAddProjectMember";
import { useRemoveProjectMember } from "@/modules/projects/hooks/useRemoveProjectMember";
import type { ProjectMember } from "@/modules/projects/types/projects.types";
import { listUsers } from "@/modules/users/api/users.api";
import { userKeys } from "@/modules/users/api/query-keys";
import { Avatar } from "@/shared/ui/Avatar";
import { LoadingState } from "@/shared/ui/LoadingState";
import { useToast } from "@/shared/ui/toast";
import type { TenantUser } from "@/modules/users/types/users.types";

export function ProjectMembersPanel({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const toast = useToast();

  const membersQuery = useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () => listProjectMembers(projectId),
    enabled: Boolean(projectId),
  });

  const usersQuery = useQuery({
    queryKey: userKeys.all,
    queryFn: listUsers,
  });

  const addMutation = useAddProjectMember(projectId, {
    onSuccess: () => {
      setSelectedUserId("");
    },
    onError: (message) => toast.error(message),
  });

  const removeMutation = useRemoveProjectMember(projectId, {
    onError: (message) => toast.error(message),
  });

  const members = membersQuery.data ?? [];
  const memberIds = useMemo(
    () => new Set(members.map((m) => m.userId)),
    [members],
  );

  const availableUsers = useMemo(() => {
    const users = usersQuery.data ?? [];
    return users.filter((u: TenantUser) => u.isActive && !memberIds.has(u.id));
  }, [usersQuery.data, memberIds]);

  async function handleAdd() {
    if (!selectedUserId) return;
    const user = availableUsers.find((u) => u.id === selectedUserId);
    if (!user) return;

    const optimisticMember: ProjectMember = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinedAt: new Date().toISOString(),
    };

    await addMutation.mutateAsync({
      userId: selectedUserId,
      member: optimisticMember,
    });
  }

  return (
    <aside className="filter-panel">
      <div className="filter-panel__header">
        <h3 className="filter-panel__title">Project members</h3>
        <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close">
          <X size={15} />
        </button>
      </div>

      <div className="filter-panel__body">
        <div className="filter-section">
          <h4 className="filter-section__label">Add member</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              className="field-input"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={addMutation.isPending || availableUsers.length === 0}
              style={{ flex: 1 }}
            >
              <option value="">
                {availableUsers.length === 0
                  ? "No users available"
                  : "Select a user…"}
              </option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary btn-primary--sm"
              onClick={() => void handleAdd()}
              disabled={!selectedUserId || addMutation.isPending}
            >
              <UserPlus size={13} />
              Add
            </button>
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-section__label">
            Current members ({members.length})
          </h4>
          {membersQuery.isLoading ? (
            <LoadingState label="Loading members…" />
          ) : (
            <div className="members-list">
              {members.map((member: ProjectMember) => (
                <div key={member.userId} className="members-list__row">
                  <Avatar name={member.name} seed={member.userId} size={28} />
                  <div className="members-list__meta">
                    <span className="members-list__name">{member.name}</span>
                    <span className="members-list__email">{member.email}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: "4px 8px" }}
                    onClick={() => removeMutation.mutate(member.userId)}
                    disabled={removeMutation.isPending}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {members.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--secondary)", margin: 0 }}>
                  No members yet.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
