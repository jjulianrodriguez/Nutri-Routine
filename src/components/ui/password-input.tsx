"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
 visibilityLabel?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
 function PasswordInput(
 {
 className,
 disabled,
 visibilityLabel = "contraseña",
 ...props
 },
 ref,
 ) {
 const [isVisible, setIsVisible] = React.useState(false);
 const toggleLabel = isVisible
 ? `Ocultar ${visibilityLabel}`
 : `Mostrar ${visibilityLabel}`;

 return (
 <div className="relative mt-2">
 <Input
 ref={ref}
 type={isVisible ? "text" : "password"}
 className={cn(className, "mt-0 pr-14")}
 disabled={disabled}
 {...props}
 />
 <button
 type="button"
 aria-label={toggleLabel}
 aria-pressed={isVisible}
 aria-controls={props.id}
 disabled={disabled}
 className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50"
 onClick={() => setIsVisible((current) => !current)}
 >
 {isVisible ? (
 <EyeOff className="size-5" aria-hidden="true" />
 ) : (
 <Eye className="size-5" aria-hidden="true" />
 )}
 </button>
 </div>
 );
 },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
