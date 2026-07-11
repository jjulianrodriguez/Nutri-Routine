"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FieldError, FormAlert } from "@/components/ui/form-field";
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

export function BasicAccountForm({ email, fullName }: BasicAccountFormProps) {
 const router = useRouter();
 const [pendingUpdate, setPendingUpdate] =
 useState<UpdateBasicAccountValues | null>(null);
 const [serverMessage, setServerMessage] = useState("");
 const [successMessage, setSuccessMessage] = useState("");
 const {
 clearErrors,
 formState: { errors, isDirty, isSubmitting },
 handleSubmit,
 register,
 reset,
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
 reset(pendingUpdate);
 toast.success(result.message);
 router.refresh();
 }

 return (
 <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
 <div>
 <Label htmlFor="accountFullName" className="font-extrabold text-foreground">
 Nombre completo visible
 </Label>
 <Input
 id="accountFullName"
 type="text"
 autoComplete="name"
 className="mt-2"
 aria-describedby={errors.fullName ? "account-full-name-error" : undefined}
 aria-invalid={Boolean(errors.fullName)}
 {...register("fullName")}
 />
 <p className="mt-2 text-xs leading-5 text-muted">
 Este es el lugar donde se edita tu nombre. En Configuracion aparece
 solo como resumen de cuenta.
 </p>
 <FieldError
 id="account-full-name-error"
 message={errors.fullName?.message}
 />
 </div>

 <div className="rounded-[18px] bg-background px-4 py-3">
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Email
 </p>
 <p className="mt-1 break-all font-bold text-foreground">
 {email || "Email no disponible"}
 </p>
 <p className="mt-2 text-xs leading-5 text-muted">
 El correo identifica tu acceso y no se cambia desde este formulario.
 </p>
 </div>

 <FormAlert message={serverMessage || errors.root?.message} />

 <FormAlert tone="success" message={successMessage} />

 <div className="flex flex-col gap-3 rounded-[20px] bg-surface/82 p-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-start gap-3 text-sm leading-6">
 <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-muted-foreground">
 {isDirty ? (
 <AlertCircle className="size-4" aria-hidden="true" />
 ) : (
 <CheckCircle2 className="size-4" aria-hidden="true" />
 )}
 </span>
 <div>
 <p className="font-extrabold text-foreground">
 {isDirty ? "Nombre con cambios pendientes" : "Nombre sin cambios"}
 </p>
 <p className="text-muted" aria-live="polite">
 {isDirty
 ? "Guarda para actualizar como te ve la app."
 : "No hay cambios sin guardar."}
 </p>
 </div>
 </div>
 <Button type="submit" disabled={isSubmitting || !isDirty} size="lg">
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
 </div>

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
