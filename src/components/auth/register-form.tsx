"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { registerProfessional } from "@/lib/actions/auth";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";

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

const inputClasses =
  "mt-2 h-14 rounded-full border-charcoal/10 bg-white px-5 text-espresso shadow-none placeholder:text-stone/60 focus-visible:border-terracotta focus-visible:ring-4 focus-visible:ring-terracotta/25";

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
        <Label htmlFor="fullName" className="text-sm font-bold text-espresso">
          Nombre completo
        </Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          aria-describedby={
            errors.fullName ? "register-full-name-error" : undefined
          }
          aria-invalid={Boolean(errors.fullName)}
          className={inputClasses}
          placeholder="Tu nombre completo"
          {...register("fullName")}
        />
        <FieldError
          id="register-full-name-error"
          message={errors.fullName?.message}
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-bold text-espresso">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-describedby={errors.email ? "register-email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          className={inputClasses}
          placeholder="tu@email.com"
          {...register("email")}
        />
        <FieldError id="register-email-error" message={errors.email?.message} />
      </div>

      <div className="rounded-[20px] border border-stone-soft bg-blush p-4">
        <Label htmlFor="accessCode" className="text-sm font-bold text-espresso">
          Código de acceso
        </Label>
        <Input
          id="accessCode"
          type="text"
          autoComplete="off"
          aria-describedby={
            errors.accessCode ? "register-access-code-error" : undefined
          }
          aria-invalid={Boolean(errors.accessCode)}
          className="mt-2 h-14 rounded-full border-charcoal/10 bg-white px-5 text-espresso shadow-none placeholder:text-stone/60 focus-visible:border-terracotta focus-visible:ring-4 focus-visible:ring-terracotta/25"
          placeholder="Código privado"
          {...register("accessCode")}
        />
        <FieldError
          id="register-access-code-error"
          message={errors.accessCode?.message}
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-bold text-espresso">
          Contraseña
        </Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-describedby={
            errors.password ? "register-password-error" : undefined
          }
          aria-invalid={Boolean(errors.password)}
          className={inputClasses}
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
              ? "register-confirm-password-error"
              : undefined
          }
          aria-invalid={Boolean(errors.confirmPassword)}
          className={inputClasses}
          placeholder="Repetí tu contraseña"
          {...register("confirmPassword")}
        />
        <FieldError
          id="register-confirm-password-error"
          message={errors.confirmPassword?.message}
        />
      </div>

      {serverMessage || errors.root?.message ? (
        <Alert
          variant="destructive"
          className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
        >
          <AlertDescription className="font-semibold text-danger">
            {serverMessage || errors.root?.message}
          </AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert
          className="rounded-[18px] border-success/20 bg-success/5 px-4 py-3"
          role="status"
        >
          <AlertDescription className="font-semibold text-success">
            {successMessage}
          </AlertDescription>
        </Alert>
      ) : null}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta py-4 text-sm font-extrabold text-white shadow-soft disabled:opacity-50"
        whileHover={isSubmitting ? undefined : { scale: 1.018 }}
        whileTap={isSubmitting ? undefined : { scale: 0.99 }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          <>
            Crear cuenta
            <ArrowRight className="size-4" />
          </>
        )}
      </motion.button>

      <div className="pt-2 text-center text-sm">
        <p className="text-stone">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-bold text-espresso underline decoration-terracotta decoration-2 underline-offset-4 transition-none"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </form>
  );
}
