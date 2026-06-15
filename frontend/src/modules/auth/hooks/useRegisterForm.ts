import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  registerSchema,
  type RegisterInput,
} from "@/modules/auth/schemas/auth.schemas";
import { useAuth } from "@/modules/auth/context/useAuth";
import { handleAuthFormError } from "@/modules/auth/utils/authFormErrors";

export function useRegisterForm() {
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

  return {
    values,
    setValues,
    termsAccepted,
    setTermsAccepted,
    fieldErrors,
    formError,
    canSubmit,
    submitting,
    onSubmit,
  };
}
