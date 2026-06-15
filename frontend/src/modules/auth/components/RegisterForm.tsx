import Link from "next/link";

import type { RegisterInput } from "@/modules/auth/schemas/auth.schemas";

export function RegisterForm({
  values,
  fieldErrors,
  formError,
  termsAccepted,
  canSubmit,
  submitting,
  onChange,
  onTermsChange,
  onSubmit,
}: {
  values: RegisterInput;
  fieldErrors: Partial<Record<keyof RegisterInput, string>>;
  formError: string | null;
  termsAccepted: boolean;
  canSubmit: boolean;
  submitting: boolean;
  onChange: (values: RegisterInput) => void;
  onTermsChange: (accepted: boolean) => void;
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
            onChange={(e) => onChange({ ...values, name: e.target.value })}
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
            onChange={(e) => onChange({ ...values, email: e.target.value })}
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
            onChange={(e) => onChange({ ...values, password: e.target.value })}
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
          onChange={(e) => onTermsChange(e.target.checked)}
        />
        <label htmlFor="terms">
          I agree to the{" "}
          <span style={{ color: "var(--blue)" }}>Terms of Service</span> and{" "}
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
        <Link href="/login" className="btn-link btn-link--bold">
          Sign in
        </Link>
      </p>
    </form>
  );
}
