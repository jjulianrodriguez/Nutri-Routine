import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

export default function ClientNotFound() {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="El perfil no existe, ya no está disponible o no tienes permisos para consultarlo."
          eyebrow="Perfil no disponible"
          fallbackHref="/app/clientes"
          fallbackLabel="Ir a clientes"
          kind="forbidden"
          title="No encontramos este cliente"
        />
      </div>
    </AppScreen>
  );
}
