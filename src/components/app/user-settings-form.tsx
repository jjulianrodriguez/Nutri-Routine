"use client";

import {
 AlertCircle,
 Bell,
 CheckCircle2,
 Clock3,
 Eye,
 EyeOff,
 Loader2,
 MonitorSmartphone,
 Save,
 ShieldCheck,
 Type,
 Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AppPanel } from "@/components/app/AppScreen";
import {
 applyDisplayPreferences,
} from "@/components/app/user-preference-applier";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { updateUserSettings } from "@/lib/actions/user-settings";
import type { UserSettingsValues } from "@/lib/user-settings/types";
import { cn } from "@/lib/utils";

type UserSettingsFormProps = {
 initialValues: UserSettingsValues;
};

type SwitchRowProps = {
 checked: boolean;
 description: string;
 disabled?: boolean;
 icon?: ReactNode;
 label: string;
 onChange: (checked: boolean) => void;
};

type SelectRowProps = {
 description: string;
 icon?: ReactNode;
 label: string;
 onChange: (value: string) => void;
 options: Array<{
 label: string;
 value: string;
 }>;
 value: string;
};

function SettingsControl({
 action,
 description,
 icon,
 label,
}: {
 action: ReactNode;
 description: string;
 icon?: ReactNode;
 label: string;
}) {
 return (
 <div className="rounded-[18px] bg-background p-4">
 <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex min-w-0 items-start gap-3">
 {icon ? (
 <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-muted-foreground">
 {icon}
 </span>
 ) : null}
 <div className="min-w-0">
 <h3 className="font-extrabold text-foreground">{label}</h3>
 <p className="mt-1 text-sm font-semibold leading-6 text-muted">
 {description}
 </p>
 </div>
 </div>
 <div className="shrink-0">{action}</div>
 </div>
 </div>
 );
}

function SwitchRow({
 checked,
 description,
 disabled = false,
 icon,
 label,
 onChange,
}: SwitchRowProps) {
 return (
 <SettingsControl
 description={description}
 icon={icon}
 label={label}
 action={
 <button
 type="button"
 role="switch"
 aria-checked={checked}
 disabled={disabled}
 onClick={() => onChange(!checked)}
 className={cn(
 "relative h-8 w-14 rounded-full bg-surface-secondary p-1 transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-55",
 checked && "border-primary/40 bg-primary",
 )}
 >
 <span
 className={cn(
 "block size-6 rounded-full bg-surface transition-transform",
 checked && "translate-x-6",
 )}
 />
 </button>
 }
 />
 );
}

