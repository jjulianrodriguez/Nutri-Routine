import {
  ImageIcon,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { BasicAccountForm } from "@/components/app/basic-account-form";
import { ClientAvatar } from "@/components/app/client-avatar";
import { PersonalDetailsForm } from "@/components/app/personal-details-form";
import { ProfessionalProfileForm } from "@/components/app/professional-profile-form";
import {
  AssignedProfessionalCards,
  RelationshipBadge,
  getPlanBadgeLabel,
} from "@/components/app/relationship-badges";
import { Button } from "@/components/ui/button";
import { getPersonalDetails } from "@/lib/account/personal-details";
import { getOwnProfessionalProfile } from "@/lib/account/professional-profile";
import {
  getAreaLabel,
  getClientProfileSummary,
  getProfessionalProfileSummary,
} from "@/lib/account/profile-summary";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings } from "@/lib/user-settings/data";
import { formatAppDateTime } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";

const specialtyLabels = {
  both: "Entrenamiento y nutricion",
  nutrition: "Nutricion",
  training: "Entrenamiento",
} as const;

function formatDate(value: string | null) {
  if (!value) {
    return "Pendiente";
  }

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null, timeFormat: TimeFormatPreference) {
  if (!value) {
    return "Sin cita programada";
  }

  return formatAppDateTime(value, timeFormat);
}

