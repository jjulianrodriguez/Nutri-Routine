"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { changePassword } from "@/lib/actions/account";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/validations/account";

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

export function PasswordChangeForm() {
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
  } = useForm<ChangePasswordValues>({
    defaultValues: {
      confirmNewPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordValues) {
    clearErrors("root");
    setServerMessage("");
    setSuccessMessage("");

    const result = await changePassword(values);

    if (result.status === "error") {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as keyof ChangePasswordValues, { message });
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
      <div>
        <Label
          htmlFor="currentPassword"
          className="font-extrabold text-charcoal"
        >
          Contraseña actual
        </Label>
        <PasswordInput
          id="currentPassword"
          visibilityLabel="contraseña actual"
          autoComplete="current-password"
          className={inputClasses}
          placeholder="Tu contraseña actual"
          aria-describedby={
            errors.currentPassword
              ? "current-password-error"
              : "current-password-help"
          }
          aria-invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
        <p id="current-password-help" className="mt-2 text-xs text-muted">
          Se validará si tu cuenta requiere confirmar la contraseña actual.
        </p>
        <FieldError
          id="current-password-error"
          message={errors.currentPassword?.message}
        />
      </div>

      <div>
        <Label htmlFor="newPassword" className="font-extrabold text-charcoal">
          Nueva contraseña
        </Label>
        <PasswordInput
          id="newPassword"
          visibilityLabel="nueva contraseña"
          autoComplete="new-password"
          className={inputClasses}
          placeholder="Minimo 8 caracteres"
          aria-describedby={
            errors.newPassword ? "new-password-error" : "new-password-help"
          }
          aria-invalid={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
        <p id="new-password-help" className="mt-2 text-xs text-muted">
          Minimo 8 caracteres, con al menos una letra y un numero.
        </p>
        <FieldError
          id="new-password-error"
          message={errors.newPassword?.message}
        />
      </div>

      <div>
        <Label
          htmlFor="confirmNewPassword"
          className="font-extrabold text-charcoal"
        >
          Confirmar nueva contraseña
        </Label>
        <PasswordInput
          id="confirmNewPassword"
          visibilityLabel="confirmación de nueva contraseña"
          autoComplete="new-password"
          className={inputClasses}
          placeholder="Repite la nueva contraseña"
          aria-describedby={
            errors.confirmNewPassword
              ? "confirm-new-password-error"
              : undefined
          }
          aria-invalid={Boolean(errors.confirmNewPassword)}
          {...register("confirmNewPassword")}
        />
        <FieldError
          id="confirm-new-password-error"
          message={errors.confirmNewPassword?.message}
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

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Actualizando...
          </>
        ) : (
          <>
            <LockKeyhole className="size-4" aria-hidden="true" />
            Actualizar contraseña
          </>
        )}
      </Button>
    </form>
  );
}
