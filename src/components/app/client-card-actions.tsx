"use client";

import { Settings2, UserRound } from "lucide-react";

import { CardActionsMenu } from "@/components/app/card-actions-menu";

type ClientCardActionsProps = {
  canManagePlans: boolean;
  canViewProfile: boolean;
  clientId: string;
  clientName: string;
};

export function ClientCardActions({
  canManagePlans,
  canViewProfile,
  clientId,
  clientName,
}: ClientCardActionsProps) {
  return (
    <CardActionsMenu
      label={clientName}
      items={[
        ...(canViewProfile
          ? [
              {
                href: `/app/clientes/${clientId}`,
                icon: UserRound,
                label: "Ver perfil",
              },
            ]
          : []),
        ...(canManagePlans
          ? [
              {
                href: `#planes-${clientId}`,
                icon: Settings2,
                label: "Gestionar planes",
              },
            ]
          : []),
      ]}
    />
  );
}
