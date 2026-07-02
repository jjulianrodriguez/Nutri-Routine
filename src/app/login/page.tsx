import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Acceso privado al seguimiento de Nutrición Con Enfoque para clientes y profesionales.",
};

type LoginPageProps = {
  searchParams?: Promise<{
    authError?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  const params = await searchParams;
  const initialError =
    params?.authError === "confirmation"
      ? "No se pudo confirmar el email. Solicitá un nuevo enlace o intentá iniciar sesión."
      : undefined;

  return (
    <AuthCard
      headline="Bienvenida de vuelta"
      subtitle="Tu espacio de seguimiento te está esperando"
    >
      <LoginForm initialError={initialError} />
    </AuthCard>
  );
}
