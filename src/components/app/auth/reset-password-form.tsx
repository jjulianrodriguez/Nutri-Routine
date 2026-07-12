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
import { PasswordInput } from "@/components/ui/forms/password-input";
import { createClient } from "@/lib/supabase/client";
import {
 resetPasswordSchema,
 type ResetPasswordValues,
} from "@/lib/validations/auth";

export function ResetPasswordForm() {
 const router = useRouter();
 const [serverMessage, setServerMessage] = useState("");
 const {
 formState: { errors, isSubmitting },
 clearErrors,
 handleSubmit,
 register,
 setError,
 } = useForm<ResetPasswordValues>({
 defaultValues: {
 confirmPassword: "",
 password: "",
 },
 resolver: zodResolver(resetPasswordSchema),
 });

 async function onSubmit(values: ResetPasswordValues) {
 clearErrors("root");
 setServerMessage("");

 const supabase = createClient();
 const { error } = await supabase.auth.updateUser({
 password: values.password,
 });

 if (error) {
 const message =
 "No pudimos actualizar tu contraseña. Solicita un nuevo enlace e inténtalo otra vez.";
 setError("root", { message });
 setServerMessage(message);
 toast.error(message);
 return;
 }

 toast.success("Contraseña actualizada.");
 router.replace("/app");
 router.refresh();
 }

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
<FormField
 controlId="password"
 error={errors.password?.message}
 errorId="reset-password-error"
 label="Nueva contraseña"
 labelClassName="text-sm font-bold"
 >
 <PasswordInput
 id="password"
 autoComplete="new-password"
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="Mínimo 8 caracteres"
 {...register("password")}
 />
 </FormField>

<FormField
 controlId="confirmPassword"
 error={errors.confirmPassword?.message}
 errorId="reset-confirm-password-error"
 label="Confirmar contraseña"
 labelClassName="text-sm font-bold"
 >
 <PasswordInput
 id="confirmPassword"
 visibilityLabel="confirmación de contraseña"
 autoComplete="new-password"
 size="lg"
 className="placeholder:text-muted-foreground/70"
 placeholder="Repite tu contraseña"
 {...register("confirmPassword")}
 />
 </FormField>

 <FormAlert message={serverMessage || errors.root?.message} />

 <ActionButton
 type="submit"
 loading={isSubmitting}
 loadingLabel="Guardando..."
 icon={<ArrowRight className="size-4" />}
 className="h-[3.25rem] w-full rounded-control bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary-hover"
 >
 Guardar nueva contraseña
 </ActionButton>

 <p className="pt-2 text-center text-sm text-muted-foreground">
 ¿El enlace expiró?{" "}
 <Link
 href="/forgot-password"
 className="font-bold text-primary underline decoration-primary-soft decoration-2 underline-offset-4 transition-colors hover:text-primary-hover"
 >
 Solicita otro enlace
 </Link>
 </p>
 </form>
 );
}
