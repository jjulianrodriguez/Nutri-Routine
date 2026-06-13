"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deletePersonalDetails,
  updatePersonalDetails,
} from "@/lib/actions/account";
import {
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "@/lib/validations/personal-details";

const fieldClasses =
  "mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20";

const emptyValues: PersonalDetailsValues = {
  birthDate: "",
  gender: "",
  genderDescription: "",
  heightCm: "",
  medicalConditions: "",
  phone: "",
  weightKg: "",
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

export function PersonalDetailsForm({
  hasSavedDetails,
  initialValues,
  maxBirthDate,
}: {
  hasSavedDetails: boolean;
  initialValues: PersonalDetailsValues;
  maxBirthDate: string;
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
    formState: { errors, isSubmitting },
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

    const containsData =
      values.phone.trim() !== "" ||
      values.birthDate.trim() !== "" ||
      values.gender !== "" ||
      values.weightKg.trim() !== "" ||
      values.heightCm.trim() !== "" ||
      values.medicalConditions.trim() !== "";
    setHasDetails(containsData);
    setSuccessMessage(result.message);
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
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="personalPhone" className="font-extrabold text-charcoal">
            Telefono
          </Label>
          <Input
            id="personalPhone"
            type="tel"
            autoComplete="tel"
            placeholder="+506 8888-8888"
            className={fieldClasses}
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
            className="font-extrabold text-charcoal"
          >
            Fecha de nacimiento
          </Label>
          <Input
            id="personalBirthDate"
            type="date"
            max={maxBirthDate}
            className={fieldClasses}
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

        <div>
          <Label
            htmlFor="personalGender"
            className="font-extrabold text-charcoal"
          >
            Genero
          </Label>
          <select
            id="personalGender"
            className={`${fieldClasses} w-full appearance-none text-sm font-semibold`}
            aria-invalid={Boolean(errors.gender)}
            {...register("gender")}
          >
            <option value="">Sin especificar</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="non_binary">No binario</option>
            <option value="prefer_not_to_say">Prefiero no decir</option>
            <option value="self_described">Otro / Autodescripcion</option>
          </select>
          <FieldError
            id="personal-gender-error"
            message={errors.gender?.message}
          />
        </div>

        {selectedGender === "self_described" ? (
          <div>
            <Label
              htmlFor="personalGenderDescription"
              className="font-extrabold text-charcoal"
            >
              Autodescripcion
            </Label>
            <Input
              id="personalGenderDescription"
              type="text"
              maxLength={120}
              placeholder="Como deseas describirte"
              className={fieldClasses}
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
            className="font-extrabold text-charcoal"
          >
            Peso
          </Label>
          <div className="relative">
            <Input
              id="personalWeight"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="1000"
              step="0.01"
              placeholder="70"
              className={`${fieldClasses} pr-12`}
              aria-describedby={
                errors.weightKg ? "personal-weight-error" : undefined
              }
              aria-invalid={Boolean(errors.weightKg)}
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
            className="font-extrabold text-charcoal"
          >
            Altura
          </Label>
          <div className="relative">
            <Input
              id="personalHeight"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="300"
              step="0.01"
              placeholder="165"
              className={`${fieldClasses} pr-12`}
              aria-describedby={
                errors.heightCm ? "personal-height-error" : undefined
              }
              aria-invalid={Boolean(errors.heightCm)}
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
      </div>

      <div>
        <Label
          htmlFor="personalMedicalConditions"
          className="font-extrabold text-charcoal"
        >
          Enfermedades o condiciones medicas
        </Label>
        <textarea
          id="personalMedicalConditions"
          rows={5}
          maxLength={4000}
          placeholder="Informacion que deseas conservar en tu perfil"
          className="mt-2 min-h-32 w-full resize-y rounded-control border border-border bg-surface px-4 py-3 text-sm leading-6 text-charcoal shadow-soft outline-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 aria-invalid:border-danger"
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Guardando..." : "Guardar informacion"}
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
