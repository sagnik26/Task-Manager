import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  registerSchema,
  type RegisterInput,
} from "../../modules/auth/schemas/auth.schemas";
import { useAuth } from "../../modules/auth/context/useAuth.ts";
import { handleAuthFormError } from "../../shared/utils/authFormErrors";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [values, setValues] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});

  const canSubmit = useMemo(
    () =>
      values.name.trim().length > 0 &&
      values.email.trim().length > 0 &&
      values.password.length > 0,
    [values.email, values.name, values.password],
  );

  async function onSubmit() {
    setFormError(null);
    setFieldErrors({});

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof RegisterInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterInput | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setSubmitting(true);
      await register(parsed.data);
      navigate("/projects");
    } catch (err) {
      handleAuthFormError<keyof RegisterInput>({
        error: err,
        allowedFieldKeys: ["name", "email", "password"],
        setFieldErrors,
        setFormError,
        conflictMessage: "An account with this email already exists.",
        defaultMessage: "Registration failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: "grid", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Register
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit();
            }}
            sx={{ display: "grid", gap: 2 }}
          >
            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <TextField
              label="Name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              autoComplete="name"
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={values.email}
              onChange={(e) =>
                setValues((v) => ({ ...v, email: e.target.value }))
              }
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              autoComplete="email"
              fullWidth
              required
            />

            <TextField
              label="Password"
              type="password"
              value={values.password}
              onChange={(e) =>
                setValues((v) => ({ ...v, password: e.target.value }))
              }
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              autoComplete="new-password"
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Creating…" : "Create account"}
            </Button>

            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login">
                Log in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

