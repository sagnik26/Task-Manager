export type Project = {
  id: string;
  name: string;
  description?: string | null;
};

export type ProjectMember = {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "developer";
  joinedAt: string;
};
