export function formatBlogDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
  dateStyle: "medium",
  timeStyle: "short",
 }).format(new Date(value));
}
