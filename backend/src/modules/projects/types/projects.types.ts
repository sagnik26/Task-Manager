import type { ProjectStatus } from "../../../shared/constants/projects";
import type { UserRole } from "../../../shared/constants/users";

export type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  tenant_id: string;
  status: ProjectStatus;
  created_at: Date;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  tenantId: string;
  status: ProjectStatus;
  createdAt: Date;
};

export type ProjectMember = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: Date;
};

export type ProjectMemberRow = {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: Date;
};

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  project_id: string;
  assignee_id: string | null;
  created_by: string;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type ProjectDetail = Project & {
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: TaskRow["status"];
    priority: TaskRow["priority"];
    assigneeId: string | null;
    createdBy: string;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export type CreateProjectInput = {
  name: string;
  description?: string | null;
  tenantId: string;
  creatorId: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
};

export type ProjectAccessContext = {
  userId: string;
  tenantId: string;
  role: UserRole;
};

/** Task counts for a project (dashboard / analytics). */
export type ProjectTaskStats = {
  byStatus: Record<TaskRow["status"], number>;
  byAssignee: Array<{
    assigneeId: string | null;
    count: number;
  }>;
};
