"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/actions/button";
import { FieldGroup, FormAlert, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Textarea } from "@/components/ui/forms/textarea";
import { updateOwnProfessionalProfile } from "@/lib/actions/professional-profile";
import {
 professionalProfileSchema,
 type ProfessionalProfileValues,
} from "@/lib/validations/professional-profile";

const focusAreaOptions = [
 { label: "Perdida de grasa", value: "fat_loss" },
 { label: "Hipertrofia", value: "hypertrophy" },
 { label: "Salud digestiva", value: "digestive_health" },
 { label: "Recomposicion corporal", value: "body_recomposition" },
 { label: "Rendimiento", value: "performance" },
 { label: "Otras", value: "other" },
] as const;

export function ProfessionalProfileForm({
 initialValues,
}: {
 initialValues: ProfessionalProfileValues;
}) {
 const router = useRouter();
 const [serverMessage, setServerMessage] = useState("");
 const [successMessage, setSuccessMessage] = useState("");
 const {
 clearErrors,
 formState: { errors, isDirty, isSubmitting },
 handleSubmit,
 register,
 reset,
 setError,
 } = useForm<ProfessionalProfileValues>({
 defaultValues: initialValues,
 resolver: zodResolver(professionalProfileSchema),
 });

 async function onSubmit(values: ProfessionalProfileValues) {
 clearErrors("root");
 setServerMessage("");
 setSuccessMessage("");

 const result = await updateOwnProfessionalProfile(values);

 if (result.status === "error") {
 Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
 if (message) {
 setError(field as keyof ProfessionalProfileValues, { message });
 }
 });

 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 setSuccessMessage(result.message);
 reset(values);
 toast.success(result.message);
 router.refresh();
 }

 return (
 <form className="space-y-7" onSubmit={handleSubmit(onSubmit)} noValidate>
 <div className="rounded-[20px] border-primary/25 bg-primary-soft/60 p-4 text-sm leading-6 text-muted">
 <p className="font-extrabold text-foreground">Visibilidad del perfil</p>
 <p className="mt-1">
 Esta informacion ayuda a tus clientes asignados y al equipo admin a
 entender tu area, experiencia y disponibilidad. El nombre y el correo
 de acceso se muestran fuera de este formulario como resumen.
 </p>
 </div>

 <section className="space-y-5">
 <div>
 <h3 className="font-extrabold text-foreground">Datos profesionales</h3>
 <p className="mt-1 text-sm leading-6 text-muted">
 Contacto profesional, enlaces y presentacion breve.
 </p>
 </div>

 <div className="grid gap-5 lg:grid-cols-2">
 <FormField
 controlId="professionalPhone"
 error={errors.professionalPhone?.message}
 errorId="professional-phone-error"
 label="Telefono profesional"
 >
 <Input
 type="tel"
 autoComplete="tel"
 placeholder="+506 8888-8888"
 aria-invalid={Boolean(errors.professionalPhone)}
 {...register("professionalPhone")}
 />
 </FormField>

 <FormField
 controlId="professionalLinks"
 error={errors.professionalLinks?.message}
 errorId="professional-links-error"
 label="Redes o enlaces profesionales"
 >
 <Input
 type="text"
 placeholder="LinkedIn, Instagram, sitio web u otros enlaces"
 aria-invalid={Boolean(errors.professionalLinks)}
 {...register("professionalLinks")}
 />
 </FormField>
 </div>

 <FormField
 controlId="professionalBio"
 error={errors.bio?.message}
 errorId="professional-bio-error"
 label="Biografia corta"
 >
 <Textarea
 rows={4}
 maxLength={800}
 placeholder="Presentacion breve para clientes asignados."
 aria-invalid={Boolean(errors.bio)}
 {...register("bio")}
 />
 </FormField>
 </section>

 <section className="space-y-5">
 <div>
 <h3 className="font-extrabold text-foreground">
 Experiencia y enfoque
 </h3>
 <p className="mt-1 text-sm leading-6 text-muted">
 Trayectoria, certificaciones y temas que trabajas con clientes.
 </p>
 </div>

 <div className="grid gap-5 lg:grid-cols-2">
 <FormField
 controlId="professionalExperience"
 error={errors.experience?.message}
 errorId="professional-experience-error"
 label="Experiencia"
 >
 <Textarea
 rows={5}
 maxLength={4000}
 placeholder="Trayectoria, tipos de clientes o enfoque de trabajo."
 aria-invalid={Boolean(errors.experience)}
 {...register("experience")}
 />
 </FormField>

 <FormField
 controlId="professionalCertifications"
 error={errors.certifications?.message}
 errorId="professional-certifications-error"
 label="Certificaciones"
 >
 <Textarea
 rows={5}
 maxLength={4000}
 placeholder="Certificaciones, estudios o formacion relevante."
 aria-invalid={Boolean(errors.certifications)}
 {...register("certifications")}
 />
 </FormField>
 </div>

 <FieldGroup
 error={errors.focusAreas?.message}
 errorId="professional-focus-areas-error"
 legend="Areas de enfoque"
 >
 <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
 {focusAreaOptions.map((option) => (
 <label
 key={option.value}
 className="flex min-h-11 items-center gap-3 rounded-[16px] bg-background px-3 py-2 text-sm font-bold text-muted-foreground "
 >
 <input
 type="checkbox"
 value={option.value}
 className="size-4 accent-[rgb(var(--primary-rgb))]"
 {...register("focusAreas")}
 />
 <span>{option.label}</span>
 </label>
 ))}
 </div>
 </FieldGroup>
 </section>

 <section
 id="disponibilidad"
 className="scroll-mt-24 space-y-5 rounded-[22px] bg-background p-4"
 >
 <div>
 <h3 className="font-extrabold text-foreground">
 Disponibilidad editable
 </h3>
 <p className="mt-1 text-sm leading-6 text-muted">
 Estos campos son la fuente real para tus dias, horarios y mensaje de
 respuesta.
 </p>
 </div>

 <div className="grid gap-5 lg:grid-cols-2">
 <FormField
 controlId="availabilityDays"
 error={errors.availabilityDays?.message}
 errorId="availability-days-error"
 label="Dias disponibles"
 >
 <Input
 type="text"
 placeholder="Lunes a viernes, sabados alternos..."
 aria-invalid={Boolean(errors.availabilityDays)}
 {...register("availabilityDays")}
 />
 </FormField>

 <FormField
 controlId="availabilityNote"
 error={errors.availabilityNote?.message}
 errorId="availability-note-error"
 label="Nota o mensaje automatico"
 >
 <Input
 type="text"
 placeholder="Tiempo estimado de respuesta o nota breve."
 aria-invalid={Boolean(errors.availabilityNote)}
 {...register("availabilityNote")}
 />
 </FormField>
 </div>

 <FormField
 controlId="availabilitySchedule"
 error={errors.availabilitySchedule?.message}
 errorId="availability-schedule-error"
 label="Horarios de atencion"
 >
 <Textarea
 rows={4}
 maxLength={4000}
 placeholder="Bloques horarios, modalidad o reglas de agenda."
 aria-invalid={Boolean(errors.availabilitySchedule)}
 {...register("availabilitySchedule")}
 />
 </FormField>
 </section>

 <FormAlert message={serverMessage || errors.root?.message} />

 <FormAlert tone="success" message={successMessage} />

 <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-[24px] bg-surface/90 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
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
 {isDirty ? "Perfil profesional con cambios" : "Perfil profesional al dia"}
 </p>
 <p className="text-muted" aria-live="polite">
 {isDirty
 ? "Guarda para actualizar tu informacion visible."
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
 Guardar perfil profesional
 </>
 )}
 </Button>
 </div>
 </form>
 );
}
