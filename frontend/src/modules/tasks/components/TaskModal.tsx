import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { toApiError } from "../../../shared/utils/apiErrors";
import { taskUpsertSchema } from "../task.schemas";
import type { Task, TaskPriority, TaskStatus } from "../../../types/tasks";

type TaskDraft = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string;
};

function toDraft(task?: Task | null): TaskDraft {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "todo",
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
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  mode: "create" | "edit";
  task?: Task | null;
  currentUserId: string;
  onClose: () => void;
  onSave: (next: Omit<Task, "id">, existingId?: string) => Promise<void> | void;
  onDelete?: (taskId: string) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => toDraft(task));
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(toDraft(task));
    setTitleError(null);
    setDueDateError(null);
    setSubmitError(null);
  }, [open, task]);

  const canSubmit = useMemo(
    () => draft.title.trim().length > 0 && !submitting,
    [draft.title, submitting],
  );

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
      if (apiError.kind === "forbidden") {
        setSubmitError("You don’t have permission to delete this task.");
        return;
      }
      setSubmitError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "create" ? "Create task" : "Edit task"}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: "grid", gap: 2 }}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          <TextField
            label="Title"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            error={Boolean(titleError)}
            helperText={titleError ?? " "}
            autoFocus
            required
          />

          <TextField
            label="Description"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            multiline
            minRows={3}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <FormControl size="small" fullWidth>
              <InputLabel id="task-status">Status</InputLabel>
              <Select
                labelId="task-status"
                label="Status"
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, status: e.target.value as TaskStatus }))
                }
              >
                <MenuItem value="todo">Todo</MenuItem>
                <MenuItem value="in_progress">In progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel id="task-priority">Priority</InputLabel>
              <Select
                labelId="task-priority"
                label="Priority"
                value={draft.priority}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    priority: e.target.value as TaskPriority,
                  }))
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <FormControl size="small" fullWidth>
              <InputLabel id="task-assignee">Assignee</InputLabel>
              <Select
                labelId="task-assignee"
                label="Assignee"
                value={draft.assigneeId ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    assigneeId: e.target.value ? String(e.target.value) : null,
                  }))
                }
              >
                <MenuItem value="">Unassigned</MenuItem>
                <MenuItem value={currentUserId}>Me</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Due date"
              type="date"
              value={draft.dueDate}
              onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
              error={Boolean(dueDateError)}
              helperText={dueDateError ?? " "}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {mode === "edit" && task?.id && onDelete ? (
          <Button
            onClick={() => void handleDelete()}
            disabled={submitting}
            color="error"
          >
            Delete
          </Button>
        ) : null}
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={() => void handleSave()}
          variant="contained"
          disabled={!canSubmit}
        >
          {submitting ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

