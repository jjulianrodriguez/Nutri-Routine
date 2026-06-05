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
  "mt-2 h-14 rounded-full border-charcoal/10 bg-white px-5 text-espresso shadow-none placeholder:text-stone/60 focus-visible:border-terracotta focus-visible:ring-4 focus-visible:ring-terracotta/25";

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
        <Label htmlFor="email" className="text-sm font-bold text-espresso">
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
        <Label htmlFor="password" className="text-sm font-bold text-espresso">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
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
            Entrando...
          </>
        ) : (
          <>
            Iniciar sesión
            <ArrowRight className="size-4" />
          </>
        )}
      </motion.button>

      <div className="pt-2 text-center text-sm">
        <p className="text-stone">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-bold text-espresso underline decoration-terracotta decoration-2 underline-offset-4 transition-none"
          >
            Registrate
          </Link>
        </p>
      </div>
    </form>
  );
}
