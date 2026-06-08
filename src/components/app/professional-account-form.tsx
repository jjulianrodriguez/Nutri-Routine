"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProfessionalAccount } from "@/lib/actions/professional-accounts";
import {
  createProfessionalAccountSchema,
  type CreateProfessionalAccountValues,
} from "@/lib/validations/professional-accounts";
import { cn } from "@/lib/utils";

const specialtyOptions = [
  {
    label: "Nutricionista",
    value: "nutrition",
  },
  {
    label: "Entrenadora personal",
    value: "training",
  },
  {
    label: "Ambas areas",
    value: "both",
  },
] as const;

const inputClasses =
  "mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20";

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

export function ProfessionalAccountForm() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CreateProfessionalAccountValues>({
    defaultValues: {
      adminAccessCode: "",
      confirmTemporaryPassword: "",
      email: "",
      fullName: "",
      specialty: "nutrition",
      temporaryPassword: "",
    },
    resolver: zodResolver(createProfessionalAccountSchema),
  });

  async function onSubmit(values: CreateProfessionalAccountValues) {
    clearErrors("root");
    setServerMessage("");
    setSuccessMessage("");

    const result = await createProfessionalAccount(values);

    if (result.status === "error") {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as keyof CreateProfessionalAccountValues, {
              message,
            });
          }
        });
      }

      setServerMessage(result.message);
      toast.error(result.message);
      return;
    }

    reset();
    setSuccessMessage(result.message);
    toast.success(result.message);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <Label htmlFor="fullName" className="font-extrabold text-charcoal">
            Nombre completo
          </Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            className={inputClasses}
            placeholder="Nombre de la profesional"
            aria-describedby={
              errors.fullName ? "professional-full-name-error" : undefined
            }
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
          <FieldError
            id="professional-full-name-error"
            message={errors.fullName?.message}
          />
        </div>

        <div>
          <Label htmlFor="email" className="font-extrabold text-charcoal">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClasses}
            placeholder="profesional@email.com"
            aria-describedby={
              errors.email ? "professional-email-error" : undefined
            }
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError
            id="professional-email-error"
            message={errors.email?.message}
          />
        </div>

        <div>
          <Label
            htmlFor="temporaryPassword"
            className="font-extrabold text-charcoal"
          >
            Contrasena temporal
          </Label>
          <Input
            id="temporaryPassword"
            type="password"
            autoComplete="new-password"
            className={inputClasses}
            placeholder="Minimo 8 caracteres"
            aria-describedby={
              errors.temporaryPassword
                ? "professional-temporary-password-error"
                : undefined
            }
            aria-invalid={Boolean(errors.temporaryPassword)}
            {...register("temporaryPassword")}
          />
          <FieldError
            id="professional-temporary-password-error"
            message={errors.temporaryPassword?.message}
          />
        </div>

        <div>
          <Label
            htmlFor="confirmTemporaryPassword"
            className="font-extrabold text-charcoal"
          >
            Confirmar contrasena temporal
          </Label>
          <Input
            id="confirmTemporaryPassword"
            type="password"
            autoComplete="new-password"
            className={inputClasses}
            placeholder="Repite la contrasena"
            aria-describedby={
              errors.confirmTemporaryPassword
                ? "professional-confirm-password-error"
                : undefined
            }
            aria-invalid={Boolean(errors.confirmTemporaryPassword)}
            {...register("confirmTemporaryPassword")}
          />
          <FieldError
            id="professional-confirm-password-error"
            message={errors.confirmTemporaryPassword?.message}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Label htmlFor="specialty" className="font-extrabold text-charcoal">
            Tipo de profesional
          </Label>
          <select
            id="specialty"
            className={cn(inputClasses, "w-full appearance-none")}
            aria-describedby={
              errors.specialty ? "professional-specialty-error" : undefined
            }
            aria-invalid={Boolean(errors.specialty)}
            {...register("specialty")}
          >
            {specialtyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError
            id="professional-specialty-error"
            message={errors.specialty?.message}
          />
        </div>

        <div className="rounded-[20px] border border-primary/25 bg-primary-soft p-4">
          <Label
            htmlFor="adminAccessCode"
            className="font-extrabold text-charcoal"
          >
            Codigo de acceso administrativo
          </Label>
          <Input
            id="adminAccessCode"
            type="password"
            autoComplete="off"
            className="mt-2 h-12 rounded-control border-primary/20 bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20"
            placeholder="Codigo privado de administracion"
            aria-describedby={
              errors.adminAccessCode
                ? "professional-admin-code-error"
                : undefined
            }
            aria-invalid={Boolean(errors.adminAccessCode)}
            {...register("adminAccessCode")}
          />
          <FieldError
            id="professional-admin-code-error"
            message={errors.adminAccessCode?.message}
          />
        </div>
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

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            Crear cuenta
          </>
        )}
      </Button>
    </form>
  );
}
