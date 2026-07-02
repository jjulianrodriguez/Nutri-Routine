export function formatRestTime(totalSeconds: number | null) {
 if (totalSeconds === null) {
 return "Opcional";
 }

 if (totalSeconds === 0) {
 return "Sin descanso";
 }

 const minutes = Math.floor(totalSeconds / 60);
 const seconds = totalSeconds % 60;
 const parts: string[] = [];

 if (minutes > 0) {
 parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
 }

 if (seconds > 0) {
 parts.push(`${seconds} ${seconds === 1 ? "segundo" : "segundos"}`);
 }

 return parts.join(" ");
}
