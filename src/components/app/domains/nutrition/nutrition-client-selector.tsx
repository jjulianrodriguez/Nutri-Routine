"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/forms/select";

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
 <Select
 containerClassName="w-full sm:w-72"
 id="client-selector"
 label="Clienta seleccionada"
 labelClassName="text-xs uppercase tracking-wider text-muted"
 value={selectedClientId}
 onChange={(e) => {
 router.push(`${basePath}?client=${e.target.value}`);
 }}
 >
 {clients.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 </option>
 ))}
 </Select>
 );
}
