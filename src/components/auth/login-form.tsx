"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ActionButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { loginProfessional } from "@/lib/actions/auth";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

function FieldError({ id, message }: { id: string; message?: string }) {
 if (!message) {
 return null;
 }

 return (
 <p id={id} className="mt-2 text-sm font-semibold text-danger" role="alert">
 {message}
 </p>
 );
}

type LoginFormProps = {
 initialError?: string;
};

const inputClasses =
 "mt-2 h-[3.25rem] rounded-control bg-surface px-4 text-foreground placeholder:text-muted-foreground/70 ring-2 ring-primary/30 focus:bg-primary-soft dark:ring-primary/40 dark:focus:bg-primary-soft outline-none";

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
 <div>
 <Label htmlFor="email" className="text-sm font-bold text-foreground">
 Email
 </Label>
 <Input
 id="email"
 type="email"
 autoComplete="email"
 aria-describedby={errors.email ? "login-email-error" : undefined}
 aria-invalid={Boolean(errors.email)}
 className={inputClasses}
 placeholder="tu@email.com"
 {...register("email")}
 />
 <FieldError id="login-email-error" message={errors.email?.message} />
 </div>

 <div>
 <Label htmlFor="password" className="text-sm font-bold text-foreground">
 Contraseña
 </Label>
 <PasswordInput
 id="password"
 autoComplete="current-password"
 aria-describedby={
 errors.password ? "login-password-error" : undefined
 }
 aria-invalid={Boolean(errors.password)}
 className={inputClasses}
 placeholder="Tu contraseña"
 {...register("password")}
 />
 <FieldError
 id="login-password-error"
 message={errors.password?.message}
 />
 <div className="mt-3 flex justify-end">
 <Link
 href="/forgot-password"
 className="text-sm font-bold text-primary underline decoration-primary-soft decoration-2 underline-offset-4 transition-colors hover:text-primary-hover"
 >
 ¿Olvidaste tu contraseña?
 </Link>
 </div>
 </div>

 {serverMessage || errors.root?.message ? (
 <Alert
 variant="destructive"
 className="rounded-[1.1rem] border-danger/20 bg-danger/5 px-4 py-3"
 >
 <AlertDescription className="font-semibold text-danger">
 {serverMessage || errors.root?.message}
 </AlertDescription>
 </Alert>
 ) : null}

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
