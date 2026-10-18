"use client";

import { Check, Dumbbell, Leaf, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import { FormAlert } from "@/components/ui/forms/form-field";
import { Select } from "@/components/ui/forms/select";
import {
 getAssignedRelationBadge,
 RelationshipBadge,
} from "@/components/app/shared/relationship-badges";
import { activateClientAccount } from "@/lib/actions/client-activation";
import type {
 AssignableProfessional,
 ClientAccountListItem,
} from "@/lib/actions/client-activation";
import type { ClientActivationService } from "@/lib/validations/client-activation";
import { cn } from "@/lib/utils";

type ClientActivationFormProps = {
 canManageNutrition: boolean;
 canManageTraining: boolean;
 client: ClientAccountListItem;
 currentUserId: string;
 currentUserName: string;
 isAdmin: boolean;
 nutritionists: AssignableProfessional[];
 trainers: AssignableProfessional[];
};

type ProfessionalPlanAction = {
 enable: boolean;
 service: "nutrition" | "training";
};

function getServiceType(
 nutritionEnabled: boolean,
 trainingEnabled: boolean,
): ClientActivationService {
 if (nutritionEnabled && trainingEnabled) {
 return "both";
 }

 if (nutritionEnabled) {
 return "nutrition";
 }

 if (trainingEnabled) {
 return "training";
 }

 return "none";
}

function getPreferredProfessionalId({
 currentUserId,
 existingId,
 professionals,
}: {
 currentUserId: string;
 existingId: string | null;
 professionals: AssignableProfessional[];
}) {
 if (existingId && professionals.some((item) => item.id === existingId)) {
 return existingId;
 }

 if (professionals.some((item) => item.id === currentUserId)) {
 return currentUserId;
 }

 return professionals[0]?.id ?? "";
}

function PlanToggle({
 active,
 disabled,
 icon: Icon,
 label,
 onToggle,
}: {
 active: boolean;
 disabled: boolean;
 icon: typeof Leaf;
 label: string;
 onToggle: () => void;
}) {
 return (
 <button
 type="button"
 aria-pressed={active}
 disabled={disabled}
 onClick={onToggle}
 className={cn(
 "flex min-h-14 w-full items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-55",
 active
 ? "border-primary/40 bg-primary-soft text-foreground"
 : " bg-surface text-muted-foreground hover:border-primary/30 hover:bg-primary-tint/60",
 )}
 >
 <span className="flex items-center gap-3">
 <Icon className="size-5" aria-hidden="true" />
 <span className="font-extrabold">{label}</span>
 </span>
 <span
 className={cn(
 "grid size-7 shrink-0 place-items-center rounded-full",
 active
 ? "bg-primary text-primary-foreground"
 : " bg-background text-muted",
 )}
 aria-hidden="true"
 >
 {active ? <Check className="size-4" /> : <X className="size-3.5" />}
 </span>
 </button>
 );
}

function ProfessionalAreaAction({
 active,
 assignedId,
 assignedName,
 assignedToCurrentUser,
 currentUserId,
 currentUserName,
 disabled,
 icon: Icon,
 isPending,
 label,
 onAssign,
 onRemove,
 professionalLabel,
}: {
 active: boolean;
 assignedId: string | null;
 assignedName: string | null;
 assignedToCurrentUser: boolean;
 currentUserId: string;
 currentUserName: string;
 disabled: boolean;
 icon: typeof Leaf;
 isPending: boolean;
 label: string;
 onAssign: () => void;
 onRemove: () => void;
 professionalLabel: string;
}) {
 const blockedByOtherProfessional = active && !assignedToCurrentUser;
 const assignedDisplayName = active
 ? assignedName ?? (assignedToCurrentUser ? currentUserName : null)
 : null;
 const relationBadge = getAssignedRelationBadge({
 assignedId: active ? assignedId : null,
 currentUserId,
 isProfessional: true,
 });

 return (
 <div
 className={cn(
 "rounded-[18px] p-4",
 active
 ? assignedToCurrentUser
 ? "border-primary/35 bg-primary-tint/60"
 : "border-secondary/25 bg-secondary-tint/50"
 : " bg-surface",
 )}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex min-w-0 items-start gap-3">
 <span className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-muted-foreground">
 <Icon className="size-5" aria-hidden="true" />
 </span>
 <div className="min-w-0">
 <p className="font-extrabold text-foreground">
 {active
 ? assignedDisplayName ?? "Perfil incompleto"
 : `Sin plan de ${label.toLowerCase()}`}
 </p>
 <div className="mt-2 flex flex-wrap gap-2">
 <RelationshipBadge tone={active ? "primary" : "muted"}>
 {active ? label : `Sin ${label.toLowerCase()}`}
 </RelationshipBadge>
 <RelationshipBadge tone={relationBadge.tone}>
 {relationBadge.label}
 </RelationshipBadge>
 {active ? (
 <RelationshipBadge tone="neutral">
 {professionalLabel}
 </RelationshipBadge>
 ) : null}
 </div>
 {!active ? (
 <p className="mt-2 text-sm leading-5 text-muted">
 Puedes activar {label.toLowerCase()} asignandote como
 responsable.
 </p>
 ) : null}
 </div>
 </div>
 </div>

 {blockedByOtherProfessional ? (
 <p className="mt-4 rounded-[14px] bg-background px-3 py-2 text-xs font-bold leading-5 text-muted-foreground">
 Este plan ya pertenece a{" "}
 {assignedDisplayName ?? "otro profesional"}. No puedes cambiarlo
 desde tu cuenta.
 </p>
 ) : (
 <Button
 type="button"
 className="mt-4 w-full sm:w-auto"
 disabled={disabled || isPending}
 onClick={active ? onRemove : onAssign}
 size="sm"
 variant={active ? "destructive" : "default"}
 >
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : active ? (
 <X className="size-4" aria-hidden="true" />
 ) : (
 <Check className="size-4" aria-hidden="true" />
 )}
 {active
 ? `Quitar ${label.toLowerCase()}`
 : `Asignar mi ${label.toLowerCase()}`}
 </Button>
 )}
 </div>
 );
}

