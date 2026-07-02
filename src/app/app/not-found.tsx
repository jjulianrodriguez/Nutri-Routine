import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

export default function PrivateAppNotFound() {
 return (
 <AppScreen>
 <div className="grid min-h-[70dvh] place-items-center">
 <RecoveryState
 description="El contenido no existe, ya no está disponible o tu cuenta no tiene permisos para consultarlo."
 eyebrow="Recurso no disponible"
 fallbackHref="/app/dashboard"
 fallbackLabel="Ir al dashboard"
 kind="forbidden"
 title="No encontramos este recurso"
 />
 </div>
 </AppScreen>
 );
}
