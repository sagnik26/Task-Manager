import { Users } from "lucide-react";

import { Avatar } from "@/shared/ui/Avatar";
import type { TenantUser } from "@/modules/users/types/users.types";

function roleLabel(role: string): string {
  return role === "admin" ? "Admin" : "Developer";
}

export function UserRow({ user }: { user: TenantUser }) {
  return (
    <tr>
      <td>
        <div className="users-table__name">
          <Avatar name={user.name} seed={user.id} size={28} />
          <span>{user.name}</span>
        </div>
      </td>
      <td>{user.email}</td>
      <td>
        <span className={`users-badge users-badge--${user.role}`}>
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
  );
}

export function UsersTableEmpty() {
  return (
    <div className="users-table-empty">
      <Users size={20} color="var(--secondary)" />
      <p>No users found.</p>
    </div>
  );
}
