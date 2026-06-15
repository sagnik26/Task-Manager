import type { TaskPriority, TaskStatus } from "@/modules/tasks/types/tasks.types";
import { normalizeDueDate } from "../utils/dates";

export const BRAND = {
  blue: "#0073EA",
  blueHover: "#0060B9",
  ink: "#323338",
} as const;

export const TASK_STATUS_COLUMNS: Array<{
  id: TaskStatus;
  label: string;
  color: string;
}> = [
  { id: "todo", label: "To do", color: "#C4C4C4" },
  { id: "in_progress", label: "In progress", color: "#FDAB3D" },
  { id: "done", label: "Done", color: "#00C875" },
];

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  high: { label: "High", color: "#784BD1", bg: "rgba(120,75,209,0.1)" },
  medium: { label: "Medium", color: "#0073EA", bg: "rgba(0,115,234,0.1)" },
  low: { label: "Low", color: "#8B95A6", bg: "rgba(139,149,166,0.1)" },
};

export const PROJECT_PALETTE = [
  { color: "#0073EA", emoji: "🌐" },
  { color: "#A25DDC", emoji: "📱" },
  { color: "#00C875", emoji: "📣" },
  { color: "#FDAB3D", emoji: "🏠" },
  { color: "#579BFC", emoji: "⚡" },
  { color: "#DF2F4A", emoji: "🎨" },
];

export const AVATAR_COLORS = [
  "#A25DDC",
  "#00C875",
  "#FDAB3D",
  "#0086C0",
  "#5559DF",
];

export function projectVisuals(index: number) {
  return PROJECT_PALETTE[index % PROJECT_PALETTE.length];
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

export function formatDueDate(iso: string | null): string {
  const ymd = normalizeDueDate(iso);
  if (!ymd) return "";
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const mo = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${mo[d.getMonth()]} ${d.getDate()}`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export type SortField = "dueDate" | "priority" | "created" | "title";

export const SORT_OPTIONS: Array<{ id: SortField; label: string }> = [
  { id: "dueDate", label: "Due date" },
  { id: "priority", label: "Priority" },
  { id: "created", label: "Created date" },
  { id: "title", label: "Title (A–Z)" },
];

export const PROJECT_SORT_OPTIONS: Array<{ id: SortField; label: string }> = [
  { id: "dueDate", label: "Due date" },
  { id: "priority", label: "Priority" },
  { id: "created", label: "Created date" },
];

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortTasks<
  T extends {
    title: string;
    priority: TaskPriority;
    dueDate: string | null;
    createdAt?: string | null;
  },
>(tasks: T[], sortBy: SortField, sortDir: "asc" | "desc"): T[] {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "title") {
      cmp = a.title.localeCompare(b.title);
    } else if (sortBy === "priority") {
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    } else if (sortBy === "dueDate") {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      cmp = da - db;
    } else if (sortBy === "created") {
      const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      cmp = ca - cb;
    }
    return cmp * dir;
  });
}
