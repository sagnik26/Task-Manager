import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  loginSchema,
  type LoginInput,
} from "@/modules/auth/schemas/auth.schemas";
import { useAuth } from "@/modules/auth/context/useAuth";
import { handleAuthFormError } from "@/modules/auth/utils/authFormErrors";

export function useLoginForm() {
  const router = useRouter();
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
      router.push("/projects");
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

  return {
    values,
    setValues,
    fieldErrors,
    formError,
    canSubmit,
    submitting,
    onSubmit,
  };
}
