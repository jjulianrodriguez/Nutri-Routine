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

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FieldError, FormAlert } from "@/components/ui/form-field";
import { Input, NumberInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
 <div>
 <Label htmlFor="personalPhone" className="font-extrabold text-foreground">
 Teléfono
 </Label>
 <Input
 id="personalPhone"
 type="tel"
 autoComplete="tel"
 placeholder="+506 8888-8888"
 className="mt-2"
 aria-describedby={
 errors.phone ? "personal-phone-error" : "personal-phone-help"
 }
 aria-invalid={Boolean(errors.phone)}
 {...register("phone")}
 />
 <p id="personal-phone-help" className="mt-2 text-xs text-muted">
 Opcional. Se aceptan numeros, espacios, parentesis, guiones y +.
 </p>
 <FieldError
 id="personal-phone-error"
 message={errors.phone?.message}
 />
 </div>

 <div>
 <Label
 htmlFor="personalBirthDate"
 className="font-extrabold text-foreground"
 >
 Fecha de nacimiento
 </Label>
 <Input
 id="personalBirthDate"
 type="date"
 max={maxBirthDate}
 className="mt-2"
 aria-describedby={
 errors.birthDate ? "personal-birth-date-error" : undefined
 }
 aria-invalid={Boolean(errors.birthDate)}
 {...register("birthDate")}
 />
 <FieldError
 id="personal-birth-date-error"
 message={errors.birthDate?.message}
 />
 </div>

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
 <div>
 <Label
 htmlFor="personalGenderDescription"
 className="font-extrabold text-foreground"
 >
 Autodescripción
 </Label>
 <Input
 id="personalGenderDescription"
 type="text"
 maxLength={120}
 placeholder="Como deseas describirte"
 className="mt-2"
 aria-describedby={
 errors.genderDescription
 ? "personal-gender-description-error"
 : undefined
 }
 aria-invalid={Boolean(errors.genderDescription)}
 {...register("genderDescription")}
 />
 <FieldError
 id="personal-gender-description-error"
 message={errors.genderDescription?.message}
 />
 </div>
 ) : null}

 <div>
 <Label
 htmlFor="personalWeight"
 className="font-extrabold text-foreground"
 >
 Peso
 </Label>
 <div className="relative">
 <NumberInput
 id="personalWeight"
 inputMode="decimal"
 min="0.01"
 max="1000"
 step="0.01"
 placeholder="70"
 className="mt-2 pr-12"
 aria-describedby={
 errors.weightKg ? "personal-weight-error" : undefined
 }
 invalid={Boolean(errors.weightKg)}
 {...register("weightKg")}
 />
 <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
 kg
 </span>
 </div>
 <FieldError
 id="personal-weight-error"
 message={errors.weightKg?.message}
 />
 </div>

 <div>
 <Label
 htmlFor="personalHeight"
 className="font-extrabold text-foreground"
 >
 Altura
 </Label>
 <div className="relative">
 <NumberInput
 id="personalHeight"
 inputMode="decimal"
 min="0.01"
 max="300"
 step="0.01"
 placeholder="165"
 className="mt-2 pr-12"
 aria-describedby={
 errors.heightCm ? "personal-height-error" : undefined
 }
 invalid={Boolean(errors.heightCm)}
 {...register("heightCm")}
 />
 <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
 cm
 </span>
 </div>
 <FieldError
 id="personal-height-error"
 message={errors.heightCm?.message}
 />
 </div>

 <div>
 <Label
 htmlFor="personalBodyFat"
 className="font-extrabold text-foreground"
 >
 Porcentaje de grasa
 </Label>
 <div className="relative">
 <NumberInput
 id="personalBodyFat"
 inputMode="decimal"
 min="0.01"
 max="100"
 step="0.01"
 placeholder="18"
 className="mt-2 pr-12"
 aria-describedby={
 errors.bodyFatPercentage ? "personal-body-fat-error" : undefined
 }
 invalid={Boolean(errors.bodyFatPercentage)}
 {...register("bodyFatPercentage")}
 />
 <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
 %
 </span>
 </div>
 <FieldError
 id="personal-body-fat-error"
 message={errors.bodyFatPercentage?.message}
 />
 </div>
 </div>

 <div>
 <Label
 htmlFor="personalBodyMeasurements"
 className="font-extrabold text-foreground"
 >
 Medidas fisicas por zonas
 </Label>
 <Textarea
 id="personalBodyMeasurements"
 rows={4}
 maxLength={4000}
 placeholder="Ejemplo: cintura, cadera, pecho, brazo, pierna u otras zonas relevantes"
 className="mt-2"
 aria-describedby={
 errors.bodyMeasurements
 ? "personal-body-measurements-error"
 : "personal-body-measurements-help"
 }
 aria-invalid={Boolean(errors.bodyMeasurements)}
 {...register("bodyMeasurements")}
 />
 <p
 id="personal-body-measurements-help"
 className="mt-2 text-xs leading-5 text-muted"
 >
 Opcional. Usa el formato que tu profesional ya revise contigo.
 </p>
 <FieldError
 id="personal-body-measurements-error"
 message={errors.bodyMeasurements?.message}
 />
 </div>

 <div>
 <Label
 htmlFor="personalMedicalConditions"
 className="font-extrabold text-foreground"
 >
 Enfermedades o condiciones medicas
 </Label>
 <Textarea
 id="personalMedicalConditions"
 rows={5}
 maxLength={4000}
 placeholder="Información que deseas conservar en tu perfil"
 className="mt-2"
 aria-describedby={
 errors.medicalConditions
 ? "personal-medical-conditions-error"
 : "personal-medical-conditions-help"
 }
 aria-invalid={Boolean(errors.medicalConditions)}
 {...register("medicalConditions")}
 />
 <p
 id="personal-medical-conditions-help"
 className="mt-2 text-xs leading-5 text-muted"
 >
 Opcional y privado. No se utiliza para limitar tu acceso ni generar
 recomendaciones medicas.
 </p>
 <FieldError
 id="personal-medical-conditions-error"
 message={errors.medicalConditions?.message}
 />
 </div>

 <div className="grid gap-5 lg:grid-cols-2">
 <div>
 <Label htmlFor="personalInjuries" className="font-extrabold text-foreground">
 Lesiones
 </Label>
 <Textarea
 id="personalInjuries"
 rows={4}
 maxLength={4000}
 placeholder="Lesiones actuales o historial relevante"
 className="mt-2"
 aria-describedby={errors.injuries ? "personal-injuries-error" : undefined}
 aria-invalid={Boolean(errors.injuries)}
 {...register("injuries")}
 />
 <FieldError
 id="personal-injuries-error"
 message={errors.injuries?.message}
 />
 </div>

 <div>
 <Label htmlFor="personalAllergies" className="font-extrabold text-foreground">
 Alergias
 </Label>
 <Textarea
 id="personalAllergies"
 rows={4}
 maxLength={4000}
 placeholder="Alergias alimentarias, medicamentos u otras"
 className="mt-2"
 aria-describedby={errors.allergies ? "personal-allergies-error" : undefined}
 aria-invalid={Boolean(errors.allergies)}
 {...register("allergies")}
 />
 <FieldError
 id="personal-allergies-error"
 message={errors.allergies?.message}
 />
 </div>

 <div>
 <Label
 htmlFor="personalImportantMedications"
 className="font-extrabold text-foreground"
 >
 Medicamentos importantes
 </Label>
 <Textarea
 id="personalImportantMedications"
 rows={4}
 maxLength={4000}
 placeholder="Medicamentos o suplementos relevantes para tu seguimiento"
 className="mt-2"
 aria-describedby={
 errors.importantMedications
 ? "personal-important-medications-error"
 : undefined
 }
 aria-invalid={Boolean(errors.importantMedications)}
 {...register("importantMedications")}
 />
 <FieldError
 id="personal-important-medications-error"
 message={errors.importantMedications?.message}
 />
 </div>

 <div>
 <Label
 htmlFor="personalDietaryRestrictions"
 className="font-extrabold text-foreground"
 >
 Restricciones alimentarias
 </Label>
 <Textarea
 id="personalDietaryRestrictions"
 rows={4}
 maxLength={4000}
 placeholder="Preferencias, restricciones o alimentos a evitar"
 className="mt-2"
 aria-describedby={
 errors.dietaryRestrictions
 ? "personal-dietary-restrictions-error"
 : undefined
 }
 aria-invalid={Boolean(errors.dietaryRestrictions)}
 {...register("dietaryRestrictions")}
 />
 <FieldError
 id="personal-dietary-restrictions-error"
 message={errors.dietaryRestrictions?.message}
 />
 </div>
 </div>

 <div>
 <Label
 htmlFor="personalProfessionalNotes"
 className="font-extrabold text-foreground"
 >
 Notas importantes para el profesional
 </Label>
 <Textarea
 id="personalProfessionalNotes"
 rows={4}
 maxLength={4000}
 placeholder="Informacion que tu profesional asignado debe considerar"
 className="mt-2"
 aria-describedby={
 errors.professionalNotes
 ? "personal-professional-notes-error"
 : "personal-professional-notes-help"
 }
 aria-invalid={Boolean(errors.professionalNotes)}
 {...register("professionalNotes")}
 />
 <p
 id="personal-professional-notes-help"
 className="mt-2 text-xs leading-5 text-muted"
 >
 Tus datos de salud solo deben ser visibles para profesionales asignados
 y administradores autorizados.
 </p>
 <FieldError
 id="personal-professional-notes-error"
 message={errors.professionalNotes?.message}
 />
 </div>

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
