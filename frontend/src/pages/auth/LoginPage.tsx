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

          <div className="auth-divider">
            <div className="auth-divider__line" />
            <span className="auth-divider__text">or continue with</span>
            <div className="auth-divider__line" />
          </div>

          <button type="button" className="btn btn-google">
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
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
