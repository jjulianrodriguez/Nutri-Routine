import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { ProfessionalAccountManager } from "@/components/app/professional-account-manager";
import { Button } from "@/components/ui/button";
import { getProfessionalAccount } from "@/lib/actions/professional-accounts";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

export default async function ProfessionalAccountDetailPage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const access = await requireRouteAccess("/app/configuracion/profesionales");

 if (!access.canManageProfessionalAccounts) {
 redirect("/app/dashboard");
 }

 const { id } = await params;
 const result = await getProfessionalAccount(id);

 if (!result.item) {
 notFound();
 }

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Gestion profesional"
 title={result.item.fullName}
 description="Edita los datos permitidos, controla el acceso profesional y revisa asignaciones antes de eliminar."
 />

 <Button asChild variant="outline" size="lg">
 <Link href="/app/configuracion/profesionales">
 <ArrowLeft className="size-4" aria-hidden="true" />
 Volver a profesionales
 </Link>
 </Button>

 <ProfessionalAccountManager professional={result.item} />
 </AppScreen>
 );
}
