import { sortTasks } from "../../../shared/theme/design";
import {
  DEFAULT_TASK_FILTERS,
  type TaskFilterState,
} from "../components/FilterPanel";
import { DEFAULT_SORT, type SortState } from "../components/SortPanel";
import type { Task } from "../../../types/tasks";

export type TaskQueryState = TaskFilterState & SortState;

export const DEFAULT_TASK_QUERY: TaskQueryState = {
  ...DEFAULT_TASK_FILTERS,
  ...DEFAULT_SORT,
};

type TaskQueryContext = {
  currentUserId: string;
};

function matchesAssigneeFilter(
  task: Task,
  filterAssignee: string[],
  currentUserId: string,
): boolean {
  if (filterAssignee.length === 0) return true;

  const matchesMe =
    filterAssignee.includes("me") && task.assigneeId === currentUserId;
  const matchesUnassigned =
    filterAssignee.includes("unassigned") && !task.assigneeId;
  const matchesMember = filterAssignee.some(
    (id) => id !== "me" && id !== "unassigned" && task.assigneeId === id,
  );

  return matchesMe || matchesUnassigned || matchesMember;
}

function matchesDueDateFilter(
  task: Task,
  dueFrom: string,
  dueTo: string,
): boolean {
  if (!dueFrom && !dueTo) return true;
  if (!task.dueDate) return false;
  if (dueFrom && task.dueDate < dueFrom) return false;
  if (dueTo && task.dueDate > dueTo) return false;
  return true;
}

export function applyTaskFilters<T extends Task>(
  tasks: T[],
  filterState: TaskFilterState,
  context: TaskQueryContext,
): T[] {
  return tasks.filter((task) => {
    if (
      filterState.filterStatus.length > 0 &&
      !filterState.filterStatus.includes(task.status)
    ) {
      return false;
    }
    if (
      filterState.filterPriority.length > 0 &&
      !filterState.filterPriority.includes(task.priority)
    ) {
      return false;
    }
    if (
      !matchesAssigneeFilter(
        task,
        filterState.filterAssignee,
        context.currentUserId,
      )
    ) {
      return false;
    }
    if (!matchesDueDateFilter(task, filterState.dueFrom, filterState.dueTo)) {
      return false;
    }
    return true;
  });
}

export function applyTaskQuery<T extends Task>(
  tasks: T[],
  state: TaskQueryState,
  context: TaskQueryContext,
): T[] {
  const filtered = applyTaskFilters(tasks, state, context);
  return sortTasks(filtered, state.sortBy, state.sortDir);
}

export function countActiveFilters(state: TaskFilterState): number {
  return (
    state.filterStatus.length +
    state.filterPriority.length +
    state.filterAssignee.length +
    (state.dueFrom ? 1 : 0) +
    (state.dueTo ? 1 : 0)
  );
}

export function isSortActive(state: SortState): boolean {
  return (
    state.sortBy !== DEFAULT_SORT.sortBy || state.sortDir !== DEFAULT_SORT.sortDir
  );
}

export function isQueryActive(
  filterState: TaskFilterState,
  sortState: SortState,
): boolean {
  return countActiveFilters(filterState) > 0 || isSortActive(sortState);
}
