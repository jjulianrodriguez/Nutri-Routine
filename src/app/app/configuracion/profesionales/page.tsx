import { CalendarDays, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { AppHeader, AppPanel, AppScreen } from "@/components/app/AppScreen";
import { ProfessionalAccountForm } from "@/components/app/professional-account-form";
import { FadeIn } from "@/components/motion/fade-in";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { listProfessionalAccounts } from "@/lib/actions/professional-accounts";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import type { ProfessionalSpecialty } from "@/lib/validations/professional-accounts";

const specialtyLabels: Record<ProfessionalSpecialty, string> = {
  both: "Profesional en ambas areas",
  nutrition: "Profesional en nutricion",
  training: "Profesional en entrenamiento",
};

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ProfessionalAccountsPage() {
  const access = await requireRouteAccess("/app/configuracion/profesionales");

  if (!access.canManageProfessionalAccounts) {
    redirect("/app/dashboard");
  }

  const professionalAccounts = await listProfessionalAccounts();

  return (
    <AppScreen>
      <FadeIn>
        <AppHeader
          eyebrow="Equipo"
          title="Crear cuenta profesional"
          description="Alta segura para profesionales de nutricion, entrenamiento o ambas areas."
        />
      </FadeIn>

      <FadeIn delay={0.04}>
        <div className="rounded-[22px] border border-primary/25 bg-primary-soft p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-primary text-charcoal">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </div>
            <p className="text-sm font-extrabold leading-6 text-charcoal">
              El codigo administrativo se valida solo en servidor.
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <AppPanel
          title="Crear cuenta"
          description="Estas cuentas se crean con rol admin y especialidad profesional."
        >
          <ProfessionalAccountForm />
        </AppPanel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <AppPanel
          title="Profesionales existentes"
          description="Lista simple para revisar altas recientes."
        >
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-2 text-sm font-extrabold text-charcoal">
            <Users className="size-4" aria-hidden="true" />
            {professionalAccounts.items.length}
          </div>
          {professionalAccounts.error ? (
            <Alert
              variant="destructive"
              className="mb-4 rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
            >
              <AlertDescription className="font-semibold text-danger">
                {professionalAccounts.error}
              </AlertDescription>
            </Alert>
          ) : null}

          {professionalAccounts.items.length > 0 ? (
            <div className="divide-y divide-border overflow-hidden rounded-[22px] border border-border bg-background">
              {professionalAccounts.items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-extrabold text-charcoal">
                      {item.fullName}
                    </h2>
                    <p className="mt-1 truncate text-sm text-muted">
                      {item.email || "Email no disponible"}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                    {specialtyLabels[item.specialty]}
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-warm-brown">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {formatCreatedAt(item.createdAt)}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-background px-4 py-8 text-center">
              <p className="font-extrabold text-charcoal">
                Aun no hay cuentas profesionales.
              </p>
              <p className="mt-2 text-sm text-muted">
                Cuando completes el formulario, apareceran aqui.
              </p>
            </div>
          )}
        </AppPanel>
      </FadeIn>
    </AppScreen>
  );
}
