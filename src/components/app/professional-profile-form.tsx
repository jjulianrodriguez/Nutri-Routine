"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOwnProfessionalProfile } from "@/lib/actions/professional-profile";
import {
  professionalProfileSchema,
  type ProfessionalProfileValues,
} from "@/lib/validations/professional-profile";

const inputClasses =
  "mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20";
const textareaClasses =
  "mt-2 min-h-28 w-full resize-y rounded-control border border-border bg-surface px-4 py-3 text-sm leading-6 text-charcoal shadow-soft outline-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 aria-invalid:border-danger";

const focusAreaOptions = [
  { label: "Perdida de grasa", value: "fat_loss" },
  { label: "Hipertrofia", value: "hypertrophy" },
  { label: "Salud digestiva", value: "digestive_health" },
  { label: "Recomposicion corporal", value: "body_recomposition" },
  { label: "Rendimiento", value: "performance" },
  { label: "Otras", value: "other" },
] as const;

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
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
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
    toast.success(result.message);
    router.refresh();
  }

  return (
    <form className="space-y-7" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <Label htmlFor="professionalPhone" className="font-extrabold text-charcoal">
            Telefono profesional
          </Label>
          <Input
            id="professionalPhone"
            type="tel"
            autoComplete="tel"
            placeholder="+506 8888-8888"
            className={inputClasses}
            aria-describedby={
              errors.professionalPhone ? "professional-phone-error" : undefined
            }
            aria-invalid={Boolean(errors.professionalPhone)}
            {...register("professionalPhone")}
          />
          <FieldError
            id="professional-phone-error"
            message={errors.professionalPhone?.message}
          />
        </div>

        <div>
          <Label htmlFor="professionalLinks" className="font-extrabold text-charcoal">
            Redes o enlaces profesionales
          </Label>
          <Input
            id="professionalLinks"
            type="text"
            placeholder="LinkedIn, Instagram, sitio web u otros enlaces"
            className={inputClasses}
            aria-describedby={
              errors.professionalLinks ? "professional-links-error" : undefined
            }
            aria-invalid={Boolean(errors.professionalLinks)}
            {...register("professionalLinks")}
          />
          <FieldError
            id="professional-links-error"
            message={errors.professionalLinks?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="professionalBio" className="font-extrabold text-charcoal">
          Biografia corta
        </Label>
        <textarea
          id="professionalBio"
          rows={4}
          maxLength={800}
          placeholder="Presentacion breve para clientes asignados."
          className={textareaClasses}
          aria-describedby={errors.bio ? "professional-bio-error" : undefined}
          aria-invalid={Boolean(errors.bio)}
          {...register("bio")}
        />
        <FieldError id="professional-bio-error" message={errors.bio?.message} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <Label
            htmlFor="professionalExperience"
            className="font-extrabold text-charcoal"
          >
            Experiencia
          </Label>
          <textarea
            id="professionalExperience"
            rows={5}
            maxLength={4000}
            placeholder="Trayectoria, tipos de clientes o enfoque de trabajo."
            className={textareaClasses}
            aria-describedby={
              errors.experience ? "professional-experience-error" : undefined
            }
            aria-invalid={Boolean(errors.experience)}
            {...register("experience")}
          />
          <FieldError
            id="professional-experience-error"
            message={errors.experience?.message}
          />
        </div>

        <div>
          <Label
            htmlFor="professionalCertifications"
            className="font-extrabold text-charcoal"
          >
            Certificaciones
          </Label>
          <textarea
            id="professionalCertifications"
            rows={5}
            maxLength={4000}
            placeholder="Certificaciones, estudios o formacion relevante."
            className={textareaClasses}
            aria-describedby={
              errors.certifications
                ? "professional-certifications-error"
                : undefined
            }
            aria-invalid={Boolean(errors.certifications)}
            {...register("certifications")}
          />
          <FieldError
            id="professional-certifications-error"
            message={errors.certifications?.message}
          />
        </div>
      </div>

      <fieldset>
        <legend className="font-extrabold text-charcoal">Areas de enfoque</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {focusAreaOptions.map((option) => (
            <label
              key={option.value}
              className="flex min-h-11 items-center gap-3 rounded-[16px] border border-border bg-background px-3 py-2 text-sm font-bold text-warm-brown shadow-soft"
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
        <FieldError
          id="professional-focus-areas-error"
          message={errors.focusAreas?.message}
        />
      </fieldset>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <Label
            htmlFor="availabilityDays"
            className="font-extrabold text-charcoal"
          >
            Dias disponibles
          </Label>
          <Input
            id="availabilityDays"
            type="text"
            placeholder="Lunes a viernes, sabados alternos..."
            className={inputClasses}
            aria-describedby={
              errors.availabilityDays ? "availability-days-error" : undefined
            }
            aria-invalid={Boolean(errors.availabilityDays)}
            {...register("availabilityDays")}
          />
          <FieldError
            id="availability-days-error"
            message={errors.availabilityDays?.message}
          />
        </div>

        <div>
          <Label
            htmlFor="availabilityNote"
            className="font-extrabold text-charcoal"
          >
            Nota o mensaje automatico
          </Label>
          <Input
            id="availabilityNote"
            type="text"
            placeholder="Tiempo estimado de respuesta o nota breve."
            className={inputClasses}
            aria-describedby={
              errors.availabilityNote ? "availability-note-error" : undefined
            }
            aria-invalid={Boolean(errors.availabilityNote)}
            {...register("availabilityNote")}
          />
          <FieldError
            id="availability-note-error"
            message={errors.availabilityNote?.message}
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="availabilitySchedule"
          className="font-extrabold text-charcoal"
        >
          Horarios de atencion
        </Label>
        <textarea
          id="availabilitySchedule"
          rows={4}
          maxLength={4000}
          placeholder="Bloques horarios, modalidad o reglas de agenda."
          className={textareaClasses}
          aria-describedby={
            errors.availabilitySchedule
              ? "availability-schedule-error"
              : undefined
          }
          aria-invalid={Boolean(errors.availabilitySchedule)}
          {...register("availabilitySchedule")}
        />
        <FieldError
          id="availability-schedule-error"
          message={errors.availabilitySchedule?.message}
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

      <Button type="submit" disabled={isSubmitting} size="lg">
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
    </form>
  );
}
