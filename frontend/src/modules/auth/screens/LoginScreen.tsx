import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { useLoginForm } from "@/modules/auth/hooks/useLoginForm";

export function LoginScreen() {
  const form = useLoginForm();

  return (
    <AuthLayout>
      <AuthCard title="Welcome back" subtitle="Sign in to continue">
        <LoginForm
          values={form.values}
          fieldErrors={form.fieldErrors}
          formError={form.formError}
          canSubmit={form.canSubmit}
          submitting={form.submitting}
          onChange={form.setValues}
          onSubmit={() => void form.onSubmit()}
        />
      </AuthCard>
    </AuthLayout>
  );
}
