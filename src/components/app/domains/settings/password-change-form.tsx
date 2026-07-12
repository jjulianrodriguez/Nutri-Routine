"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/actions/button";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { PasswordInput } from "@/components/ui/forms/password-input";
import { changePassword } from "@/lib/actions/account";
import {
 changePasswordSchema,
 type ChangePasswordValues,
} from "@/lib/validations/account";

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
 <FormField
 controlId="currentPassword"
 error={errors.currentPassword?.message}
 errorId="current-password-error"
 hint="Se validará si tu cuenta requiere confirmar la contraseña actual."
 hintClassName="text-xs"
 hintId="current-password-help"
 label="Contraseña actual"
 >
 <PasswordInput
 visibilityLabel="contraseña actual"
 autoComplete="current-password"
 className="h-12 placeholder:text-muted"
 placeholder="Tu contraseña actual"
 invalid={Boolean(errors.currentPassword)}
 {...register("currentPassword")}
 />
 </FormField>

 <FormField
 controlId="newPassword"
 error={errors.newPassword?.message}
 errorId="new-password-error"
 hint="Minimo 8 caracteres, con al menos una letra y un numero."
 hintClassName="text-xs"
 hintId="new-password-help"
 label="Nueva contraseña"
 >
 <PasswordInput
 visibilityLabel="nueva contraseña"
 autoComplete="new-password"
 className="h-12 placeholder:text-muted"
 placeholder="Minimo 8 caracteres"
 invalid={Boolean(errors.newPassword)}
 {...register("newPassword")}
 />
 </FormField>

 <FormField
 controlId="confirmNewPassword"
 error={errors.confirmNewPassword?.message}
 errorId="confirm-new-password-error"
 label="Confirmar nueva contraseña"
 >
 <PasswordInput
 visibilityLabel="confirmación de nueva contraseña"
 autoComplete="new-password"
 className="h-12 placeholder:text-muted"
 placeholder="Repite la nueva contraseña"
 invalid={Boolean(errors.confirmNewPassword)}
 {...register("confirmNewPassword")}
 />
 </FormField>

 <FormAlert message={serverMessage || errors.root?.message} />

 <FormAlert tone="success" message={successMessage} />

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
