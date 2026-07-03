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
 className="h-11 w-full min-w-0 rounded-control bg-surface px-4 py-2 text-sm font-bold text-foreground transition-[background-color,border-color,box-shadow,color,transform] outline-none ring-2 ring-primary/30 focus:bg-primary-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:ring-primary/40 dark:focus:bg-primary-soft"
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
