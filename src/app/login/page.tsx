import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    authError?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app/dashboard");
  }

  const params = await searchParams;
  const initialError =
    params?.authError === "confirmation"
      ? "No se pudo confirmar el email. Solicitá un nuevo enlace o intentá iniciar sesión."
      : undefined;

  return (
    <AuthCard
      headline="Bienvenida/o de vuelta"
      subtitle="Tu progreso te está esperando"
    >
      <LoginForm initialError={initialError} />
    </AuthCard>
  );
}
