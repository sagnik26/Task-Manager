export type UserRole = "admin" | "developer";

export type User = {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: UserRole;
  isActive: boolean;
};

export type PermissionCanFlags = {
  createProject: boolean;
  deleteProject: boolean;
  updateProject: boolean;
  viewProject: boolean;
  manageProjectMembers: boolean;
  manageUsers: boolean;
  createTask: boolean;
  updateTask: boolean;
  viewTask: boolean;
  deleteTask: boolean;
};

export type PermissionFlags = {
  role: UserRole | null;
  permissions: string[];
  can: PermissionCanFlags;
};

// Cookie-based JWT means the token is not accessible to the frontend.
export type AuthSession = {
  user: User | null;
  permissions: PermissionFlags | null;
};
