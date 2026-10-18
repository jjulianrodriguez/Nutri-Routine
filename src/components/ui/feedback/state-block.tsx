import {
 AlertTriangle,
 CheckCircle2,
 CircleDashed,
 LoaderCircle,
 LockKeyhole,
 SearchX,
 WifiOff,
 Wrench,
 type LucideIcon,
} from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/actions/button";
import type { ButtonProps } from "@/components/ui/actions/button-core";
import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/utilities/composition";
import { cn } from "@/lib/utils";

const stateBlockVariants = defineVariants(
 "h-fit self-start rounded-card p-5 text-sm leading-6",
 {
  variants: {
   align: {
    center: "text-center",
    start: "text-left",
   },
   size: {
    default: "p-5",
    lg: "p-6 sm:p-8",
    sm: "p-4",
   },
   variant: {
    empty: "bg-surface text-muted",
    error: "border border-status-danger/20 bg-status-danger-surface text-status-danger",
    loading: "bg-surface text-muted",
    maintenance: "border border-warning/30 bg-warning-soft text-text-secondary",
    "no-permission": "border border-warning/30 bg-warning-soft text-text-secondary",
    "no-results": "bg-surface text-muted",
    offline: "border border-warning/30 bg-warning-soft text-text-secondary",
    success: "border border-primary/20 bg-primary-soft text-foreground",
    warning: "border border-warning/30 bg-warning-soft text-text-secondary",
   },
  },
  defaultVariants: {
   align: "start",
   size: "default",
   variant: "empty",
  },
 },
);

type StateBlockVariant = NonNullable<
 VariantPropsOf<typeof stateBlockVariants>["variant"]
>;
type StateBlockSize = NonNullable<
 VariantPropsOf<typeof stateBlockVariants>["size"]
>;
type StateBlockAlign = NonNullable<
 VariantPropsOf<typeof stateBlockVariants>["align"]
>;

type StateBlockProps = Omit<React.ComponentPropsWithoutRef<"section">, "title"> &
 VariantPropsOf<typeof stateBlockVariants> & {
  actions?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  icon?: React.ReactNode | false;
  title?: React.ReactNode;
 };

const stateIconByVariant: Record<StateBlockVariant, LucideIcon> = {
 empty: CircleDashed,
 error: AlertTriangle,
 loading: LoaderCircle,
 maintenance: Wrench,
 "no-permission": LockKeyhole,
 "no-results": SearchX,
 offline: WifiOff,
 success: CheckCircle2,
 warning: AlertTriangle,
};

function getDefaultRole(variant: StateBlockVariant) {
 if (variant === "error" || variant === "offline") {
  return "alert";
 }

 if (variant === "loading" || variant === "success") {
  return "status";
 }

 return "region";
}

function renderDefaultIcon(variant: StateBlockVariant) {
 const Icon = stateIconByVariant[variant];

 return (
  <Icon
   className={cn("size-5", variant === "loading" && "animate-spin")}
   aria-hidden="true"
  />
 );
}

