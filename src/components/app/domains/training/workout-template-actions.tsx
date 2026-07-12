"use client";

import { Eye, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import {
 deleteWorkoutTemplate,
 setWorkoutTemplateActive,
} from "@/lib/actions/workout-templates";

export function WorkoutTemplateActions({
 compact = false,
 isActive,
 templateId,
 templateName,
}: {
 compact?: boolean;
 isActive: boolean;
 templateId: string;
 templateName: string;
}) {
 const router = useRouter();
 const [confirmation, setConfirmation] = useState<
 "delete" | "status" | null
 >(null);

 async function handleConfirm() {
 const result =
 confirmation === "delete"
 ? await deleteWorkoutTemplate(templateId)
 : await setWorkoutTemplateActive(templateId, !isActive);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);

 if (confirmation === "delete") {
 router.push("/app/entrenamiento/plantillas");
 }

 router.refresh();
 }

 return (
 <>
 {compact ? (
 <CardActionsMenu
 label={templateName}
 items={[
 {
 href: `/app/entrenamiento/plantillas/${templateId}`,
 icon: Eye,
 label: "Ver detalle",
 },
 {
 href: `/app/entrenamiento/plantillas/${templateId}/editar`,
 icon: Pencil,
 label: "Editar",
 },
 {
 destructive: isActive,
 icon: isActive ? PowerOff : Power,
 label: isActive ? "Desactivar" : "Activar",
 onSelect: () => setConfirmation("status"),
 separatorBefore: true,
 },
 {
 destructive: true,
 icon: Trash2,
 label: "Eliminar",
 onSelect: () => setConfirmation("delete"),
 },
 ]}
 />
 ) : (
 <div className="flex flex-wrap gap-3">
 <Button asChild variant="outline" size="lg">
 <Link href={`/app/entrenamiento/plantillas/${templateId}/editar`}>
 <Pencil aria-hidden="true" />
 Editar plantilla
 </Link>
 </Button>
 <Button
 type="button"
 variant="outline"
 size="lg"
 onClick={() => setConfirmation("status")}
 >
 {isActive ? (
 <PowerOff aria-hidden="true" />
 ) : (
 <Power aria-hidden="true" />
 )}
 {isActive ? "Desactivar" : "Activar"}
 </Button>
 <Button
 type="button"
 variant="destructive"
 size="lg"
 onClick={() => setConfirmation("delete")}
 >
 <Trash2 aria-hidden="true" />
 Eliminar plantilla
 </Button>
 </div>
 )}

 <ConfirmationDialog
 open={confirmation !== null}
 onOpenChange={(open) => {
 if (!open) {
 setConfirmation(null);
 }
 }}
 title={
 confirmation === "delete"
 ? `Eliminar ${templateName}`
 : `${isActive ? "Desactivar" : "Activar"} ${templateName}`
 }
 description={
 confirmation === "delete"
 ? "La plantilla se eliminará. Las asignaciones existentes conservarán un snapshot completo en el historial."
 : isActive
 ? "La plantilla dejará de estar disponible para nuevas asignaciones."
 : "La plantilla volverá a estar disponible para asignaciones."
 }
 confirmLabel={
 confirmation === "delete"
 ? "Eliminar plantilla"
 : isActive
 ? "Desactivar"
 : "Activar"
 }
 pendingLabel="Actualizando..."
 tone={
 confirmation === "delete" || isActive ? "destructive" : "default"
 }
 onConfirm={handleConfirm}
 />
 </>
 );
}
