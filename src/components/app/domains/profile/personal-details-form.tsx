"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
 AlertCircle,
 CheckCircle2,
 Loader2,
 LockKeyhole,
 Save,
 Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import {
 FormAlert,
 FormControl,
 FormField,
} from "@/components/ui/forms/form-field";
import { Input, NumberInput } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import {
 deletePersonalDetails,
 updatePersonalDetails,
} from "@/lib/actions/account";
import {
 personalDetailsSchema,
 type PersonalDetailsValues,
} from "@/lib/validations/personal-details";

const emptyValues: PersonalDetailsValues = {
 allergies: "",
 birthDate: "",
 bodyFatPercentage: "",
 bodyMeasurements: "",
 dietaryRestrictions: "",
 gender: "",
 genderDescription: "",
 heightCm: "",
 importantMedications: "",
 injuries: "",
 medicalConditions: "",
 phone: "",
 professionalNotes: "",
 weightKg: "",
};

export function PersonalDetailsForm({
 hasSavedDetails,
 initialValues,
 maxBirthDate,
 privacySettings,
}: {
 hasSavedDetails: boolean;
 initialValues: PersonalDetailsValues;
 maxBirthDate: string;
 privacySettings: {
 healthData: boolean;
 personalInfo: boolean;
 sensitiveNotes: boolean;
 };
}) {
 const router = useRouter();
 const [hasDetails, setHasDetails] = useState(hasSavedDetails);
 const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
 const [pendingUpdate, setPendingUpdate] =
 useState<PersonalDetailsValues | null>(null);
 const [serverMessage, setServerMessage] = useState("");
 const [successMessage, setSuccessMessage] = useState("");
 const {
 clearErrors,
 control,
 formState: { errors, isDirty, isSubmitting },
 handleSubmit,
 register,
 reset,
 setError,
 } = useForm<PersonalDetailsValues>({
 defaultValues: initialValues,
 resolver: zodResolver(personalDetailsSchema),
 });
 const selectedGender = useWatch({ control, name: "gender" });

 async function saveDetails(values: PersonalDetailsValues) {
 clearErrors("root");
 setServerMessage("");
 setSuccessMessage("");

 const result = await updatePersonalDetails(values);

 if (result.status === "error") {
 if (result.fieldErrors) {
 Object.entries(result.fieldErrors).forEach(([field, message]) => {
 if (message) {
 setError(field as keyof PersonalDetailsValues, { message });
 }
 });
 }

 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 const containsData = Object.values(values).some(
 (value) => value.trim() !== "",
 );
 setHasDetails(containsData);
 setSuccessMessage(result.message);
 reset(values);
 toast.success(result.message);
 router.refresh();
 }

 async function onSubmit(values: PersonalDetailsValues) {
 if (hasDetails) {
 setPendingUpdate(values);
 return;
 }

 await saveDetails(values);
 }

 async function confirmUpdate() {
 if (pendingUpdate) {
 await saveDetails(pendingUpdate);
 }
 }

 async function handleDelete() {
 setServerMessage("");
 setSuccessMessage("");

 try {
 const result = await deletePersonalDetails();

 if (result.status === "error") {
 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 reset(emptyValues);
 setHasDetails(false);
 setSuccessMessage(result.message);
 toast.success(result.message);
 router.refresh();
 } catch {
 toast.error(
 "Ocurrió un error inesperado al borrar los datos. Inténtalo de nuevo.",
 );
 }
 }

 return (
 <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
 <div className="rounded-[20px] border-primary/25 bg-primary-soft/60 p-4">
 <div className="flex items-start gap-3">
 <LockKeyhole
 className="mt-0.5 size-5 shrink-0 text-muted-foreground"
 aria-hidden="true"
 />
 <div>
 <h3 className="font-extrabold text-foreground">Antes de guardar</h3>
 <p className="mt-1 text-sm leading-6 text-muted">
 Tus profesionales asignados ven estos datos solo si lo permitiste
 en Configuracion. Ahora mismo: datos personales{" "}
 <strong>
 {privacySettings.personalInfo ? "visibles" : "ocultos"}
 </strong>
 , datos fisicos y salud{" "}
 <strong>{privacySettings.healthData ? "visibles" : "ocultos"}</strong>
 , notas sensibles{" "}
 <strong>
 {privacySettings.sensitiveNotes ? "visibles" : "ocultas"}
 </strong>
 . Admin autorizado puede revisarlos para soporte o gestion del
 plan.
 </p>
 </div>
 </div>
 </div>

 <div className="grid gap-5 md:grid-cols-2">
 <FormField
 controlId="personalPhone"
 error={errors.phone?.message}
 errorId="personal-phone-error"
 hint="Opcional. Se aceptan numeros, espacios, parentesis, guiones y +."
 hintClassName="text-xs"
 hintId="personal-phone-help"
 label="Teléfono"
 >
 <Input
 type="tel"
 autoComplete="tel"
 placeholder="+506 8888-8888"
 aria-invalid={Boolean(errors.phone)}
 {...register("phone")}
 />
 </FormField>

 <FormField
 controlId="personalBirthDate"
 error={errors.birthDate?.message}
 errorId="personal-birth-date-error"
 label="Fecha de nacimiento"
 >
 <Input
 type="date"
 max={maxBirthDate}
 aria-invalid={Boolean(errors.birthDate)}
 {...register("birthDate")}
 />
 </FormField>

 <Select
 id="personalGender"
 label="Genero"
 labelClassName="font-extrabold"
 className="font-semibold"
 error={errors.gender?.message}
 {...register("gender")}
 >
 <option value="">Sin especificar</option>
 <option value="male">Masculino</option>
 <option value="female">Femenino</option>
 <option value="non_binary">No binario</option>
 <option value="prefer_not_to_say">Prefiero no decir</option>
 <option value="self_described">Otro / Autodescripción</option>
 </Select>

{selectedGender === "self_described" ? (
 <FormField
 controlId="personalGenderDescription"
 error={errors.genderDescription?.message}
 errorId="personal-gender-description-error"
 label="Autodescripción"
 >
 <Input
 type="text"
 maxLength={120}
 placeholder="Como deseas describirte"
 aria-invalid={Boolean(errors.genderDescription)}
 {...register("genderDescription")}
 />
 </FormField>
 ) : null}

 <FormField
 autoControl={false}
 controlId="personalWeight"
 error={errors.weightKg?.message}
 errorId="personal-weight-error"
 label="Peso"
 >
 <div className="relative">
 <FormControl>
 <NumberInput
 inputMode="decimal"
 min="0.01"
 max="1000"
 step="0.01"
 placeholder="70"
 className="pr-12"
 invalid={Boolean(errors.weightKg)}
 {...register("weightKg")}
 />
 </FormControl>
 <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
 kg
 </span>
 </div>
 </FormField>

 <FormField
 autoControl={false}
 controlId="personalHeight"
 error={errors.heightCm?.message}
 errorId="personal-height-error"
 label="Altura"
 >
 <div className="relative">
 <FormControl>
 <NumberInput
 inputMode="decimal"
 min="0.01"
 max="300"
 step="0.01"
 placeholder="165"
 className="pr-12"
 invalid={Boolean(errors.heightCm)}
 {...register("heightCm")}
 />
 </FormControl>
 <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
 cm
 </span>
 </div>
 </FormField>

 <FormField
 autoControl={false}
 controlId="personalBodyFat"
 error={errors.bodyFatPercentage?.message}
 errorId="personal-body-fat-error"
 label="Porcentaje de grasa"
 >
 <div className="relative">
 <FormControl>
 <NumberInput
 inputMode="decimal"
 min="0.01"
 max="100"
 step="0.01"
 placeholder="18"
 className="pr-12"
 invalid={Boolean(errors.bodyFatPercentage)}
 {...register("bodyFatPercentage")}
 />
 </FormControl>
 <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
 %
 </span>
 </div>
 </FormField>
 </div>

 <FormField
 controlId="personalBodyMeasurements"
 error={errors.bodyMeasurements?.message}
 errorId="personal-body-measurements-error"
 hint="Opcional. Usa el formato que tu profesional ya revise contigo."
 hintClassName="text-xs leading-5"
 hintId="personal-body-measurements-help"
 label="Medidas fisicas por zonas"
 >
 <Textarea
 rows={4}
 maxLength={4000}
 placeholder="Ejemplo: cintura, cadera, pecho, brazo, pierna u otras zonas relevantes"
 aria-invalid={Boolean(errors.bodyMeasurements)}
 {...register("bodyMeasurements")}
 />
 </FormField>

 <FormField
 controlId="personalMedicalConditions"
 error={errors.medicalConditions?.message}
 errorId="personal-medical-conditions-error"
 hint="Opcional y privado. No se utiliza para limitar tu acceso ni generar recomendaciones medicas."
 hintClassName="text-xs leading-5"
 hintId="personal-medical-conditions-help"
 label="Enfermedades o condiciones medicas"
 >
 <Textarea
 rows={5}
 maxLength={4000}
 placeholder="Información que deseas conservar en tu perfil"
 aria-invalid={Boolean(errors.medicalConditions)}
 {...register("medicalConditions")}
 />
 </FormField>

 <div className="grid gap-5 lg:grid-cols-2">
 <FormField
 controlId="personalInjuries"
 error={errors.injuries?.message}
 errorId="personal-injuries-error"
 label="Lesiones"
 >
 <Textarea
 rows={4}
 maxLength={4000}
 placeholder="Lesiones actuales o historial relevante"
 aria-invalid={Boolean(errors.injuries)}
 {...register("injuries")}
 />
 </FormField>

 <FormField
 controlId="personalAllergies"
 error={errors.allergies?.message}
 errorId="personal-allergies-error"
 label="Alergias"
 >
 <Textarea
 rows={4}
 maxLength={4000}
 placeholder="Alergias alimentarias, medicamentos u otras"
 aria-invalid={Boolean(errors.allergies)}
 {...register("allergies")}
 />
 </FormField>

 <FormField
 controlId="personalImportantMedications"
 error={errors.importantMedications?.message}
 errorId="personal-important-medications-error"
 label="Medicamentos importantes"
 >
 <Textarea
 rows={4}
 maxLength={4000}
 placeholder="Medicamentos o suplementos relevantes para tu seguimiento"
 aria-invalid={Boolean(errors.importantMedications)}
 {...register("importantMedications")}
 />
 </FormField>

 <FormField
 controlId="personalDietaryRestrictions"
 error={errors.dietaryRestrictions?.message}
 errorId="personal-dietary-restrictions-error"
 label="Restricciones alimentarias"
 >
 <Textarea
 rows={4}
 maxLength={4000}
 placeholder="Preferencias, restricciones o alimentos a evitar"
 aria-invalid={Boolean(errors.dietaryRestrictions)}
 {...register("dietaryRestrictions")}
 />
 </FormField>
 </div>

 <FormField
 controlId="personalProfessionalNotes"
 error={errors.professionalNotes?.message}
 errorId="personal-professional-notes-error"
 hint="Tus datos de salud solo deben ser visibles para profesionales asignados y administradores autorizados."
 hintClassName="text-xs leading-5"
 hintId="personal-professional-notes-help"
 label="Notas importantes para el profesional"
 >
 <Textarea
 rows={4}
 maxLength={4000}
 placeholder="Informacion que tu profesional asignado debe considerar"
 aria-invalid={Boolean(errors.professionalNotes)}
 {...register("professionalNotes")}
 />
 </FormField>

 <FormAlert message={serverMessage || errors.root?.message} />

 <FormAlert tone="success" message={successMessage} />

 <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-[24px] bg-surface/90 p-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
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
 {isDirty ? "Datos personales con cambios" : "Datos personales al dia"}
 </p>
 <p className="text-muted" aria-live="polite">
 {isDirty
 ? "Guarda para actualizar tu perfil privado."
 : "No hay cambios sin guardar."}
 </p>
 </div>
 </div>
 <div className="flex flex-col gap-3 sm:flex-row">
 <Button
 type="submit"
 disabled={isSubmitting || !isDirty}
 size="lg"
 >
 {isSubmitting ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <Save className="size-4" aria-hidden="true" />
 )}
 {isSubmitting ? "Guardando..." : "Guardar información"}
 </Button>

 {hasDetails ? (
 <Button
 type="button"
 variant="destructive"
 size="lg"
 onClick={() => setIsConfirmingDelete(true)}
 disabled={isSubmitting}
 >
 <Trash2 className="size-4" aria-hidden="true" />
 Borrar datos opcionales
 </Button>
 ) : null}
 </div>
 </div>

 <ConfirmationDialog
 open={Boolean(pendingUpdate)}
 onOpenChange={(open) => {
 if (!open) {
 setPendingUpdate(null);
 }
 }}
 title="Guardar información personal"
 description="Se actualizarán los datos opcionales de tu perfil con la información ingresada."
 confirmLabel="Guardar cambios"
 pendingLabel="Guardando…"
 onConfirm={confirmUpdate}
 />

 <ConfirmationDialog
 open={isConfirmingDelete}
 onOpenChange={setIsConfirmingDelete}
 title="Borrar datos personales opcionales"
 description="Se eliminará toda tu información personal opcional. Esta acción no afecta tu cuenta ni tu acceso."
 confirmLabel="Borrar datos"
 pendingLabel="Eliminando…"
 tone="destructive"
 onConfirm={handleDelete}
 />
 </form>
 );
}
