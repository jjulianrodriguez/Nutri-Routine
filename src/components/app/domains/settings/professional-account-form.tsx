"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/actions/button";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { EmailInput, Input } from "@/components/ui/forms/input";
import { PasswordInput } from "@/components/ui/forms/password-input";
import { Select } from "@/components/ui/forms/select";
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
 <FormField
 controlId="fullName"
 error={errors.fullName?.message}
 errorId="professional-full-name-error"
 label="Nombre completo"
 >
 <Input
 type="text"
 autoComplete="name"
 placeholder="Nombre del profesional"
 aria-invalid={Boolean(errors.fullName)}
 {...register("fullName")}
 />
 </FormField>

 <FormField
 controlId="email"
 error={errors.email?.message}
 errorId="professional-email-error"
 label="Email"
 >
 <EmailInput
 autoComplete="email"
 placeholder="profesional@email.com"
 invalid={Boolean(errors.email)}
 {...register("email")}
 />
 </FormField>

 <FormField
 controlId="temporaryPassword"
 error={errors.temporaryPassword?.message}
 errorId="professional-temporary-password-error"
 label="Contraseña temporal"
 >
 <PasswordInput
 visibilityLabel="contraseña temporal"
 autoComplete="new-password"
 placeholder="Minimo 8 caracteres"
 aria-invalid={Boolean(errors.temporaryPassword)}
 {...register("temporaryPassword")}
 />
 </FormField>

 <FormField
 controlId="confirmTemporaryPassword"
 error={errors.confirmTemporaryPassword?.message}
 errorId="professional-confirm-password-error"
 label="Confirmar contraseña temporal"
 >
 <PasswordInput
 visibilityLabel="confirmación de contraseña temporal"
 autoComplete="new-password"
 placeholder="Repite la contraseña"
 aria-invalid={Boolean(errors.confirmTemporaryPassword)}
 {...register("confirmTemporaryPassword")}
 />
 </FormField>
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

 <FormField
 className="rounded-[20px] border-primary/25 bg-primary-soft p-4"
 controlId="adminAccessCode"
 error={errors.adminAccessCode?.message}
 errorId="professional-admin-code-error"
 label="Código de acceso administrativo"
 >
 <PasswordInput
 visibilityLabel="código administrativo"
 autoComplete="off"
 placeholder="Código privado de administración"
 aria-invalid={Boolean(errors.adminAccessCode)}
 {...register("adminAccessCode")}
 />
 </FormField>
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