function SelectRow({
 description,
 icon,
 label,
 onChange,
 options,
 value,
}: SelectRowProps) {
 return (
 <SettingsControl
 description={description}
 icon={icon}
 label={label}
 action={
 <select
 value={value}
 onChange={(event) => onChange(event.target.value)}
 className="h-11 min-w-40 cursor-pointer rounded-control bg-surface px-4 text-sm font-bold text-foreground outline-none transition-colors ring-2 ring-primary/30 focus:bg-primary-soft dark:ring-primary/40 dark:focus:bg-primary-soft"
 >
 {options.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 }
 />
 );
}

export function UserSettingsForm({
 initialValues,
}: UserSettingsFormProps) {
 const router = useRouter();
 const { setTheme } = useTheme();
 const [values, setValues] = useState<UserSettingsValues>(initialValues);
 const [savedValues, setSavedValues] = useState<UserSettingsValues>(initialValues);
 const [isSaving, setIsSaving] = useState(false);
 const hasPendingChanges = Object.keys(values).some((key) => {
 const typedKey = key as keyof UserSettingsValues;

 return values[typedKey] !== savedValues[typedKey];
 });

 useEffect(() => {
 setTheme(values.theme);
 applyDisplayPreferences(values);
 }, [setTheme, values]);

 function updateValue<Key extends keyof UserSettingsValues>(
 key: Key,
 value: UserSettingsValues[Key],
 ) {
 setValues((current) => ({
 ...current,
 [key]: value,
 }));
 }

 async function saveSettings() {
 setIsSaving(true);
 const result = await updateUserSettings(values);
 setIsSaving(false);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 setSavedValues(values);
 toast.success(result.message);
 router.refresh();
 }

 return (
 <>
 <section id="apariencia" className="scroll-mt-24">
 <AppPanel title="Apariencia" description="Ajusta como queres ver la app.">
 <div className="space-y-3">
 <SelectRow
 description="Cambia entre interfaz clara y oscura."
 icon={<MonitorSmartphone className="size-4" aria-hidden="true" />}
 label="Tema"
 value={values.theme}
 onChange={(value) =>
 updateValue("theme", value === "dark" ? "dark" : "light")
 }
 options={[
 { label: "Claro", value: "light" },
 { label: "Oscuro", value: "dark" },
 ]}
 />
 <SelectRow
 description="Aumenta ligeramente el tamano del texto en la app."
 icon={<Type className="size-4" aria-hidden="true" />}
 label="Tamano de texto"
 value={values.textSize}
 onChange={(value) =>
 updateValue("textSize", value === "large" ? "large" : "normal")
 }
 options={[
 { label: "Normal", value: "normal" },
 { label: "Grande", value: "large" },
 ]}
 />
 <SwitchRow
 checked={values.reducedMotion}
 description="Reduce transiciones y animaciones visuales."
 icon={<Wand2 className="size-4" aria-hidden="true" />}
 label="Animaciones reducidas"
 onChange={(checked) => updateValue("reducedMotion", checked)}
 />
 </div>
 </AppPanel>
 </section>

 <section id="privacidad" className="scroll-mt-24">
 <AppPanel
 title="Privacidad"
 description="Controla que pueden ver tus profesionales asignados antes de atenderte."
 >
 <div className="space-y-3">
 <div className="rounded-[20px] border-primary/25 bg-primary-soft/60 p-4 text-sm leading-6 text-muted">
 <p className="font-extrabold text-foreground">
 Que significa compartir estos datos
 </p>
 <p className="mt-1">
 Si activas una opcion, tus profesionales asignados pueden ver
 ese grupo de datos para preparar tu seguimiento. Si la
 desactivas, la app oculta esa informacion en sus vistas de
 cliente. Admin autorizado conserva acceso operativo cuando sea
 necesario.
 </p>
 </div>
 <SwitchRow
 checked={values.allowAssignedProfessionalsPersonalInfo}
 description="Tu telefono, fecha de nacimiento y datos de contacto utiles para coordinar citas o seguimiento."
 icon={<ShieldCheck className="size-4" aria-hidden="true" />}
 label="Informacion personal"
 onChange={(checked) =>
 updateValue("allowAssignedProfessionalsPersonalInfo", checked)
 }
 />
 <SwitchRow
 checked={values.allowAssignedProfessionalsHealthData}
 description="Peso, altura, medidas, condiciones, lesiones, alergias y restricciones que ayudan a adaptar tu plan."
 icon={<Eye className="size-4" aria-hidden="true" />}
 label="Datos fisicos y salud"
 onChange={(checked) =>
 updateValue("allowAssignedProfessionalsHealthData", checked)
 }
 />
 <SwitchRow
 checked={values.allowAssignedProfessionalsSensitiveNotes}
 description="Notas que vos escribiste para que tu profesional tome en cuenta detalles sensibles de tu atencion."
 icon={<EyeOff className="size-4" aria-hidden="true" />}
 label="Notas sensibles"
 onChange={(checked) =>
 updateValue("allowAssignedProfessionalsSensitiveNotes", checked)
 }
 />
 </div>
 </AppPanel>
 </section>

 <section id="notificaciones" className="scroll-mt-24">
 <AppPanel
 title="Notificaciones"
 description="Elige que avisos queres recibir dentro de la app."
 >
 <div className="space-y-3">
 <SwitchRow
 checked={values.notificationsEnabled}
 description="Activa o pausa todos los avisos de actividad."
 icon={<Bell className="size-4" aria-hidden="true" />}
 label="Notificaciones generales"
 onChange={(checked) => updateValue("notificationsEnabled", checked)}
 />
 <SwitchRow
 checked={values.notificationsEnabled && values.notifyMessages}
 description="Avisos cuando recibis mensajes nuevos."
 disabled={!values.notificationsEnabled}
 label="Mensajes"
 onChange={(checked) => updateValue("notifyMessages", checked)}
 />
 <SwitchRow
 checked={values.notificationsEnabled && values.notifyAppointments}
 description="Avisos sobre citas y recordatorios."
 disabled={!values.notificationsEnabled}
 label="Citas y recordatorios"
 onChange={(checked) => updateValue("notifyAppointments", checked)}
 />
 <SwitchRow
 checked={values.notificationsEnabled && values.notifyPlanChanges}
 description="Avisos cuando cambia un plan activo o una plantilla."
 disabled={!values.notificationsEnabled}
 label="Cambios en planes"
 onChange={(checked) => updateValue("notifyPlanChanges", checked)}
 />
 <SwitchRow
 checked={values.notificationsEnabled && values.notifyAssignments}
 description="Avisos por asignaciones, recursos o cambios importantes."
 disabled={!values.notificationsEnabled}
 label="Asignaciones importantes"
 onChange={(checked) => updateValue("notifyAssignments", checked)}
 />
 </div>
 </AppPanel>
 </section>

 <section id="preferencias" className="scroll-mt-24">
 <AppPanel
 title="Preferencias"
 description="Ajustes generales para la forma en que ves la informacion."
 >
 <SelectRow
 description="Se aplica a mensajes, calendario, recordatorios y notificaciones."
 icon={<Clock3 className="size-4" aria-hidden="true" />}
 label="Formato de hora"
 value={values.timeFormat}
 onChange={(value) =>
 updateValue("timeFormat", value === "12h" ? "12h" : "24h")
 }
 options={[
 { label: "24 horas", value: "24h" },
 { label: "12 horas", value: "12h" },
 ]}
 />
 </AppPanel>
 </section>

 <div className="xl:col-span-2">
 <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-[24px] bg-surface/90 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-start gap-3 text-sm leading-6">
 <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-muted-foreground">
 {hasPendingChanges ? (
 <AlertCircle className="size-4" aria-hidden="true" />
 ) : (
 <CheckCircle2 className="size-4" aria-hidden="true" />
 )}
 </span>
 <div>
 <p className="font-extrabold text-foreground">
 {hasPendingChanges ? "Cambios pendientes" : "Configuracion al dia"}
 </p>
 <p className="text-muted" aria-live="polite">
 {hasPendingChanges
 ? "Revisa y guarda para aplicar estas preferencias en tu cuenta."
 : "No hay cambios sin guardar."}
 </p>
 </div>
 </div>
 <Button
 type="button"
 size="lg"
 onClick={saveSettings}
 disabled={isSaving || !hasPendingChanges}
 >
 {isSaving ? (
 <>
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 Guardando...
 </>
 ) : (
 <>
 <Save className="size-4" aria-hidden="true" />
 Guardar configuracion
 </>
 )}
 </Button>
 </div>
 </div>
 </>
 );
}
