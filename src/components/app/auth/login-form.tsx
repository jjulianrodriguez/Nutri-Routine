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
import { EmailInput } from "@/components/ui/forms/input";
import { PasswordInput } from "@/components/ui/forms/password-input";
import { loginProfessional } from "@/lib/actions/auth";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

type LoginFormProps = {
 initialError?: string;
};

export function LoginForm({ initialError }: LoginFormProps) {
 const router = useRouter();
 const [serverMessage, setServerMessage] = useState(initialError ?? "");
 const {
 formState: { errors, isSubmitting },
 clearErrors,
 handleSubmit,
 register,
 setError,
 } = useForm<LoginValues>({
 defaultValues: {
 email: "",
 password: "",
 },
 resolver: zodResolver(loginSchema),
 });

 async function onSubmit(values: LoginValues) {
 clearErrors("root");
 setServerMessage("");

 const result = await loginProfessional(values);

 if (result.status === "error") {
 if (result.fieldErrors) {
 Object.entries(result.fieldErrors).forEach(([field, message]) => {
 if (message) {
 setError(field as keyof LoginValues, { message });
 }
 });
 }

 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 if (result.status !== "success") {
 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.replace(result.redirectTo);
 router.refresh();
 }

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
 <FormField
 controlId="email"
 error={errors.email?.message}
 errorId="login-email-error"
 label="Email"
 labelClassName="text-sm font-bold"
 >
 <EmailInput
 id="email"
 autoComplete="email"
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="tu@email.com"
 {...register("email")}
 />
 </FormField>

 <FormField
 controlId="password"
 error={errors.password?.message}
 errorId="login-password-error"
 label="Contraseña"
 labelClassName="text-sm font-bold"
 >
 <PasswordInput
 id="password"
 autoComplete="current-password"
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="Tu contraseña"
 {...register("password")}
 />
 <div className="mt-3 flex justify-end">
 <Link
 href="/forgot-password"
 className="text-sm font-bold text-primary underline decoration-primary-soft decoration-2 underline-offset-4 transition-colors hover:text-primary-hover"
 >
 ¿Olvidaste tu contraseña?
 </Link>
 </div>
 </FormField>

 <FormAlert message={serverMessage || errors.root?.message} />

 <ActionButton
 type="submit"
 loading={isSubmitting}
 loadingLabel="Entrando..."
 icon={<ArrowRight className="size-4" />}
 className="h-[3.25rem] w-full rounded-control bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary-hover"
 >
 Iniciar sesión
 </ActionButton>

 <div className="pt-2 text-center text-sm">
 <p className="text-muted-foreground">
 ¿No tenés cuenta?{" "}
 <Link
 href="/register"
 className="font-bold text-primary underline decoration-primary-soft decoration-2 underline-offset-4 transition-colors hover:text-primary-hover"
 >
 Registrate
 </Link>
 </p>
 </div>
 </form>
 );
}
