import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { toApiError } from "@/shared/utils/apiErrors";
import { UserRow, UsersTableEmpty } from "@/modules/users/components/UserRow";
import { useUsers } from "@/modules/users/hooks/useUsers";

export function UsersScreen() {
  const usersQuery = useUsers();

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
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>

        {users.length === 0 ? <UsersTableEmpty /> : null}
      </div>
    </div>
  );
}
