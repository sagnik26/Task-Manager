import { UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addProjectMember,
  listProjectMembers,
  removeProjectMember,
  type ProjectMember,
} from "../../../api/projects.api";
import { listUsers } from "../../../api/users.api";
import { Avatar } from "../../../shared/ui/Avatar";
import { LoadingState } from "../../../shared/ui/LoadingState";
import { toApiError } from "../../../shared/utils/apiErrors";
import type { TenantUser } from "../../../types/users";

export function ProjectMembersPanel({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => listProjectMembers(projectId),
    enabled: Boolean(projectId),
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const addMutation = useMutation({
    mutationFn: (userId: string) => addProjectMember(projectId, userId),
    onSuccess: async () => {
      setSelectedUserId("");
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => setActionError(toApiError(error).message),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeProjectMember(projectId, userId),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => setActionError(toApiError(error).message),
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
    await addMutation.mutateAsync(selectedUserId);
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
        {actionError ? (
          <div className="alert-error" style={{ marginBottom: 12 }}>
            {actionError}
          </div>
        ) : null}

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