export function ClientActivationForm({
 canManageNutrition,
 canManageTraining,
 client,
 currentUserId,
 currentUserName,
 isAdmin,
 nutritionists,
 trainers,
}: ClientActivationFormProps) {
 const router = useRouter();
 const [confirmAction, setConfirmAction] =
 useState<ProfessionalPlanAction | null>(null);
 const [isConfirming, setIsConfirming] = useState(false);
 const [pendingAction, setPendingAction] =
 useState<ProfessionalPlanAction | null>(null);
 const [isPending, setIsPending] = useState(false);
 const [serverMessage, setServerMessage] = useState("");
 const [nutritionEnabled, setNutritionEnabled] = useState(
 client.hasNutritionService,
 );
 const [trainingEnabled, setTrainingEnabled] = useState(
 client.hasTrainingService,
 );
 const [assignedNutritionistId, setAssignedNutritionistId] = useState(() =>
 getPreferredProfessionalId({
 currentUserId,
 existingId: client.assignedNutritionistId,
 professionals: nutritionists,
 }),
 );
 const [assignedTrainerId, setAssignedTrainerId] = useState(() =>
 getPreferredProfessionalId({
 currentUserId,
 existingId: client.assignedTrainerId,
 professionals: trainers,
 }),
 );
 const serviceType = getServiceType(nutritionEnabled, trainingEnabled);
 const hasRequiredProfessionals =
 (!canManageNutrition ||
 !nutritionEnabled ||
 Boolean(assignedNutritionistId)) &&
 (!canManageTraining || !trainingEnabled || Boolean(assignedTrainerId));
 const removesNutrition =
 client.hasNutritionService && !nutritionEnabled;
 const removesTraining = client.hasTrainingService && !trainingEnabled;
 const hasPlanSelection = serviceType !== "none" || client.isClientActivated;

 async function saveProfessionalAction(action: ProfessionalPlanAction) {
 const nextNutritionEnabled =
 action.service === "nutrition"
 ? action.enable
 : client.hasNutritionService;
 const nextTrainingEnabled =
 action.service === "training" ? action.enable : client.hasTrainingService;

 setServerMessage("");
 setPendingAction(action);
 setIsPending(true);

 try {
 const result = await activateClientAccount({
 assignedNutritionistId:
 action.service === "nutrition" && action.enable ? currentUserId : "",
 assignedTrainerId:
 action.service === "training" && action.enable ? currentUserId : "",
 clientId: client.id,
 serviceType: getServiceType(nextNutritionEnabled, nextTrainingEnabled),
 });

 if (result.status === "error") {
 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.refresh();
 } catch {
 toast.error(
 "Ocurrió un error inesperado al guardar los planes. Inténtalo de nuevo.",
 );
 } finally {
 setPendingAction(null);
 setIsPending(false);
 }
 }

 function requestProfessionalAction(action: ProfessionalPlanAction) {
 if (!action.enable) {
 setConfirmAction(action);
 return;
 }

 void saveProfessionalAction(action);
 }

 async function savePlans() {
 setServerMessage("");
 setIsPending(true);

 try {
 const result = await activateClientAccount({
 assignedNutritionistId: nutritionEnabled ? assignedNutritionistId : "",
 assignedTrainerId: trainingEnabled ? assignedTrainerId : "",
 clientId: client.id,
 serviceType,
 });

 if (result.status === "error") {
 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.refresh();
 } catch {
 toast.error(
 "Ocurrió un error inesperado al guardar los planes. Inténtalo de nuevo.",
 );
 } finally {
 setIsPending(false);
 }
 }

 function submit() {
 if (client.isClientActivated) {
 setIsConfirming(true);
 return;
 }

 void savePlans();
 }

 if (!canManageNutrition && !canManageTraining) {
 return (
 <Alert className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3">
 <AlertDescription className="font-semibold text-danger">
 Tu cuenta no tiene permisos para modificar planes.
 </AlertDescription>
 </Alert>
 );
 }

 if (!isAdmin) {
 const canShowNutritionAction = canManageNutrition;
 const canShowTrainingAction = canManageTraining;
 const nutritionAssignedToCurrentUser =
 client.assignedNutritionistId === currentUserId;
 const trainingAssignedToCurrentUser =
 client.assignedTrainerId === currentUserId;
 const confirmLabel =
 confirmAction?.service === "nutrition"
 ? "Quitar nutrición"
 : "Quitar entrenamiento";

 return (
 <div className="space-y-4 rounded-[22px] bg-background p-4">
 <div className="grid gap-3 lg:grid-cols-2">
 {canShowNutritionAction ? (
 <ProfessionalAreaAction
 active={client.hasNutritionService}
 assignedId={client.assignedNutritionistId}
 assignedName={client.assignedNutritionistName}
 assignedToCurrentUser={nutritionAssignedToCurrentUser}
 currentUserId={currentUserId}
 currentUserName={currentUserName}
 disabled={isPending}
 icon={Leaf}
 isPending={isPending && pendingAction?.service === "nutrition"}
 label="Nutrición"
 onAssign={() =>
 requestProfessionalAction({
 enable: true,
 service: "nutrition",
 })
 }
 onRemove={() =>
 requestProfessionalAction({
 enable: false,
 service: "nutrition",
 })
 }
 professionalLabel="Nutricionista"
 />
 ) : null}

 {canShowTrainingAction ? (
 <ProfessionalAreaAction
 active={client.hasTrainingService}
 assignedId={client.assignedTrainerId}
 assignedName={client.assignedTrainerName}
 assignedToCurrentUser={trainingAssignedToCurrentUser}
 currentUserId={currentUserId}
 currentUserName={currentUserName}
 disabled={isPending}
 icon={Dumbbell}
 isPending={isPending && pendingAction?.service === "training"}
 label="Entrenamiento"
 onAssign={() =>
 requestProfessionalAction({
 enable: true,
 service: "training",
 })
 }
 onRemove={() =>
 requestProfessionalAction({
 enable: false,
 service: "training",
 })
 }
 professionalLabel="Entrenador"
 />
 ) : null}
 </div>

 <FormAlert message={serverMessage} />

 <ConfirmationDialog
 open={Boolean(confirmAction)}
 onOpenChange={(open) => {
 if (!open) {
 setConfirmAction(null);
 }
 }}
 title={confirmLabel}
 description="Este cambio retirará el acceso del cliente a esa sección. Solo se modificará tu área."
 confirmLabel={confirmLabel}
 pendingLabel="Guardando..."
 tone="destructive"
 onConfirm={() =>
 confirmAction ? saveProfessionalAction(confirmAction) : undefined
 }
 />
 </div>
 );
 }

 return (
 <div className="space-y-4 rounded-[22px] bg-background p-4">
 <div className="grid gap-3 sm:grid-cols-2">
 <div className="space-y-2">
 <PlanToggle
 active={nutritionEnabled}
 disabled={
 !canManageNutrition ||
 (!nutritionEnabled && nutritionists.length === 0)
 }
 icon={Leaf}
 label="Plan de nutrición"
 onToggle={() => setNutritionEnabled((current) => !current)}
 />
 {nutritionists.length === 0 ? (
 <p className="px-1 text-xs font-semibold leading-5 text-muted">
 No hay profesionales de nutrición disponibles para nuevas
 activaciones.
 </p>
 ) : null}
 </div>
 <div className="space-y-2">
 <PlanToggle
 active={trainingEnabled}
 disabled={
 !canManageTraining ||
 (!trainingEnabled && trainers.length === 0)
 }
 icon={Dumbbell}
 label="Plan de entrenamiento"
 onToggle={() => setTrainingEnabled((current) => !current)}
 />
 {trainers.length === 0 ? (
 <p className="px-1 text-xs font-semibold leading-5 text-muted">
 No hay profesionales de entrenamiento disponibles para nuevas
 activaciones.
 </p>
 ) : null}
 </div>
 </div>

 {nutritionEnabled || trainingEnabled ? (
 <div className="grid gap-4 lg:grid-cols-2">
 {nutritionEnabled ? (
 <Select
 id={`nutritionist-${client.id}`}
 label="Nutricionista"
 labelClassName="font-extrabold"
 disabled={!canManageNutrition}
 value={assignedNutritionistId}
 onChange={(event) =>
 setAssignedNutritionistId(event.target.value)
 }
 >
 {nutritionists.map((professional) => (
 <option key={professional.id} value={professional.id}>
 {professional.fullName}
 </option>
 ))}
 </Select>
 ) : null}

 {trainingEnabled ? (
 <Select
 id={`trainer-${client.id}`}
 label="Entrenadora"
 labelClassName="font-extrabold"
 disabled={!canManageTraining}
 value={assignedTrainerId}
 onChange={(event) => setAssignedTrainerId(event.target.value)}
 >
 {trainers.map((professional) => (
 <option key={professional.id} value={professional.id}>
 {professional.fullName}
 </option>
 ))}
 </Select>
 ) : null}
 </div>
 ) : (
 <Alert className="rounded-[18px] border-primary/25 bg-primary-tint px-4 py-3">
 <AlertDescription className="font-semibold text-foreground">
 Sin planes activos, el usuario solo podrá entrar a configuración.
 </AlertDescription>
 </Alert>
 )}

 <FormAlert message={serverMessage} />

 <Button
 type="button"
 onClick={submit}
 disabled={isPending || !hasRequiredProfessionals || !hasPlanSelection}
 className={cn(
 "w-full sm:w-auto",
 (!hasRequiredProfessionals || !hasPlanSelection) && "opacity-60",
 )}
 size="lg"
 variant={
 serviceType === "none" && client.isClientActivated
 ? "destructive"
 : "default"
 }
 >
 {isPending ? (
 <>
 <Loader2 className="size-4 animate-spin" />
 Guardando...
 </>
 ) : (
 <>
 <Save className="size-4" />
 {serviceType === "none"
 ? client.isClientActivated
 ? "Desactivar todos los planes"
 : "Sin planes activos"
 : client.isClientActivated
 ? "Guardar cambios"
 : "Activar planes"}
 </>
 )}
 </Button>

 <ConfirmationDialog
 open={isConfirming}
 onOpenChange={setIsConfirming}
 title={
 removesNutrition || removesTraining
 ? "Confirmar cambio de planes"
 : "Guardar cambios de planes"
 }
 description={
 removesNutrition || removesTraining
 ? "Este cambio retirará el acceso del cliente a las secciones desactivadas."
 : "Se actualizarán los planes y profesionales asignados a este cliente."
 }
 confirmLabel={
 serviceType === "none" ? "Desactivar planes" : "Guardar cambios"
 }
 pendingLabel="Guardando…"
 tone={
 removesNutrition || removesTraining ? "destructive" : "default"
 }
 onConfirm={savePlans}
 />
 </div>
 );
}
