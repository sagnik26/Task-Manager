export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => [...projectKeys.all, id] as const,
  stats: (id: string) => [...projectKeys.detail(id), "stats"] as const,
  members: (id: string) => [...projectKeys.detail(id), "members"] as const,
};
