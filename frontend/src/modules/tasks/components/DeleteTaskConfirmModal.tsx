import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { toApiError } from "@/shared/utils/apiErrors";
import type { Task } from "@/modules/tasks/types/tasks.types";

export function DeleteTaskConfirmModal({
  open,
  task,
  onClose,
  onConfirm,
}: {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    setSubmitting(false);
  }, [open, task?.id]);

  if (!open || !task) return null;

  async function handleConfirm() {
    if (!task) return;
    setSubmitError(null);
    try {
      setSubmitting(true);
      await onConfirm(task.id);
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
        if (e.key === "Escape" && !submitting) onClose();
      }}
      role="presentation"
    >
      <div
        className="modal-card modal-card--confirm"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby="delete-task-title"
      >
        <div className="modal-card__header">
          <h3 className="modal-card__title" id="delete-task-title">
            Delete task
          </h3>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="modal-card__body">
          {submitError ? (
            <div className="alert-error" style={{ marginBottom: 15 }}>
              {submitError}
            </div>
          ) : null}

          <p className="modal-card__message">
            Delete <strong>{task.title}</strong>? This cannot be undone.
          </p>

          <div className="modal-actions">
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
              className="btn btn-outline"
              style={{
                height: 38,
                padding: "0 18px",
                color: "var(--danger)",
                borderColor: "var(--danger)",
              }}
              onClick={() => void handleConfirm()}
              disabled={submitting}
            >
              {submitting ? "Deleting…" : "Delete task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
