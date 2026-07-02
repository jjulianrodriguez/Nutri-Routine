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
 className="h-11 w-full min-w-0 rounded-control bg-black/5 px-4 py-2 text-sm font-bold text-foreground shadow-none transition-all outline-none hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:ring-primary/40"
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
