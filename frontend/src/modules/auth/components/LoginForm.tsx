import Link from "next/link";

import type { LoginInput } from "@/modules/auth/schemas/auth.schemas";

export function LoginForm({
  values,
  fieldErrors,
  formError,
  canSubmit,
  submitting,
  onChange,
  onSubmit,
}: {
  values: LoginInput;
  fieldErrors: Partial<Record<keyof LoginInput, string>>;
  formError: string | null;
  canSubmit: boolean;
  submitting: boolean;
  onChange: (values: LoginInput) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {formError ? (
        <div className="alert-error" style={{ marginBottom: 13 }}>
          {formError}
        </div>
      ) : null}

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
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            autoComplete="email"
          />
          {fieldErrors.email ? (
            <div className="field-error">{fieldErrors.email}</div>
          ) : null}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <label
              className="field-label"
              htmlFor="password"
              style={{ marginBottom: 0 }}
            >
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
            onChange={(e) => onChange({ ...values, password: e.target.value })}
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
        <Link href="/register" className="btn-link btn-link--bold">
          Create one →
        </Link>
      </p>
    </form>
  );
}
