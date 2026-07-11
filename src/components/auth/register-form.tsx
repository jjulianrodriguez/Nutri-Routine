"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ActionButton } from "@/components/ui/button";
import { FieldError, FormAlert } from "@/components/ui/form-field";
import { EmailInput, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
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
 <div>
 <Label htmlFor="fullName" className="text-sm font-bold text-foreground">
 Nombre completo
 </Label>
 <Input
 id="fullName"
 type="text"
 autoComplete="name"
 aria-describedby={
 errors.fullName ? "register-full-name-error" : undefined
 }
 invalid={Boolean(errors.fullName)}
 size="lg"
 className="mt-2 placeholder:text-muted-foreground/70"
 placeholder="Tu nombre completo"
 {...register("fullName")}
 />
 <FieldError
 id="register-full-name-error"
 message={errors.fullName?.message}
 />
 </div>

 <div>
 <Label htmlFor="email" className="text-sm font-bold text-foreground">
 Email
 </Label>
 <EmailInput
 id="email"
 autoComplete="email"
 aria-describedby={errors.email ? "register-email-error" : undefined}
 invalid={Boolean(errors.email)}
 size="lg"
 className="mt-2 placeholder:text-muted-foreground/70"
 placeholder="tu@email.com"
 {...register("email")}
 />
 <FieldError id="register-email-error" message={errors.email?.message} />
 </div>

 <div className="rounded-card bg-primary-soft/45 p-4">
 <Label htmlFor="accessCode" className="text-sm font-bold text-foreground">
 Código de acceso
 </Label>
 <Input
 id="accessCode"
 type="text"
 autoComplete="off"
 aria-describedby={
 errors.accessCode
 ? "register-access-code-error register-access-code-help"
 : "register-access-code-help"
 }
 invalid={Boolean(errors.accessCode)}
 size="lg"
 className="mt-2 placeholder:text-muted-foreground/70"
 placeholder="Código privado entregado por tu profesional"
 {...register("accessCode")}
 />
 <p
 id="register-access-code-help"
 className="mt-2 text-sm font-semibold leading-6 text-muted-foreground"
 >
 Código privado entregado por tu profesional.
 </p>
 <FieldError
 id="register-access-code-error"
 message={errors.accessCode?.message}
 />
 </div>

 <div>
 <Label htmlFor="password" className="text-sm font-bold text-foreground">
 Contraseña
 </Label>
 <PasswordInput
 id="password"
 autoComplete="new-password"
 aria-describedby={
 errors.password ? "register-password-error" : undefined
 }
 invalid={Boolean(errors.password)}
 size="lg"
 className="mt-2 placeholder:text-muted-foreground/70"
 placeholder="Mínimo 8 caracteres"
 {...register("password")}
 />
 <FieldError
 id="register-password-error"
 message={errors.password?.message}
 />
 </div>

 <div>
 <Label
 htmlFor="confirmPassword"
 className="text-sm font-bold text-foreground"
 >
 Confirmar contraseña
 </Label>
 <PasswordInput
 id="confirmPassword"
 visibilityLabel="confirmación de contraseña"
 autoComplete="new-password"
 aria-describedby={
 errors.confirmPassword
 ? "register-confirm-password-error"
 : undefined
 }
 invalid={Boolean(errors.confirmPassword)}
 size="lg"
 className="mt-2 placeholder:text-muted-foreground/70"
 placeholder="Repetí tu contraseña"
 {...register("confirmPassword")}
 />
 <FieldError
 id="register-confirm-password-error"
 message={errors.confirmPassword?.message}
 />
 </div>

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
