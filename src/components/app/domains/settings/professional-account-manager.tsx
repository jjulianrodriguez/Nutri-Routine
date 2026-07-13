"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
 CircleCheck,
 CircleOff,
 Dumbbell,
 Loader2,
 Save,
 Trash2,
 Leaf,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AppPanel } from "@/components/app/layouts/AppScreen";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import {
 deleteProfessionalAccount,
 setProfessionalActive,
 updateProfessionalAccount,
 type ProfessionalAccountListItem,
} from "@/lib/actions/professional-accounts";
import {
 updateProfessionalAccountSchema,
 type UpdateProfessionalAccountValues,
} from "@/lib/validations/professional-accounts";
import { cn } from "@/lib/utils";

const specialtyOptions = [
 { label: "Nutrición", value: "nutrition" },
 { label: "Entrenamiento", value: "training" },
 { label: "Ambas áreas", value: "both" },
] as const;

export function ProfessionalAccountManager({
 professional,
}: {
 professional: ProfessionalAccountListItem;
}) {
 const router = useRouter();
 const [confirmAction, setConfirmAction] = useState<
 "delete" | "status" | null
 >(null);
 const [serverMessage, setServerMessage] = useState("");
 const {
 clearErrors,
 formState: { errors, isSubmitting },
 handleSubmit,
 register,
 setError,
 } = useForm<UpdateProfessionalAccountValues>({
 defaultValues: {
 bio: professional.bio,
 fullName: professional.fullName,
 professionalId: professional.id,
 specialty: professional.specialty,
 },
 resolver: zodResolver(updateProfessionalAccountSchema),
 });

 async function onSubmit(values: UpdateProfessionalAccountValues) {
 clearErrors();
 setServerMessage("");

 const result = await updateProfessionalAccount(values);

 if (result.status === "error") {
 for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
 if (message) {
 setError(field as keyof UpdateProfessionalAccountValues, {
 message,
 });
 }
 }

 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.refresh();
 }

 async function handleStatusChange() {
 const result = await setProfessionalActive(
 professional.id,
 !professional.isActive,
 );

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.refresh();
 }

 async function handleDelete() {
 const result = await deleteProfessionalAccount(professional.id);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.push("/app/configuracion/profesionales");
 router.refresh();
 }

 return (
 <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
 <AppPanel
 title="Datos profesionales"
 description="El email se conserva como dato de acceso y no se modifica desde esta pantalla."
 >
 <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
 <Input type="hidden" {...register("professionalId")} />

 <div className="grid gap-5 sm:grid-cols-2">
 <FormField
 controlId="professional-full-name"
 error={errors.fullName?.message}
 errorId="professional-full-name-error"
 label="Nombre completo"
 >
 <Input
 autoComplete="name"
 aria-invalid={Boolean(errors.fullName)}
 {...register("fullName")}
 />
 </FormField>

 <FormField controlId="professional-email" label="Email">
 <Input
 value={professional.email || "Email no disponible"}
 className="text-muted"
 readOnly
 />
 </FormField>
 </div>

 <Select
 id="professional-specialty"
 label="Especialidad"
 error={errors.specialty?.message}
 helper="No se puede retirar un area mientras tenga clientes asignados en ese servicio."
 {...register("specialty")}
 >
 {specialtyOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </Select>

 <FormField
 controlId="professional-bio"
 error={errors.bio?.message}
 errorId="professional-bio-error"
 label="Descripción interna"
 >
 <Textarea
 rows={5}
 placeholder="Notas o descripción profesional opcional"
 aria-invalid={Boolean(errors.bio)}
 {...register("bio")}
 />
 </FormField>

 <FormAlert message={serverMessage} />

 <Button type="submit" size="lg" disabled={isSubmitting}>
 {isSubmitting ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <Save className="size-4" aria-hidden="true" />
 )}
 {isSubmitting ? "Guardando..." : "Guardar cambios"}
 </Button>
 </form>
 </AppPanel>

 <div className="space-y-6">
 <AppPanel
 title="Estado"
 description={
 professional.isActive
 ? "La cuenta puede usar sus funcionalidades profesionales."
 : "La cuenta solo conserva acceso a configuración básica."
 }
 tone={professional.isActive ? "primary" : "accent"}
 >
 <div
 className={cn(
 "flex items-center gap-3 rounded-[18px] p-4",
 professional.isActive
 ? "border-success/20 bg-success/5 text-success"
 : "border-danger/20 bg-danger/5 text-danger",
 )}
 >
 {professional.isActive ? (
 <CircleCheck className="size-5" aria-hidden="true" />
 ) : (
 <CircleOff className="size-5" aria-hidden="true" />
 )}
 <span className="font-extrabold">
 {professional.isActive ? "Profesional activo" : "Profesional inactivo"}
 </span>
 </div>

 <Button
 type="button"
 className="mt-4 w-full"
 variant={professional.isActive ? "destructive" : "default"}
 onClick={() => setConfirmAction("status")}
 >
 {professional.isActive ? (
 <CircleOff className="size-4" aria-hidden="true" />
 ) : (
 <CircleCheck className="size-4" aria-hidden="true" />
 )}
 {professional.isActive ? "Desactivar profesional" : "Activar profesional"}
 </Button>
 </AppPanel>

 <AppPanel
 title="Asignaciones"
 description="Las asignaciones se conservan cuando la cuenta se desactiva."
 >
 <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
 <div className="h-fit self-start rounded-[18px] bg-background p-4">
 <Leaf className="size-4 text-muted-foreground" aria-hidden="true" />
 <p className="mt-3 text-2xl font-semibold text-foreground">
 {professional.assignedNutritionClients}
 </p>
 <p className="mt-1 text-sm font-bold text-muted">
 Clientes de nutrición
 </p>
 </div>
 <div className="h-fit self-start rounded-[18px] bg-background p-4">
 <Dumbbell className="size-4 text-muted-foreground" aria-hidden="true" />
 <p className="mt-3 text-2xl font-semibold text-foreground">
 {professional.assignedTrainingClients}
 </p>
 <p className="mt-1 text-sm font-bold text-muted">
 Clientes de entrenamiento
 </p>
 </div>
 </div>
 </AppPanel>

 <AppPanel
 title="Eliminar cuenta"
 description="Solo es posible cuando no existen clientes ni registros profesionales vinculados."
 >
 <Button
 type="button"
 variant="destructive"
 className="w-full"
 onClick={() => setConfirmAction("delete")}
 >
 <Trash2 className="size-4" aria-hidden="true" />
 Eliminar profesional
 </Button>
 </AppPanel>
 </div>

 <ConfirmationDialog
 open={confirmAction === "status"}
 onOpenChange={(open) => setConfirmAction(open ? "status" : null)}
 title={
 professional.isActive
 ? "Desactivar profesional"
 : "Activar profesional"
 }
 description={
 professional.isActive
 ? "La cuenta dejara de usar funcionalidades profesionales. Sus clientes y registros se conservaran."
 : "La cuenta recuperara los permisos correspondientes a su especialidad actual."
 }
 confirmLabel={professional.isActive ? "Desactivar" : "Activar"}
 pendingLabel={
 professional.isActive ? "Desactivando..." : "Activando..."
 }
 tone={professional.isActive ? "destructive" : "default"}
 onConfirm={handleStatusChange}
 />

 <ConfirmationDialog
 open={confirmAction === "delete"}
 onOpenChange={(open) => setConfirmAction(open ? "delete" : null)}
 title="Eliminar cuenta profesional"
 description="Esta acción elimina la cuenta de acceso. Se bloqueará automáticamente si existen clientes, planes, citas, recursos u otros registros vinculados."
 confirmLabel="Eliminar profesional"
 pendingLabel="Eliminando..."
 tone="destructive"
 onConfirm={handleDelete}
 />
 </div>
 );
}
