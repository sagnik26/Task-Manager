import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  registerSchema,
  type RegisterInput,
} from "../../modules/auth/schemas/auth.schemas";
import { useAuth } from "../../modules/auth/context/useAuth.ts";
import { handleAuthFormError } from "../../shared/utils/authFormErrors";
import { DarkModeToggle } from "../../shared/ui/DarkModeToggle";
import { Logo } from "../../shared/ui/Logo";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [values, setValues] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});

  const canSubmit = useMemo(
    () =>
      values.name.trim().length > 0 &&
      values.email.trim().length > 0 &&
      values.password.length > 0 &&
      termsAccepted,
    [termsAccepted, values.email, values.name, values.password],
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
    <div className="auth-page">
      <div className="auth-blob auth-blob--tr" />
      <div className="auth-blob auth-blob--bl" />
      <DarkModeToggle className="icon-btn icon-btn--auth" />

      <div className="auth-card">
        <div className="auth-card__logo">
          <Logo />
        </div>

        <h2 className="auth-card__title">Get started free</h2>
        <p className="auth-card__subtitle" style={{ marginBottom: 24 }}>
          No credit card required
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          {formError ? <div className="alert-error" style={{ marginBottom: 13 }}>{formError}</div> : null}

          <div className="auth-fields" style={{ gap: 12 }}>
            <div>
              <label className="field-label" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className="field-input"
                type="text"
                placeholder="Robin Baker"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                autoComplete="name"
              />
              {fieldErrors.name ? (
                <div className="field-error">{fieldErrors.name}</div>
              ) : null}
            </div>

            <div>
              <label className="field-label" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                className="field-input"
                type="email"
                placeholder="you@company.com"
                value={values.email}
                onChange={(e) =>
                  setValues((v) => ({ ...v, email: e.target.value }))
                }
                autoComplete="email"
              />
              {fieldErrors.email ? (
                <div className="field-error">{fieldErrors.email}</div>
              ) : null}
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="field-input"
                type="password"
                placeholder="Min. 8 characters"
                value={values.password}
                onChange={(e) =>
                  setValues((v) => ({ ...v, password: e.target.value }))
                }
                autoComplete="new-password"
              />
              {fieldErrors.password ? (
                <div className="field-error">{fieldErrors.password}</div>
              ) : null}
            </div>
          </div>

          <div className="auth-terms">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <span style={{ color: "var(--blue)" }}>Terms of Service</span> and{" "}
              <span style={{ color: "var(--blue)" }}>Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-primary--lg"
            style={{ width: "100%", marginBottom: 22 }}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Creating…" : "Create account"}
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <RouterLink to="/login" className="btn-link btn-link--bold">
              Sign in
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  );
}
