import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Nueva contraseña",
 description:
 "Crea una contraseña segura para volver a entrar a Nutrición Con Enfoque.",
};

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
