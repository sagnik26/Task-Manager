import { UserRole } from "../constants/users";

export const PERMISSIONS = {
  [UserRole.Admin]: [
    "create:project",
    "delete:project",
    "update:project",
    "view:project",
    "manage:project_members",
    "manage:users",
    "create:task",
    "update:task",
    "view:task",
    "delete:task",
  ],
  [UserRole.Developer]: [
    "update:project",
    "view:project",
    "create:task",
    "update:task",
    "view:task",
    "delete:task",
  ],
} as const satisfies Record<UserRole, readonly string[]>;

export type Permission = (typeof PERMISSIONS)[UserRole][number];

export function can(role: UserRole | undefined, action: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[role] as readonly Permission[]).includes(action);
}

export function permissionFlags(role: UserRole | undefined) {
  const perms = role ? [...PERMISSIONS[role]] : [];

  return {
    role,
    permissions: perms,
    can: {
      createProject: can(role, "create:project"),
      deleteProject: can(role, "delete:project"),
      updateProject: can(role, "update:project"),
      viewProject: can(role, "view:project"),
      manageProjectMembers: can(role, "manage:project_members"),
      manageUsers: can(role, "manage:users"),
      createTask: can(role, "create:task"),
      updateTask: can(role, "update:task"),
      viewTask: can(role, "view:task"),
      deleteTask: can(role, "delete:task"),
    },
  };
}

export type PermissionFlags = ReturnType<typeof permissionFlags>;
