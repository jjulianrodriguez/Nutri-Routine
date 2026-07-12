"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ActionButton } from "@/components/ui/actions/button";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { EmailInput } from "@/components/ui/forms/input";
import { requestPasswordRecovery } from "@/lib/actions/auth";
import {
 passwordRecoverySchema,
 type PasswordRecoveryValues,
} from "@/lib/validations/auth";

export function ForgotPasswordForm() {
 const [serverMessage, setServerMessage] = useState("");
 const [successMessage, setSuccessMessage] = useState("");
 const {
 formState: { errors, isSubmitting },
 clearErrors,
 handleSubmit,
 register,
 setError,
 } = useForm<PasswordRecoveryValues>({
 defaultValues: {
 email: "",
 },
 resolver: zodResolver(passwordRecoverySchema),
 });

 async function onSubmit(values: PasswordRecoveryValues) {
 clearErrors("root");
 setServerMessage("");
 setSuccessMessage("");

 const result = await requestPasswordRecovery(values);

 if (result.status === "error") {
 if (result.fieldErrors?.email) {
 setError("email", { message: result.fieldErrors.email });
 }

 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 setSuccessMessage(result.message);
 toast.success("Revisa tu correo.");
 }

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
 <FormField
 controlId="email"
 error={errors.email?.message}
 errorId="recovery-email-error"
 label="Email"
 labelClassName="text-sm font-bold"
 >
 <EmailInput
 id="email"
 autoComplete="email"
 size="lg"
 className="mt-2 placeholder:text-muted-foreground/70"
 placeholder="tu@email.com"
 {...register("email")}
 />
 </FormField>

 <FormAlert message={serverMessage} />

 <FormAlert tone="success" message={successMessage} />

 <ActionButton
 type="submit"
 loading={isSubmitting}
 loadingLabel="Enviando..."
 icon={<Mail className="size-4" />}
 className="h-[3.25rem] w-full rounded-control bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary-hover"
 >
 Enviar enlace seguro
 </ActionButton>

 <div className="pt-2 text-center text-sm">
 <Link
 href="/login"
 className="inline-flex items-center gap-2 font-bold text-primary underline decoration-primary-soft decoration-2 underline-offset-4 transition-colors hover:text-primary-hover"
 >
 <ArrowLeft className="size-4" />
 Volver a iniciar sesión
 </Link>
 </div>
 </form>
 );
}
