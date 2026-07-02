import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getCurrentUser } from "@/lib/auth/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
 title: "Recuperar contraseña",
 description:
 "Solicita un enlace seguro para recuperar el acceso a Nutrición Con Enfoque.",
};

export default async function ForgotPasswordPage() {
 const user = await getCurrentUser();

 if (user) {
 redirect("/app");
 }

 return (
 <AuthCard
 headline="Recuperar acceso"
 subtitle="Ingresa tu email y te enviaremos un enlace seguro para crear una nueva contraseña."
 >
 <ForgotPasswordForm />
 </AuthCard>
 );
}
