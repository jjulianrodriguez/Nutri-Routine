"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { IconButton } from "@/components/ui/actions/button";
import { composeClasses } from "@/components/ui/utilities/composition";
import { Input, type InputProps } from "@/components/ui/forms/input";

type PasswordInputProps = Omit<InputProps, "type"> & {
 visibilityLabel?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
 function PasswordInput(
  {
   className,
   disabled,
   loading,
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
     className={composeClasses(className, "mt-0 pr-14")}
     disabled={disabled}
     loading={loading}
     {...props}
    />
    <IconButton
     type="button"
     label={toggleLabel}
     aria-pressed={isVisible}
     aria-controls={props.id}
     disabled={disabled || loading}
     variant="ghost"
     className="absolute right-1 top-1/2 z-[1] size-11 -translate-y-1/2 rounded-full text-muted hover:bg-foreground/5 hover:text-foreground focus-visible:ring-ring/35 active:not-aria-[haspopup]:-translate-y-1/2"
     onClick={() => setIsVisible((current) => !current)}
    >
     {isVisible ? (
      <EyeOff className="size-5" aria-hidden="true" />
     ) : (
      <Eye className="size-5" aria-hidden="true" />
     )}
    </IconButton>
   </div>
  );
 },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput, type PasswordInputProps };
