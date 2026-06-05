import { requireUser } from "@/lib/auth/session";

function getDisplayName(userMetadata: Record<string, unknown>) {
  const fullName = userMetadata.full_name;

  return typeof fullName === "string" && fullName.trim()
    ? fullName.trim()
    : "Profesional";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = getDisplayName(user.user_metadata);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background px-5 py-8 sm:px-8">
      <div className="pointer-events-none absolute left-8 top-8 h-12 w-12 rotate-12 rounded-md border-2 border-accent/45" />
      <div className="pointer-events-none absolute bottom-10 right-8 h-10 w-20 -rotate-6 rounded-control bg-teal-soft/80" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-5xl items-center">
        <div className="creative-panel w-full rounded-[1.6rem] p-8 shadow-card sm:p-10">
          <p className="studio-kicker">Area privada</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            Hola, {displayName}.
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            La autenticacion esta lista. Este espacio queda preparado para
            organizar rutinas, nutricion y notas profesionales cuando avancemos
            al flujo privado completo.
          </p>
        </div>
      </section>
    </main>
  );
}
