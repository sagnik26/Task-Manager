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
  loginSchema,
  type LoginInput,
} from "../../modules/auth/schemas/auth.schemas";
import { useAuth } from "../../modules/auth/context/useAuth.ts";
import { handleAuthFormError } from "../../shared/utils/authFormErrors";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
  >({});

  const canSubmit = useMemo(
    () => values.email.trim().length > 0 && values.password.length > 0,
    [values.email, values.password],
  );

  async function onSubmit() {
    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof LoginInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LoginInput | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setSubmitting(true);
      await login(parsed.data);
      navigate("/projects");
    } catch (err) {
      handleAuthFormError<keyof LoginInput>({
        error: err,
        allowedFieldKeys: ["email", "password"],
        setFieldErrors,
        setFormError,
        unauthorizedMessage: "Invalid email or password.",
        defaultMessage: "Login failed. Please try again.",
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
            Login
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
              label="Email"
              type="email"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
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
              autoComplete="current-password"
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Logging in…" : "Log in"}
            </Button>

            <Typography variant="body2" color="text.secondary">
              Don’t have an account?{" "}
              <Link component={RouterLink} to="/register">
                Register
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

