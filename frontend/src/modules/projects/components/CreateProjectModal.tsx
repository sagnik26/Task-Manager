import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import { toApiError } from "../../../shared/utils/apiErrors";

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
  onCreate: (values: CreateProjectValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<CreateProjectValues>({
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => values.name.trim().length > 0 && !submitting,
    [submitting, values.name],
  );

  async function handleCreate() {
    setErrors({});
    setSubmitError(null);
    if (!values.name.trim()) {
      setErrors({ name: "Project name is required" });
      return;
    }
    try {
      setSubmitting(true);
      await onCreate({
        name: values.name.trim(),
        description: values.description.trim(),
      });
      setValues({ name: "", description: "" });
      onClose();
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.kind === "validation") {
        setErrors({ name: apiError.fields.name });
      } else {
        setSubmitError(apiError.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create project</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: "grid", gap: 2 }}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          <TextField
            label="Name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            error={Boolean(errors.name)}
            helperText={errors.name}
            autoFocus
            required
          />
          <TextField
            label="Description"
            value={values.description}
            onChange={(e) =>
              setValues((v) => ({ ...v, description: e.target.value }))
            }
            multiline
            minRows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={() => void handleCreate()}
          variant="contained"
          disabled={!canSubmit}
        >
          {submitting ? "Creating…" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

