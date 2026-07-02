import { cn } from "@/lib/utils";

const sizeClasses = {
 lg: "size-24 text-2xl sm:size-28",
 md: "size-11 text-sm",
} as const;

function getInitials(name: string) {
 return (
 name
 .split(/\s+/)
 .filter(Boolean)
 .slice(0, 2)
 .map((part) => part[0]?.toUpperCase())
 .join("") || "CL"
 );
}

export function ClientAvatar({
 className,
 name,
 size = "md",
 src,
}: {
 className?: string;
 name: string;
 size?: keyof typeof sizeClasses;
 src?: string | null;
}) {
 return (
 <div
 className={cn(
 "grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-extrabold text-secondary-foreground",
 sizeClasses[size],
 className,
 )}
 >
 {src ? (
 // Avatar URLs can come from different configured providers.
 // eslint-disable-next-line @next/next/no-img-element
 <img
 alt={`Avatar de ${name}`}
 className="size-full object-cover"
 referrerPolicy="no-referrer"
 src={src}
 />
 ) : (
 <span aria-label={`Iniciales de ${name}`}>{getInitials(name)}</span>
 )}
 </div>
 );
}