function StateBlock({
 actions,
 align = "start",
 "aria-busy": ariaBusy,
 "aria-live": ariaLive,
 children,
 className,
 description,
 eyebrow,
 icon,
 role,
 size = "default",
 title,
 variant = "empty",
 ...props
}: StateBlockProps) {
 const currentVariant = variant as StateBlockVariant;
 const currentAlign = align as StateBlockAlign;
 const currentSize = size as StateBlockSize;
 const iconContent = icon === false ? null : icon ?? renderDefaultIcon(currentVariant);
 const hasStructuredContent = Boolean(
  iconContent ||
   eyebrow ||
   title ||
   description ||
   actions,
 );

 return (
  <section
   data-slot="state-block"
   data-variant={currentVariant}
   data-size={currentSize}
   role={role ?? getDefaultRole(currentVariant)}
   aria-live={
    ariaLive ??
    (currentVariant === "loading" || currentVariant === "success"
     ? "polite"
     : undefined)
   }
   aria-busy={currentVariant === "loading" ? true : ariaBusy}
   className={composeClasses(
    stateBlockVariants({
     align: currentAlign,
     size: currentSize,
     variant: currentVariant,
    }),
    !hasStructuredContent && "font-semibold",
    className,
   )}
   {...props}
  >
   {hasStructuredContent ? (
    <div
     className={cn(
      "flex gap-3",
      currentAlign === "center"
       ? "mx-auto max-w-2xl flex-col items-center"
       : "items-start",
     )}
    >
     {iconContent ? (
      <span
       data-slot="state-block-icon"
       className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-background/70 text-current",
        currentSize === "sm" && "size-8",
        currentSize === "lg" && "size-12",
       )}
      >
       {iconContent}
      </span>
     ) : null}
     <div className={cn("min-w-0 flex-1", currentAlign === "center" && "flex flex-col items-center")}>
      {eyebrow ? (
       <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-current/75">
        {eyebrow}
       </p>
      ) : null}
      {title ? (
       <h2
        data-slot="state-block-title"
        className={cn(
         "font-extrabold leading-tight",
         currentVariant === "empty" ||
          currentVariant === "loading" ||
          currentVariant === "no-results"
          ? "text-foreground"
          : "text-current",
         currentSize === "sm" ? "text-sm" : "text-base",
         currentSize === "lg" && "text-xl",
        )}
       >
        {title}
       </h2>
      ) : null}
      {description ? (
       <p
        data-slot="state-block-description"
        className={cn("text-sm font-semibold leading-6 text-muted-foreground", title && "mt-2")}
       >
        {description}
       </p>
      ) : null}
      {children ? (
       <div
        data-slot="state-block-content"
        className={cn("text-sm font-semibold leading-6 text-muted", (title || description) && "mt-3")}
       >
        {children}
       </div>
      ) : null}
      {actions ? (
       <div
        data-slot="state-block-actions"
        className={cn(
         "mt-4 flex flex-wrap gap-2",
         currentAlign === "center" && "justify-center",
        )}
       >
        {actions}
       </div>
      ) : null}
     </div>
    </div>
   ) : (
    children
   )}
  </section>
 );
}

type EmptyStateVariant = Extract<
 StateBlockVariant,
 "empty" | "no-results" | "no-permission" | "offline"
>;

type EmptyStateProps = Omit<StateBlockProps, "variant"> & {
 variant?: EmptyStateVariant;
};

function EmptyState({
 icon = false,
 variant = "empty",
 ...props
}: EmptyStateProps) {
 return <StateBlock icon={icon} variant={variant} {...props} />;
}

type ErrorStateVariant = Extract<
 StateBlockVariant,
 "error" | "maintenance" | "no-permission" | "offline" | "warning"
>;

type ErrorStateProps = Omit<StateBlockProps, "actions" | "variant"> & {
 actions?: React.ReactNode;
 retryLabel?: React.ReactNode;
 retryProps?: Omit<ButtonProps, "children" | "variant">;
 variant?: ErrorStateVariant;
};

function ErrorState({
 actions,
 retryLabel = "Intentar de nuevo",
 retryProps,
 variant = "error",
 ...props
}: ErrorStateProps) {
 const retryAction = retryProps ? (
  <Button type="button" variant="outline" {...retryProps}>
   {retryLabel}
  </Button>
 ) : null;

 return (
  <StateBlock
   actions={
    retryAction || actions ? (
     <>
      {retryAction}
      {actions}
     </>
    ) : undefined
   }
   variant={variant}
   {...props}
  />
 );
}

type LoadingStateProps = Omit<StateBlockProps, "description" | "variant"> & {
 description?: React.ReactNode;
 label?: React.ReactNode;
};

function LoadingState({
 description,
 icon,
 label,
 title = "Cargando",
 ...props
}: LoadingStateProps) {
 return (
  <StateBlock
   description={description ?? label}
   icon={icon ?? renderDefaultIcon("loading")}
   title={title}
   variant="loading"
   {...props}
  />
 );
}

export {
 EmptyState,
 ErrorState,
 LoadingState,
 StateBlock,
 stateBlockVariants,
 type EmptyStateProps,
 type ErrorStateProps,
 type LoadingStateProps,
 type StateBlockProps,
 type StateBlockVariant,
};
