"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordRecovery } from "@/lib/actions/auth";
import {
  passwordRecoverySchema,
  type PasswordRecoveryValues,
} from "@/lib/validations/auth";

const inputClasses =
  "mt-2 h-[3.25rem] rounded-[16px] border-border bg-surface px-4 text-espresso shadow-none placeholder:text-stone/60 focus-visible:border-terracotta focus-visible:ring-4 focus-visible:ring-terracotta/20";

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
      <div>
        <Label htmlFor="email" className="text-sm font-bold text-espresso">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-describedby={
            errors.email ? "recovery-email-error" : undefined
          }
          aria-invalid={Boolean(errors.email)}
          className={inputClasses}
          placeholder="tu@email.com"
          {...register("email")}
        />
        {errors.email?.message ? (
          <p
            id="recovery-email-error"
            className="mt-2 text-sm font-semibold text-danger"
            role="alert"
          >
            {errors.email.message}
          </p>
        ) : null}
      </div>

      {serverMessage ? (
        <Alert
          variant="destructive"
          className="rounded-[1.1rem] border-danger/20 bg-danger/5 px-4 py-3"
        >
          <AlertDescription className="font-semibold text-danger">
            {serverMessage}
          </AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert
          className="rounded-[1.1rem] border-success/20 bg-success/5 px-4 py-3"
          role="status"
        >
          <AlertDescription className="font-semibold text-success">
            {successMessage}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-[3.25rem] w-full rounded-full bg-espresso text-sm font-extrabold text-white hover:bg-charcoal"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            Enviar enlace seguro
            <Mail className="size-4" />
          </>
        )}
      </Button>

      <div className="pt-2 text-center text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-bold text-espresso underline decoration-terracotta decoration-2 underline-offset-4 transition-colors hover:text-terracotta"
        >
          <ArrowLeft className="size-4" />
          Volver a iniciar sesión
        </Link>
      </div>
    </form>
  );
}
