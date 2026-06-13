"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBasicAccount } from "@/lib/actions/account";
import {
  updateBasicAccountSchema,
  type UpdateBasicAccountValues,
} from "@/lib/validations/account";

type BasicAccountFormProps = {
  email: string;
  fullName: string;
};

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

export function BasicAccountForm({ email, fullName }: BasicAccountFormProps) {
  const router = useRouter();
  const [pendingUpdate, setPendingUpdate] =
    useState<UpdateBasicAccountValues | null>(null);
  const [serverMessage, setServerMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<UpdateBasicAccountValues>({
    defaultValues: {
      fullName,
    },
    resolver: zodResolver(updateBasicAccountSchema),
  });

  function onSubmit(values: UpdateBasicAccountValues) {
    clearErrors("root");
    setServerMessage("");
    setSuccessMessage("");
    setPendingUpdate(values);
  }

  async function confirmUpdate() {
    if (!pendingUpdate) {
      return;
    }

    const result = await updateBasicAccount(pendingUpdate);

    if (result.status === "error") {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as keyof UpdateBasicAccountValues, { message });
          }
        });
      }

      setServerMessage(result.message);
      toast.error(result.message);
      return;
    }

    setSuccessMessage(result.message);
    toast.success(result.message);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="accountFullName" className="font-extrabold text-charcoal">
          Nombre completo
        </Label>
        <Input
          id="accountFullName"
          type="text"
          autoComplete="name"
          className="mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20"
          aria-describedby={errors.fullName ? "account-full-name-error" : undefined}
          aria-invalid={Boolean(errors.fullName)}
          {...register("fullName")}
        />
        <FieldError
          id="account-full-name-error"
          message={errors.fullName?.message}
        />
      </div>

      <div className="rounded-[18px] border border-border bg-background px-4 py-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
          Email
        </p>
        <p className="mt-1 break-all font-bold text-charcoal">
          {email || "Email no disponible"}
        </p>
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

      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="size-4" />
            Guardar cambios
          </>
        )}
      </Button>

      <ConfirmationDialog
        open={Boolean(pendingUpdate)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingUpdate(null);
          }
        }}
        title="Guardar cambios de cuenta"
        description="Se actualizará el nombre asociado a tu cuenta. El correo y los permisos actuales no cambiarán."
        confirmLabel="Guardar cambios"
        pendingLabel="Guardando…"
        onConfirm={confirmUpdate}
      />
    </form>
  );
}
