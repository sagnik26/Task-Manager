import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import { useRegisterForm } from "@/modules/auth/hooks/useRegisterForm";

export function RegisterScreen() {
  const form = useRegisterForm();

  return (
    <AuthLayout>
      <AuthCard
        title="Get started free"
        subtitle="No credit card required"
        subtitleStyle={{ marginBottom: 24 }}
      >
        <RegisterForm
          values={form.values}
          fieldErrors={form.fieldErrors}
          formError={form.formError}
          termsAccepted={form.termsAccepted}
          canSubmit={form.canSubmit}
          submitting={form.submitting}
          onChange={form.setValues}
          onTermsChange={form.setTermsAccepted}
          onSubmit={() => void form.onSubmit()}
        />
      </AuthCard>
    </AuthLayout>
  );
}
