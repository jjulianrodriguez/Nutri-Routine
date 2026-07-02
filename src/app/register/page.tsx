import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
 title: "Crear cuenta",
 description:
 "Registro privado con código entregado por tu profesional de Nutrición Con Enfoque.",
};

export default async function RegisterPage() {
 const user = await getCurrentUser();

 if (user) {
 redirect("/app");
 }

 return (
 <AuthCard
 headline="Empezá con calma"
 subtitle="Creá tu cuenta y ordená tu bienestar con acompañamiento"
 >
 <RegisterForm />
 </AuthCard>
 );
}
