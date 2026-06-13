import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { toApiError } from "../../../shared/utils/apiErrors";
import { TASK_STATUS_COLUMNS, PRIORITY_META } from "../../../shared/theme/design";
import { taskUpsertSchema } from "../task.schemas";
import type { ProjectMember } from "../../../api/projects.api";
import type { Task, TaskPriority, TaskStatus } from "../../../types/tasks";

type TaskDraft = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string;
};

function toDraft(task?: Task | null, defaultStatus?: TaskStatus): TaskDraft {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? defaultStatus ?? "todo",
    priority: task?.priority ?? "medium",
    assigneeId: task?.assigneeId ?? null,
    dueDate: task?.dueDate ?? "",
  };
}

export function TaskModal({
  open,
  mode,
  task,
  currentUserId,
  assignees,
  defaultStatus,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  mode: "create" | "edit";
  task?: Task | null;
  currentUserId: string;
  assignees: ProjectMember[];
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSave: (next: Omit<Task, "id">, existingId?: string) => Promise<void> | void;
  onDelete?: (taskId: string) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => toDraft(task, defaultStatus));
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(toDraft(task, defaultStatus));
    setTitleError(null);
    setDueDateError(null);
    setSubmitError(null);
  }, [defaultStatus, open, task]);

  const canSubmit = useMemo(
    () => draft.title.trim().length > 0 && !submitting,
    [draft.title, submitting],
  );

  const assigneeOptions = useMemo(() => {
    const options = [...assignees];
    if (
      task?.assigneeId &&
      !options.some((member) => member.userId === task.assigneeId)
    ) {
      options.push({
        userId: task.assigneeId,
        name: "Former member",
        email: "",
        role: "developer",
        joinedAt: "",
      });
    }
    return options;
  }, [assignees, task?.assigneeId]);

  if (!open) return null;

  async function handleSave() {
    setTitleError(null);
    setDueDateError(null);
    setSubmitError(null);

    const parsed = taskUpsertSchema.safeParse({
      title: draft.title.trim(),
      description: draft.description.trim() ? draft.description.trim() : undefined,
      status: draft.status,
      priority: draft.priority,
      assigneeId: draft.assigneeId,
      dueDate: draft.dueDate ? draft.dueDate : null,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "title") setTitleError(issue.message);
        if (key === "dueDate") setDueDateError(issue.message);
      }
      return;
    }

    try {
      setSubmitting(true);
      await onSave(
        {
          title: parsed.data.title,
          description: parsed.data.description ? parsed.data.description : null,
          status: parsed.data.status,
          priority: parsed.data.priority,
          assigneeId: parsed.data.assigneeId,
          dueDate: parsed.data.dueDate,
        },
        task?.id,
      );
      onClose();
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.kind === "validation") {
        setTitleError(apiError.fields.title ?? null);
        setDueDateError(apiError.fields.due_date ?? null);
        setSubmitError(apiError.fields.description ?? null);
        return;
      }
      if (apiError.kind === "forbidden") {
        setSubmitError("You don’t have permission to modify this task.");
        return;
      }
      setSubmitError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!task?.id || !onDelete) return;
    setSubmitError(null);
    const ok = window.confirm("Delete this task? This cannot be undone.");
    if (!ok) return;
    try {
      setSubmitting(true);
      await onDelete(task.id);
      onClose();
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(
        apiError.kind === "forbidden"
          ? "You don’t have permission to delete this task."
          : apiError.message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby="task-modal-title"
      >
        <div className="modal-card__header">
          <h3 className="modal-card__title" id="task-modal-title">
            {mode === "create" ? "Create new task" : "Edit task"}
          </h3>
          <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className="modal-card__body">
          {submitError ? <div className="alert-error" style={{ marginBottom: 15 }}>{submitError}</div> : null}

          <div style={{ marginBottom: 15 }}>
            <label className="field-label" htmlFor="task-title">
              Task title
            </label>
            <input
              id="task-title"
              className="field-input"
              style={{ fontSize: 15 }}
              placeholder="What needs to be done?"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              autoFocus
            />
            {titleError ? <div className="field-error">{titleError}</div> : null}
          </div>

          <div style={{ marginBottom: 15 }}>
            <label className="field-label" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              className="field-input"
              style={{ height: 88, padding: "10px 14px", resize: "vertical" }}
              placeholder="Optional details"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>

          <div className="modal-grid">
            <div>
              <label className="field-label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className="field-input field-input--md"
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, status: e.target.value as TaskStatus }))
                }
              >
                {TASK_STATUS_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="field-input field-input--md"
                value={draft.priority}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, priority: e.target.value as TaskPriority }))
                }
              >
                {(["low", "medium", "high"] as TaskPriority[]).map((key) => (
                  <option key={key} value={key}>
                    {PRIORITY_META[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-grid" style={{ marginBottom: 20 }}>
            <div>
              <label className="field-label" htmlFor="task-due">
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                className="field-input field-input--md"
                value={draft.dueDate}
                onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
              />
              {dueDateError ? <div className="field-error">{dueDateError}</div> : null}
            </div>
            <div>
              <label className="field-label" htmlFor="task-assignee">
                Assignee
              </label>
              <select
                id="task-assignee"
                className="field-input field-input--md"
                value={draft.assigneeId ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    assigneeId: e.target.value ? e.target.value : null,
                  }))
                }
              >
                <option value="">Unassigned</option>
                {assigneeOptions.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.userId === currentUserId
                      ? `${member.name} (Me)`
                      : member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            {mode === "edit" && task?.id && onDelete ? (
              <button
                type="button"
                className="btn btn-outline"
                style={{ height: 38, padding: "0 18px", marginRight: "auto", color: "var(--danger)", borderColor: "var(--danger)" }}
                onClick={() => void handleDelete()}
                disabled={submitting}
              >
                Delete
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-outline"
              style={{ height: 38, padding: "0 18px" }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-primary--sm"
              style={{ height: 38, padding: "0 20px", boxShadow: "0 2px 8px rgba(0,115,234,0.28)" }}
              onClick={() => void handleSave()}
              disabled={!canSubmit}
            >
              {submitting ? "Saving…" : mode === "create" ? "Create task" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
