"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ActionButton } from "@/components/ui/actions/button";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { EmailInput, Input } from "@/components/ui/forms/input";
import { PasswordInput } from "@/components/ui/forms/password-input";
import { registerProfessional } from "@/lib/actions/auth";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";

export function RegisterForm() {
 const router = useRouter();
 const [successMessage, setSuccessMessage] = useState("");
 const [serverMessage, setServerMessage] = useState("");
 const {
 formState: { errors, isSubmitting },
 clearErrors,
 handleSubmit,
 register,
 setError,
 } = useForm<RegisterValues>({
 defaultValues: {
 accessCode: "",
 confirmPassword: "",
 email: "",
 fullName: "",
 password: "",
 },
 resolver: zodResolver(registerSchema),
 });

 async function onSubmit(values: RegisterValues) {
 clearErrors("root");
 setServerMessage("");
 setSuccessMessage("");

 const result = await registerProfessional(values);

 if (result.status === "error") {
 if (result.fieldErrors) {
 Object.entries(result.fieldErrors).forEach(([field, message]) => {
 if (message) {
 setError(field as keyof RegisterValues, { message });
 }
 });
 }

 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 if (result.status === "email_confirmation_required") {
 setSuccessMessage(result.message);
 toast.success("Cuenta creada.");
 return;
 }

 toast.success(result.message);
 router.replace(result.redirectTo);
 router.refresh();
 }

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
 <FormField
 controlId="fullName"
 error={errors.fullName?.message}
 errorId="register-full-name-error"
 label="Nombre completo"
 labelClassName="text-sm font-bold"
 >
 <Input
 type="text"
 autoComplete="name"
 invalid={Boolean(errors.fullName)}
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="Tu nombre completo"
 {...register("fullName")}
 />
 </FormField>

 <FormField
 controlId="email"
 error={errors.email?.message}
 errorId="register-email-error"
 label="Email"
 labelClassName="text-sm font-bold"
 >
 <EmailInput
 autoComplete="email"
 invalid={Boolean(errors.email)}
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="tu@email.com"
 {...register("email")}
 />
 </FormField>

 <FormField
 className="rounded-card bg-primary-tint/45 p-4"
 controlId="accessCode"
 error={errors.accessCode?.message}
 errorId="register-access-code-error"
 hint="Código privado entregado por tu profesional."
 hintClassName="font-semibold text-muted-foreground"
 hintId="register-access-code-help"
 label="Código de acceso"
 labelClassName="text-sm font-bold"
 >
 <Input
 type="text"
 autoComplete="off"
 invalid={Boolean(errors.accessCode)}
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="Código privado entregado por tu profesional"
 {...register("accessCode")}
 />
 </FormField>

 <FormField
 controlId="password"
 error={errors.password?.message}
 errorId="register-password-error"
 label="Contraseña"
 labelClassName="text-sm font-bold"
 >
 <PasswordInput
 autoComplete="new-password"
 invalid={Boolean(errors.password)}
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="Mínimo 8 caracteres"
 {...register("password")}
 />
 </FormField>

 <FormField
 controlId="confirmPassword"
 error={errors.confirmPassword?.message}
 errorId="register-confirm-password-error"
 label="Confirmar contraseña"
 labelClassName="text-sm font-bold"
 >
 <PasswordInput
 visibilityLabel="confirmación de contraseña"
 autoComplete="new-password"
 invalid={Boolean(errors.confirmPassword)}
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="Repetí tu contraseña"
 {...register("confirmPassword")}
 />
 </FormField>

 <FormAlert message={serverMessage || errors.root?.message} />

 <FormAlert tone="success">
 {successMessage
 ? `${successMessage} Cuando confirmes tu email, podés iniciar sesión.`
 : null}
 </FormAlert>

 <ActionButton
 type="submit"
 loading={isSubmitting}
 loadingLabel="Creando cuenta..."
 icon={<ArrowRight className="size-4" />}
 className="h-[3.25rem] w-full rounded-control bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary-hover"
 >
 Crear cuenta
 </ActionButton>

 <div className="pt-2 text-center text-sm">
 <p className="text-muted-foreground">
 ¿Ya tenés cuenta?{" "}
 <Link
 href="/login"
 className="font-bold text-primary underline decoration-primary-soft decoration-2 underline-offset-4 transition-colors hover:text-primary-hover"
 >
 Iniciá sesión
 </Link>
 </p>
 </div>
 </form>
 );
}
