import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      headline="Nueva contraseña"
      subtitle="Crea una contraseña segura para volver a entrar a tu cuenta."
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
