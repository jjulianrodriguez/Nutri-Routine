"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth/authenticated-user";
import { createClient } from "@/lib/supabase/server";
import { userSettingsToRow } from "@/lib/user-settings/types";
import {
 userSettingsSchema,
 type UserSettingsFormValues,
} from "@/lib/validations/user-settings";

type UserSettingsFieldErrors = Partial<
 Record<keyof UserSettingsFormValues, string>
>;

export type UpdateUserSettingsResult =
 | {
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: UserSettingsFieldErrors;
 message: string;
 status: "error";
 };

function getFieldErrors(error: {
 flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
 return Object.fromEntries(
 Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
 field,
 messages?.[0],
 ]),
 ) as UserSettingsFieldErrors;
}

function revalidateSettingsPaths() {
 revalidatePath("/app", "layout");
 revalidatePath("/app/calendario");
 revalidatePath("/app/configuracion");
 revalidatePath("/app/notificaciones");
 revalidatePath("/app/perfil");
 revalidatePath("/app/clientes");
}

export async function updateUserSettings(
 values: UserSettingsFormValues,
): Promise<UpdateUserSettingsResult> {
 const parsed = userSettingsSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getFieldErrors(parsed.error),
 message: "Revisa las opciones marcadas.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const user = await getAuthenticatedUser(supabase);

 if (!user) {
 return {
 message: "Debes iniciar sesion para guardar tu configuracion.",
 status: "error",
 };
 }

 const { error } = await supabase.from("user_settings").upsert({
 profile_id: user.id,
 ...userSettingsToRow(parsed.data),
 });

 if (error) {
 return {
 message: "No se pudo guardar la configuracion. Intentalo de nuevo.",
 status: "error",
 };
 }

 revalidateSettingsPaths();

 return {
 message: "Configuracion guardada correctamente.",
 status: "success",
 };
}
