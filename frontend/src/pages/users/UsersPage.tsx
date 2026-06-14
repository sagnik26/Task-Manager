import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { listUsers } from "../../api/users.api";
import { Avatar } from "../../shared/ui/Avatar";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { toApiError } from "../../shared/utils/apiErrors";

function roleLabel(role: string): string {
  return role === "admin" ? "Admin" : "Developer";
}

export function UsersPage() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  if (usersQuery.isLoading) {
    return (
      <div className="page-scroll">
        <LoadingState label="Loading users…" />
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="page-scroll">
        <ErrorState
          message={toApiError(usersQuery.error).message}
          actionLabel="Retry"
          onAction={() => void usersQuery.refetch()}
        />
      </div>
    );
  }

  const users = usersQuery.data ?? [];

  return (
    <div className="page-scroll">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Users</h1>
          <p className="dashboard-subtitle">
            All users in your workspace ({users.length})
          </p>
        </div>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="users-table__name">
                    <Avatar name={user.name} seed={user.id} size={28} />
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`users-badge users-badge--${user.role}`}
                  >
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span
                    className={`users-badge users-badge--${user.isActive ? "active" : "inactive"}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 ? (
          <div className="users-table-empty">
            <Users size={20} color="var(--secondary)" />
            <p>No users found.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
