import { X } from "lucide-react";

export function DeleteConfirmModal({
  open,
  title,
  itemName,
  detail,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  itemName: string | null | undefined;
  detail?: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !itemName) return null;

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  const titleId = "delete-confirm-title";

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
        className="modal-card modal-card--confirm"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
      >
        <div className="modal-card__header">
          <h3 className="modal-card__title" id={titleId}>
            {title}
          </h3>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="modal-card__body">
          <p className="modal-card__message">
            Delete <strong>{itemName}</strong>?
            {detail ? ` ${detail}` : null} This cannot be undone.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              style={{ height: 38, padding: "0 18px" }}
              onClick={onClose}
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
              onClick={handleConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
