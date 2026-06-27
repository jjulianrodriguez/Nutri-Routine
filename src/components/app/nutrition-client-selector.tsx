"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

type NutritionClientSelectorProps = {
  clients: Array<{ id: string; fullName: string }>;
  selectedClientId: string;
  basePath: string;
};

export function NutritionClientSelector({
  clients,
  selectedClientId,
  basePath,
}: NutritionClientSelectorProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-1.5 w-full sm:w-72">
      <Label htmlFor="client-selector" className="text-xs font-extrabold uppercase tracking-wider text-muted">
        Clienta seleccionada
      </Label>
      <select
        id="client-selector"
        value={selectedClientId}
        onChange={(e) => {
          router.push(`${basePath}?client=${e.target.value}`);
        }}
        className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm font-bold text-charcoal shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
      >
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.fullName}
          </option>
        ))}
      </select>
    </div>
  );
}
