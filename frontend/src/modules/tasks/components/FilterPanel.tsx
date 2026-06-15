import { Check, X } from "lucide-react";
import { useMemo } from "react";

import type { ProjectMember } from "@/modules/projects/types/projects.types";
import { PRIORITY_META, TASK_STATUS_COLUMNS } from "@/shared/theme/design";
import { Avatar } from "@/shared/ui/Avatar";
import type { Task, TaskPriority, TaskStatus } from "@/modules/tasks/types/tasks.types";

const BASE_ASSIGNEE_OPTIONS = [
  { id: "me", name: "Me" },
  { id: "unassigned", name: "Unassigned" },
];

export type TaskFilterState = {
  filterStatus: TaskStatus[];
  filterPriority: TaskPriority[];
  filterAssignee: string[];
  dueFrom: string;
  dueTo: string;
};

export const DEFAULT_TASK_FILTERS: TaskFilterState = {
  filterStatus: [],
  filterPriority: [],
  filterAssignee: [],
  dueFrom: "",
  dueTo: "",
};

export function FilterPanel({
  tasks,
  state,
  currentUserId,
  assignees = [],
  onChange,
  onClear,
  onApply,
  onClose,
}: {
  tasks: Task[];
  state: TaskFilterState;
  currentUserId: string;
  assignees?: ProjectMember[];
  onChange: (next: Partial<TaskFilterState>) => void;
  onClear: () => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const assigneeOptions = useMemo(() => {
    const memberOptions = assignees
      .filter((member) => member.userId !== currentUserId)
      .map((member) => ({ id: member.userId, name: member.name }));

    return [...BASE_ASSIGNEE_OPTIONS, ...memberOptions];
  }, [assignees, currentUserId]);
  function toggleStatus(id: TaskStatus) {
    const checked = state.filterStatus.includes(id);
    onChange({
      filterStatus: checked
        ? state.filterStatus.filter((x) => x !== id)
        : [...state.filterStatus, id],
    });
  }

  function togglePriority(id: TaskPriority) {
    const checked = state.filterPriority.includes(id);
    onChange({
      filterPriority: checked
        ? state.filterPriority.filter((x) => x !== id)
        : [...state.filterPriority, id],
    });
  }

  function toggleAssignee(id: string) {
    const checked = state.filterAssignee.includes(id);
    onChange({
      filterAssignee: checked
        ? state.filterAssignee.filter((x) => x !== id)
        : [...state.filterAssignee, id],
    });
  }

  function countByStatus(status: TaskStatus) {
    return tasks.filter((t) => t.status === status).length;
  }

  function countByPriority(priority: TaskPriority) {
    return tasks.filter((t) => t.priority === priority).length;
  }

  function countByAssignee(id: string) {
    if (id === "me") return tasks.filter((t) => t.assigneeId === currentUserId).length;
    if (id === "unassigned") return tasks.filter((t) => !t.assigneeId).length;
    return tasks.filter((t) => t.assigneeId === id).length;
  }

  return (
    <aside className="filter-panel">
      <div className="filter-panel__header">
        <h3 className="filter-panel__title">Filter</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" className="btn-link" style={{ fontSize: 12 }} onClick={onClear}>
            Clear all
          </button>
          <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="filter-panel__body">
        <div className="filter-section">
          <h4 className="filter-section__label">Status</h4>
          <div className="filter-options" style={{ gap: 3 }}>
            {TASK_STATUS_COLUMNS.map((col) => {
              const checked = state.filterStatus.includes(col.id);
              return (
                <button
                  key={col.id}
                  type="button"
                  className={`filter-check-row${checked ? " filter-check-row--checked" : ""}`}
                  onClick={() => toggleStatus(col.id)}
                >
                  <span className={`filter-checkbox${checked ? " filter-checkbox--checked" : ""}`}>
                    {checked ? <Check size={9} color="#fff" strokeWidth={3.5} /> : null}
                  </span>
                  <span className="filter-dot" style={{ background: col.color }} />
                  <span className="filter-row-label">{col.label}</span>
                  <span className="filter-row-count">{countByStatus(col.id)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-section__label">Priority</h4>
          <div className="filter-options" style={{ gap: 3 }}>
            {(["high", "medium", "low"] as TaskPriority[]).map((key) => {
              const pm = PRIORITY_META[key];
              const checked = state.filterPriority.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`filter-check-row${checked ? " filter-check-row--checked" : ""}`}
                  onClick={() => togglePriority(key)}
                >
                  <span className={`filter-checkbox${checked ? " filter-checkbox--checked" : ""}`}>
                    {checked ? <Check size={9} color="#fff" strokeWidth={3.5} /> : null}
                  </span>
                  <span className="filter-dot" style={{ background: pm.color }} />
                  <span className="filter-row-label">{pm.label}</span>
                  <span className="filter-row-count">{countByPriority(key)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-section__label">Assignee</h4>
          <div className="filter-options" style={{ gap: 3 }}>
            {assigneeOptions.map((a) => {
              const checked = state.filterAssignee.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`filter-check-row${checked ? " filter-check-row--checked" : ""}`}
                  onClick={() => toggleAssignee(a.id)}
                >
                  <span className={`filter-checkbox${checked ? " filter-checkbox--checked" : ""}`}>
                    {checked ? <Check size={9} color="#fff" strokeWidth={3.5} /> : null}
                  </span>
                  <Avatar name={a.name} seed={a.id} size={20} />
                  <span className="filter-row-label">{a.name}</span>
                  <span className="filter-row-count">{countByAssignee(a.id)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-section" style={{ marginBottom: 4 }}>
          <h4 className="filter-section__label">Due date</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label" style={{ textTransform: "none", fontSize: 11 }}>
                From
              </label>
              <input
                type="date"
                className="field-input field-input--md"
                value={state.dueFrom}
                onChange={(e) => onChange({ dueFrom: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label" style={{ textTransform: "none", fontSize: 11 }}>
                To
              </label>
              <input
                type="date"
                className="field-input field-input--md"
                value={state.dueTo}
                onChange={(e) => onChange({ dueTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="filter-panel__footer">
        <button
          type="button"
          className="btn btn-primary btn-primary--md"
          style={{ width: "100%" }}
          onClick={onApply}
        >
          Apply filters
        </button>
      </div>
    </aside>
  );
}
