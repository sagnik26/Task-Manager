import { useMemo, useState } from "react";
import { X } from "lucide-react";

export type CreateProjectValues = {
  name: string;
  description: string;
};

export function CreateProjectModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (values: CreateProjectValues) => void;
}) {
  const [values, setValues] = useState<CreateProjectValues>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  const canSubmit = useMemo(
    () => values.name.trim().length > 0,
    [values.name],
  );

  if (!open) return null;

  function handleCreate() {
    setErrors({});
    if (!values.name.trim()) {
      setErrors({ name: "Project name is required" });
      return;
    }
    onCreate({
      name: values.name.trim(),
      description: values.description.trim(),
    });
    setValues({ name: "", description: "" });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby="create-project-title"
      >
        <div className="modal-card__header">
          <h3 className="modal-card__title" id="create-project-title">
            Create project
          </h3>
          <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className="modal-card__body">
          <div style={{ marginBottom: 13 }}>
            <label className="field-label" htmlFor="project-name">
              Project name
            </label>
            <input
              id="project-name"
              className="field-input"
              placeholder="Website Redesign"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              autoFocus
            />
            {errors.name ? <div className="field-error">{errors.name}</div> : null}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="field-label" htmlFor="project-desc">
              Description
            </label>
            <textarea
              id="project-desc"
              className="field-input"
              style={{ height: 88, padding: "10px 14px", resize: "vertical" }}
              placeholder="Optional description"
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
            />
          </div>

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
              className="btn btn-primary btn-primary--sm"
              style={{ height: 38, padding: "0 20px" }}
              onClick={handleCreate}
              disabled={!canSubmit}
            >
              Create project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
