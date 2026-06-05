import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      headline="Comenzá tu camino"
      subtitle="Creá tu cuenta y empezá a transformar tu bienestar"
    >
      <RegisterForm />
    </AuthCard>
  );
}
