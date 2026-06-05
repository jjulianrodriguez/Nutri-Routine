import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app/dashboard");
  }

  return (
    <AuthCard
      headline="Comenzá tu camino"
      subtitle="Creá tu cuenta y empezá a transformar tu bienestar"
    >
      <RegisterForm />
    </AuthCard>
  );
}
