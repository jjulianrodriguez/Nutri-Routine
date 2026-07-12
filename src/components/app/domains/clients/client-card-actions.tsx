"use client";

import { Power, Settings2, UserCog } from "lucide-react";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";

type ClientCardActionsProps = {
 canAssignProfessional?: boolean;
 canManagePlans: boolean;
 clientId: string;
 clientName: string;
 isClientActivated: boolean;
};

export function ClientCardActions({
 canAssignProfessional = false,
 canManagePlans,
 clientId,
 clientName,
 isClientActivated,
}: ClientCardActionsProps) {
 const managementHref = `/app/clientes/${clientId}#gestion-planes`;

 return (
 <CardActionsMenu
 label={clientName}
 items={[
 ...(canManagePlans
 ? [
 {
 href: managementHref,
 icon: Settings2,
 label: "Gestionar planes",
 },
 {
 href: managementHref,
 icon: Power,
 label: isClientActivated
 ? "Activar o desactivar"
 : "Activar planes",
 },
 ...(canAssignProfessional
 ? [
 {
 href: managementHref,
 icon: UserCog,
 label: "Asignar profesional",
 separatorBefore: true,
 },
 ]
 : []),
 ]
 : []),
 ]}
 />
 );
}
