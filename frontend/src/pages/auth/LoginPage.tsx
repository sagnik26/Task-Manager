import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  loginSchema,
  type LoginInput,
} from "../../modules/auth/schemas/auth.schemas";
import { useAuth } from "../../modules/auth/context/useAuth.ts";
import { handleAuthFormError } from "../../shared/utils/authFormErrors";
import { DarkModeToggle } from "../../shared/ui/DarkModeToggle";
import { Logo } from "../../shared/ui/Logo";

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
    <div className="auth-page">
      <div className="auth-blob auth-blob--tr" />
      <div className="auth-blob auth-blob--bl" />
      <DarkModeToggle className="icon-btn icon-btn--auth" />

      <div className="auth-card">
        <div className="auth-card__logo">
          <Logo />
        </div>

        <h2 className="auth-card__title">Welcome back</h2>
        <p className="auth-card__subtitle">Sign in to continue</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          {formError ? <div className="alert-error" style={{ marginBottom: 13 }}>{formError}</div> : null}

          <div className="auth-fields">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="field-input"
                type="email"
                placeholder="you@company.com"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                autoComplete="email"
              />
              {fieldErrors.email ? (
                <div className="field-error">{fieldErrors.email}</div>
              ) : null}
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="field-label" htmlFor="password" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <button type="button" className="btn-link" style={{ fontSize: 12 }}>
                  Forgot?
                </button>
              </div>
              <input
                id="password"
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={(e) =>
                  setValues((v) => ({ ...v, password: e.target.value }))
                }
                autoComplete="current-password"
              />
              {fieldErrors.password ? (
                <div className="field-error">{fieldErrors.password}</div>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-primary--lg"
            style={{ width: "100%", marginTop: 20 }}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="auth-switch">
            No account yet?{" "}
            <RouterLink to="/register" className="btn-link btn-link--bold">
              Create one →
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  );
}