function SectionNav({
  items,
}: {
  items: Array<{
    href: string;
    label: string;
  }>;
}) {
  return (
    <nav
      aria-label="Subsecciones de perfil"
      className="flex gap-2 overflow-x-auto rounded-[22px] border border-border bg-surface/72 p-2 shadow-soft backdrop-blur-lg"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-[16px] px-3 py-2 text-sm font-extrabold text-warm-brown transition-colors hover:bg-primary-soft hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function InfoCard({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="h-fit self-start rounded-[18px] border border-border bg-background p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <div className="mt-2 text-sm font-bold leading-6 text-charcoal">
        {children}
      </div>
    </div>
  );
}

async function getOwnAvatarUrl(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", profileId)
    .maybeSingle();

  return data?.avatar_url ?? null;
}

async function ClientProfile({
  avatarUrl,
}: {
  avatarUrl: string | null;
}) {
  const access = await requireRouteAccess("/app/perfil");
  const [personalDetails, planSummary, settings] = await Promise.all([
    getPersonalDetails(access.userId),
    getClientProfileSummary(access),
    getUserSettings(access.userId),
  ]);
  const planBadge = getPlanBadgeLabel({
    hasNutritionService: access.hasNutritionService,
    hasTrainingService: access.hasTrainingService,
  });

  return (
    <>
      <SectionNav
        items={[
          { href: "#informacion-personal", label: "Informacion personal" },
          { href: "#datos-salud", label: "Datos fisicos y salud" },
          { href: "#profesionales", label: "Profesionales asignados" },
          { href: "#resumen-plan", label: "Resumen del plan" },
        ]}
      />

      <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Plan" value={planBadge} detail={planSummary.planStatusLabel} />
        <StatTile
          label="Nutricion"
          value={access.hasNutritionService ? "Activa" : "No asignada"}
          detail={access.assignedNutritionistName ?? "Sin profesional"}
        />
        <StatTile
          label="Entrenamiento"
          value={access.hasTrainingService ? "Activo" : "No asignado"}
          detail={access.assignedTrainerName ?? "Sin profesional"}
        />
        <StatTile
          label="Proxima cita"
          value={planSummary.nextAppointment ? "Programada" : "Pendiente"}
          detail={formatDateTime(
            planSummary.nextAppointment?.starts_at ?? null,
            settings.timeFormat,
          )}
        />
      </section>

      <section id="informacion-personal" className="scroll-mt-24">
        <AppPanel title="Informacion personal" description="Datos basicos de tu cuenta y contacto.">
          <div className="mb-5 flex flex-col gap-4 rounded-[20px] border border-border bg-background p-4 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <ClientAvatar name={access.displayName} size="lg" src={avatarUrl} />
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-muted">
                <ImageIcon className="size-3.5" aria-hidden="true" />
                Avatar solo lectura
              </p>
            </div>
            <div className="min-w-0">
              <UserRound className="mb-3 size-5 text-warm-brown" />
              <h2 className="break-words font-extrabold text-charcoal">
                {access.displayName}
              </h2>
              {access.email ? (
                <p className="mt-1 break-all text-sm font-semibold text-muted">
                  {access.email}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <RelationshipBadge tone="primary">{access.roleLabel}</RelationshipBadge>
                <RelationshipBadge tone="neutral">{planBadge}</RelationshipBadge>
              </div>
            </div>
          </div>
          <BasicAccountForm email={access.email} fullName={access.displayName} />
        </AppPanel>
      </section>

      <section id="datos-salud" className="scroll-mt-24">
        <AppPanel
          title="Datos fisicos y salud"
          description="Informacion privada para tu seguimiento profesional."
        >
          <div className="mb-5 flex items-start gap-3 rounded-[20px] border border-primary/25 bg-primary-soft/60 p-4">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-warm-brown" aria-hidden="true" />
            <div>
              <h3 className="font-extrabold text-charcoal">
                Privacidad por defecto
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Estos datos no son publicos. Solo vos, tus profesionales
                asignados y admin autorizado deberian consultarlos.
              </p>
            </div>
          </div>
          <PersonalDetailsForm
            hasSavedDetails={personalDetails.hasSavedDetails}
            initialValues={personalDetails.values}
            maxBirthDate={new Date().toISOString().slice(0, 10)}
            privacySettings={{
              healthData: settings.allowAssignedProfessionalsHealthData,
              personalInfo: settings.allowAssignedProfessionalsPersonalInfo,
              sensitiveNotes: settings.allowAssignedProfessionalsSensitiveNotes,
            }}
          />
        </AppPanel>
      </section>

      <section id="profesionales" className="scroll-mt-24">
        <AppPanel
          title="Profesionales asignados"
          description="Contactos activos segun tus planes de nutricion y entrenamiento."
        >
          <AssignedProfessionalCards
            assignedNutritionistId={access.assignedNutritionistId}
            assignedNutritionistName={access.assignedNutritionistName}
            assignedTrainerId={access.assignedTrainerId}
            assignedTrainerName={access.assignedTrainerName}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {access.assignedTrainerId ? (
              <Button asChild variant="outline">
                <Link
                  href={`/app/perfil?chatArea=training&professional=${access.assignedTrainerId}#profesionales`}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Chat entrenamiento
                </Link>
              </Button>
            ) : null}
            {access.assignedNutritionistId ? (
              <Button asChild variant="outline">
                <Link
                  href={`/app/perfil?chatArea=nutrition&professional=${access.assignedNutritionistId}#profesionales`}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Chat nutricion
                </Link>
              </Button>
            ) : null}
          </div>
          <div className="mt-5">
            <InfoCard label="Proxima cita o recordatorio">
              {planSummary.nextAppointment ? (
                <>
                  <span>{planSummary.nextAppointment.title}</span>
                  <span className="mt-1 block text-muted">
                    {getAreaLabel(planSummary.nextAppointment.area)} -{" "}
                    {formatDateTime(
                      planSummary.nextAppointment.starts_at,
                      settings.timeFormat,
                    )}
                  </span>
                </>
              ) : (
                "No hay citas programadas."
              )}
            </InfoCard>
          </div>
        </AppPanel>
      </section>

      <section id="resumen-plan" className="scroll-mt-24">
        <AppPanel title="Resumen del plan" description="Estado actual de tus servicios activos.">
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard label="Plan activo">{planSummary.activePlanLabel}</InfoCard>
            <InfoCard label="Estado">{planSummary.planStatusLabel}</InfoCard>
            <InfoCard label="Fecha de inicio">{formatDate(planSummary.planStartDate)}</InfoCard>
            <InfoCard label="Fecha de finalizacion">{formatDate(planSummary.planEndDate)}</InfoCard>
            <InfoCard label="Entrenamiento actual">
              {planSummary.currentTrainingPlan?.title ?? "Sin entrenamiento activo"}
            </InfoCard>
            <InfoCard label="Plan nutricional actual">
              {planSummary.currentNutritionPlan?.title ?? "Sin plan nutricional activo"}
            </InfoCard>
          </div>
        </AppPanel>
      </section>
    </>
  );
}

async function ProfessionalProfile({
  avatarUrl,
}: {
  avatarUrl: string | null;
}) {
  const access = await requireRouteAccess("/app/perfil");
  const [professionalProfile, summary] = await Promise.all([
    getOwnProfessionalProfile(access.userId),
    getProfessionalProfileSummary(access),
  ]);

  if (!professionalProfile) {
    return (
      <EmptyState>
        No hay un perfil profesional asociado a esta cuenta. Contacta a admin si
        necesitas activar esta informacion.
      </EmptyState>
    );
  }

  return (
    <>
      <SectionNav
        items={[
          { href: "#informacion-profesional", label: "Informacion profesional" },
          { href: "#experiencia", label: "Experiencia" },
          { href: "#disponibilidad", label: "Disponibilidad" },
          { href: "#resumen-profesional", label: "Resumen profesional" },
        ]}
      />

      <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Clientes activos"
          value={String(summary.activeClients)}
          detail="Asignados a tus servicios"
        />
        <StatTile
          label="Entrenamiento"
          value={String(summary.trainingClients)}
          detail="Clientes de entrenamiento"
        />
        <StatTile
          label="Nutricion"
          value={String(summary.nutritionClients)}
          detail="Clientes de nutricion"
        />
        <StatTile
          label="Proximas citas"
          value={String(summary.nextAppointments)}
          detail="Citas programadas"
        />
      </section>

      <section id="informacion-profesional" className="scroll-mt-24">
        <AppPanel
          title="Informacion profesional"
          description="Datos visibles y editables de tu perfil profesional."
        >
          <div className="mb-5 flex flex-col gap-4 rounded-[20px] border border-border bg-background p-4 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <ClientAvatar name={access.displayName} size="lg" src={avatarUrl} />
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-muted">
                <ImageIcon className="size-3.5" aria-hidden="true" />
                Avatar solo lectura
              </p>
            </div>
            <div className="min-w-0">
              <h2 className="break-words font-extrabold text-charcoal">
                {access.displayName}
              </h2>
              <p className="mt-1 flex items-center gap-2 break-all text-sm font-semibold text-muted">
                <Mail className="size-4" aria-hidden="true" />
                {access.email || "Correo no disponible"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <RelationshipBadge tone="primary">
                  {professionalProfile.specialty
                    ? specialtyLabels[professionalProfile.specialty]
                    : "Especialidad pendiente"}
                </RelationshipBadge>
                <RelationshipBadge
                  tone={professionalProfile.isActive ? "success" : "warning"}
                >
                  {professionalProfile.isActive ? "Activo" : "Inactivo"}
                </RelationshipBadge>
              </div>
            </div>
          </div>
          <BasicAccountForm email={access.email} fullName={access.displayName} />
        </AppPanel>
      </section>

      <section id="experiencia" className="scroll-mt-24">
        <AppPanel
          title="Experiencia"
          description="Trayectoria, certificaciones, areas de enfoque y disponibilidad editable."
        >
          <ProfessionalProfileForm initialValues={professionalProfile.values} />
        </AppPanel>
      </section>

      <section id="resumen-profesional" className="scroll-mt-24">
        <AppPanel title="Resumen profesional" description="Actividad creada por tu cuenta.">
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard label="Clientes activos">{summary.activeClients}</InfoCard>
            <InfoCard label="Clientes de entrenamiento">{summary.trainingClients}</InfoCard>
            <InfoCard label="Clientes de nutricion">{summary.nutritionClients}</InfoCard>
            <InfoCard label="Proximas citas">{summary.nextAppointments}</InfoCard>
            <InfoCard label="Recursos creados">{summary.resourcesCreated}</InfoCard>
            <InfoCard label="Blogs creados">{summary.blogsCreated}</InfoCard>
          </div>
        </AppPanel>
      </section>
    </>
  );
}

export default async function ProfilePage() {
  const access = await requireRouteAccess("/app/perfil");
  const avatarUrl = await getOwnAvatarUrl(access.userId);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Mi perfil"
        title="Mi perfil"
        description={
          access.isClient
            ? "Tu informacion personal, salud, profesionales asignados y plan activo."
            : "Tu informacion profesional, disponibilidad y resumen operativo."
        }
      />

      {access.isClient ? (
        <ClientProfile avatarUrl={avatarUrl} />
      ) : access.isProfessional ? (
        <ProfessionalProfile avatarUrl={avatarUrl} />
      ) : (
        <AppPanel
          title="Perfil administrativo"
          description="Resumen basico de la cuenta universal."
        >
          <div className="mb-5 flex items-center gap-4 rounded-[20px] border border-border bg-background p-4">
            <div className="shrink-0">
              <ClientAvatar name={access.displayName} src={avatarUrl} />
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-muted">
                <ImageIcon className="size-3.5" aria-hidden="true" />
                Avatar solo lectura
              </p>
            </div>
            <div>
              <ShieldCheck className="mb-3 size-5 text-warm-brown" />
              <h2 className="font-extrabold text-charcoal">{access.displayName}</h2>
              <p className="mt-1 text-sm text-muted">{access.email}</p>
            </div>
          </div>
          <BasicAccountForm email={access.email} fullName={access.displayName} />
        </AppPanel>
      )}
    </AppScreen>
  );
}
