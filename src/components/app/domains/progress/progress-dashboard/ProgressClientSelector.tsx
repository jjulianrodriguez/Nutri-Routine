import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import { Select } from "@/components/ui/forms/select";
import type { ProgressClientOption } from "@/lib/progress/data";

export function ProgressClientSelector({
 clients,
 invalidClientSelection,
 selectedClient,
}: {
 clients: ProgressClientOption[];
 invalidClientSelection: boolean;
 selectedClient: ProgressClientOption | null;
}) {
 return (
 <section className="h-fit self-start rounded-[24px] bg-surface/85 p-4 ">
 <form
 action="/app/progreso"
 className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
 >
 <input name="tab" type="hidden" value="resumen" />
 <Select
 label="Selecciona un cliente para ver su progreso"
 labelClassName="text-sm font-bold"
 variant="outline"
 className="bg-background"
 defaultValue={selectedClient?.id ?? ""}
 name="client"
 >
 <option value="" disabled>
 Elegir cliente
 </option>
 {clients.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 </option>
 ))}
 </Select>
 <Button type="submit">
 <UserRound className="size-4" aria-hidden="true" />
 Ver progreso
 </Button>
 </form>
 {invalidClientSelection ? (
 <p className="mt-3 text-sm font-semibold text-warning">
 Ese cliente no esta disponible para tu cuenta.
 </p>
 ) : null}
 </section>
 );
}