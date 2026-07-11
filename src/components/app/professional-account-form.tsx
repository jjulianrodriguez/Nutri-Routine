"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldError, FormAlert } from "@/components/ui/form-field";
import { EmailInput, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { createProfessionalAccount } from "@/lib/actions/professional-accounts";
import {
 createProfessionalAccountSchema,
 type CreateProfessionalAccountValues,
} from "@/lib/validations/professional-accounts";

const specialtyOptions = [
 {
 label: "Nutricionista",
 value: "nutrition",
 },
 {
 label: "Entrenadora",
 value: "training",
 },
 {
 label: "Entrenadora y nutricionista",
 value: "both",
 },
] as const;

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
 <Label htmlFor="fullName" className="font-extrabold text-foreground">
 Nombre completo
 </Label>
 <Input
 id="fullName"
 type="text"
 autoComplete="name"
 className="mt-2"
 placeholder="Nombre del profesional"
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
 <Label htmlFor="email" className="font-extrabold text-foreground">
 Email
 </Label>
 <EmailInput
 id="email"
 autoComplete="email"
 className="mt-2"
 placeholder="profesional@email.com"
 aria-describedby={
 errors.email ? "professional-email-error" : undefined
 }
 invalid={Boolean(errors.email)}
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
 className="font-extrabold text-foreground"
 >
 Contraseña temporal
 </Label>
 <PasswordInput
 id="temporaryPassword"
 visibilityLabel="contraseña temporal"
 autoComplete="new-password"
 className="mt-2"
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
 className="font-extrabold text-foreground"
 >
 Confirmar contraseña temporal
 </Label>
 <PasswordInput
 id="confirmTemporaryPassword"
 visibilityLabel="confirmación de contraseña temporal"
 autoComplete="new-password"
 className="mt-2"
 placeholder="Repite la contraseña"
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
 <Select
 id="specialty"
 label="Tipo de profesional"
 labelClassName="font-extrabold"
 error={errors.specialty?.message}
 {...register("specialty")}
 >
 {specialtyOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </Select>

 <div className="rounded-[20px] border-primary/25 bg-primary-soft p-4">
 <Label
 htmlFor="adminAccessCode"
 className="font-extrabold text-foreground"
 >
 Código de acceso administrativo
 </Label>
 <PasswordInput
 id="adminAccessCode"
 visibilityLabel="código administrativo"
 autoComplete="off"
 className="mt-2"
 placeholder="Código privado de administración"
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
