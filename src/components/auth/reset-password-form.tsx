"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validations/auth";

const inputClasses =
  "mt-2 h-[3.25rem] rounded-[16px] border-border bg-surface px-4 text-espresso shadow-none placeholder:text-stone/60 focus-visible:border-terracotta focus-visible:ring-4 focus-visible:ring-terracotta/20";

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
      <div>
        <Label htmlFor="password" className="text-sm font-bold text-espresso">
          Nueva contraseña
        </Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-describedby={
            errors.password ? "reset-password-error" : undefined
          }
          aria-invalid={Boolean(errors.password)}
          className={inputClasses}
          placeholder="Mínimo 8 caracteres"
          {...register("password")}
        />
        <FieldError
          id="reset-password-error"
          message={errors.password?.message}
        />
      </div>

      <div>
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-bold text-espresso"
        >
          Confirmar contraseña
        </Label>
        <PasswordInput
          id="confirmPassword"
          visibilityLabel="confirmación de contraseña"
          autoComplete="new-password"
          aria-describedby={
            errors.confirmPassword
              ? "reset-confirm-password-error"
              : undefined
          }
          aria-invalid={Boolean(errors.confirmPassword)}
          className={inputClasses}
          placeholder="Repite tu contraseña"
          {...register("confirmPassword")}
        />
        <FieldError
          id="reset-confirm-password-error"
          message={errors.confirmPassword?.message}
        />
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

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-[3.25rem] w-full rounded-full bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary-hover"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            Guardar nueva contraseña
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <p className="pt-2 text-center text-sm text-stone">
        ¿El enlace expiró?{" "}
        <Link
          href="/forgot-password"
          className="font-bold text-espresso underline decoration-terracotta decoration-2 underline-offset-4 transition-colors hover:text-terracotta"
        >
          Solicita otro enlace
        </Link>
      </p>
    </form>
  );
}
