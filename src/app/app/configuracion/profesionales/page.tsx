import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  CircleOff,
  Dumbbell,
  ShieldCheck,
  Utensils,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader, AppPanel, AppScreen } from "@/components/app/AppScreen";
import { ProfessionalAccountForm } from "@/components/app/professional-account-form";
import { FadeIn } from "@/components/motion/fade-in";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { listProfessionalAccounts } from "@/lib/actions/professional-accounts";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import type { ProfessionalSpecialty } from "@/lib/validations/professional-accounts";

const specialtyLabels: Record<ProfessionalSpecialty, string> = {
  both: "Entrenadora y nutricionista",
  nutrition: "Nutricionista",
  training: "Entrenadora",
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
          title="Gestion de profesionales"
          description="Crea cuentas, revisa sus asignaciones y administra especialidad y estado."
        />
      </FadeIn>

      <FadeIn delay={0.04}>
        <div className="rounded-[22px] border border-primary/25 bg-primary-soft p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </div>
            <p className="text-sm font-extrabold leading-6 text-foreground">
              El código administrativo se verifica de forma segura.
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <AppPanel
          title="Crear cuenta"
          description="Las cuentas nuevas usan el rol profesional y reciben permisos solo para el área seleccionada."
        >
          <ProfessionalAccountForm />
        </AppPanel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <AppPanel
          title="Profesionales existentes"
          description="Selecciona una cuenta para editar datos, especialidad o estado."
        >
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-2 text-sm font-extrabold text-foreground">
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
                  className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_minmax(0,12rem)_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-extrabold text-foreground">
                        {item.fullName}
                      </h2>
                      <span
                        className={
                          item.isActive
                            ? "inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-extrabold text-success"
                            : "inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-extrabold text-danger"
                        }
                      >
                        {item.isActive ? (
                          <CircleCheck className="size-3.5" aria-hidden="true" />
                        ) : (
                          <CircleOff className="size-3.5" aria-hidden="true" />
                        )}
                        {item.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">
                      {item.email || "Email no disponible"}
                    </p>
                  </div>
                  <div>
                    <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-foreground">
                      {specialtyLabels[item.specialty]}
                    </span>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      Alta {formatCreatedAt(item.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-extrabold text-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5">
                      <Utensils className="size-3.5" aria-hidden="true" />
                      {item.assignedNutritionClients} nutrición
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5">
                      <Dumbbell className="size-3.5" aria-hidden="true" />
                      {item.assignedTrainingClients} entrenamiento
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/app/configuracion/profesionales/${item.id}`}
                    >
                      Gestionar
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-background px-4 py-8 text-center">
              <p className="font-extrabold text-foreground">
                Aun no hay cuentas profesionales.
              </p>
              <p className="mt-2 text-sm text-muted">
                Cuando completes el formulario, aparecerán aquí.
              </p>
            </div>
          )}
        </AppPanel>
      </FadeIn>
    </AppScreen>
  );
}
