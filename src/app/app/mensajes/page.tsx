import { MessageCircle, Users } from "lucide-react";

import { AppHeader, AppPanel, AppScreen, EmptyState } from "@/components/app/AppScreen";
import { getMessagesData } from "@/lib/app/dashboard-data";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

function ConversationRecords({
  records,
}: {
  records: Awaited<ReturnType<typeof getMessagesData>>["records"];
}) {
  if (records.length === 0) {
    return <EmptyState>No hay conversaciones todavia.</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <article
          key={record.id}
          className="rounded-[20px] border border-border bg-background p-4"
        >
          <h2 className="font-extrabold text-charcoal">{record.title}</h2>
          {record.detail ? (
            <p className="mt-2 text-sm text-muted">{record.detail}</p>
          ) : null}
          {record.meta ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-warm-brown">
              Ultima actividad {record.meta}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default async function MessagesPage() {
  const access = await requireRouteAccess("/app/mensajes");
  const data = await getMessagesData(access);

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mis mensajes" : "Comunicacion"}
        title="Mensajes"
        description={
          access.isClient
            ? "Conversaciones con los profesionales asignados a tus servicios."
            : "Conversaciones con clientes asignados y seguimiento operativo."
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AppPanel
          title={access.isClient ? "Conversaciones recientes" : "Bandeja de clientes"}
          description={`${data.count} conversaciones visibles para esta cuenta.`}
        >
          <ConversationRecords records={data.records} />
        </AppPanel>

        <AppPanel
          title={access.isClient ? "Profesionales asignados" : "Alcance"}
          tone="accent"
        >
          <div className="grid gap-3">
            <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
              <MessageCircle className="size-5 text-warm-brown" />
              <h2 className="mt-4 font-extrabold text-charcoal">
                {access.isClient ? "Mensajes personales" : "Mensajes administrativos"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                El contenido se debe filtrar por Supabase/RLS y por la capa de acceso
                actual.
              </p>
            </div>
            {!access.isClient ? (
              <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
                <Users className="size-5 text-warm-brown" />
                <h2 className="mt-4 font-extrabold text-charcoal">
                  Clientes asignados
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Solo para perfiles admin/professional.
                </p>
              </div>
            ) : null}
          </div>
        </AppPanel>
      </div>
    </AppScreen>
  );
}
