import * as React from "react"
import {
 AlertTriangle,
 CheckCircle2,
 Inbox,
 Loader2,
 SearchX,
 ShieldX,
 WifiOff,
 Wrench,
} from "lucide-react"

import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/composition"
import { Button, type ButtonProps } from "@/components/ui/button"

const stateBlockVariants = defineVariants(
 "h-fit self-start rounded-card border p-5 text-sm leading-6 shadow-elevation-1 sm:p-6",
 {
  variants: {
   align: {
    center: "text-center",
    start: "text-left",
   },
   size: {
    sm: "p-4 sm:p-5",
    default: "",
    lg: "p-6 sm:p-8",
   },
   variant: {
    empty: "border-border-default bg-surface text-text-primary",
    error:
     "border-status-danger/30 bg-status-danger-surface text-status-danger-text",
    loading: "border-border-default bg-surface text-text-primary",
    maintenance:
     "border-status-notice/30 bg-status-notice-surface text-status-notice-text",
    "no-permission":
     "border-status-warning/30 bg-status-warning-surface text-status-warning-text",
    "no-results": "border-border-default bg-surface text-text-primary",
    offline:
     "border-status-warning/30 bg-status-warning-surface text-status-warning-text",
    success:
     "border-status-success/30 bg-status-success-surface text-status-success-text",
    warning:
     "border-status-warning/30 bg-status-warning-surface text-status-warning-text",
   },
  },
  defaultVariants: {
   align: "start",
   size: "default",
   variant: "empty",
  },
 },
)

const stateBlockIconVariants = defineVariants(
 "grid size-11 shrink-0 place-items-center rounded-full border [&_svg]:size-icon-lg",
 {
  variants: {
   variant: {
    empty: "border-border-default bg-surface-subtle text-text-muted",
    error:
     "border-status-danger/30 bg-status-danger-surface text-status-danger-text",
    loading: "border-border-default bg-surface-subtle text-text-muted",
    maintenance:
     "border-status-notice/30 bg-status-notice-surface text-status-notice-text",
    "no-permission":
     "border-status-warning/30 bg-status-warning-surface text-status-warning-text",
    "no-results": "border-border-default bg-surface-subtle text-text-muted",
    offline:
     "border-status-warning/30 bg-status-warning-surface text-status-warning-text",
    success:
     "border-status-success/30 bg-status-success-surface text-status-success-text",
    warning:
     "border-status-warning/30 bg-status-warning-surface text-status-warning-text",
   },
  },
  defaultVariants: {
   variant: "empty",
  },
 },
)

const stateBlockTextVariants = defineVariants("", {
 variants: {
  variant: {
   empty: "text-muted",
   error: "text-status-danger-text",
   loading: "text-muted",
   maintenance: "text-status-notice-text",
   "no-permission": "text-status-warning-text",
   "no-results": "text-muted",
   offline: "text-status-warning-text",
   success: "text-status-success-text",
   warning: "text-status-warning-text",
  },
 },
 defaultVariants: {
  variant: "empty",
 },
})

const defaultIconByVariant = {
 empty: Inbox,
 error: AlertTriangle,
 loading: Loader2,
 maintenance: Wrench,
 "no-permission": ShieldX,
 "no-results": SearchX,
 offline: WifiOff,
 success: CheckCircle2,
 warning: AlertTriangle,
} as const

type StateBlockVariant = NonNullable<
 VariantPropsOf<typeof stateBlockVariants>["variant"]
>
type StateBlockSize = NonNullable<
 VariantPropsOf<typeof stateBlockVariants>["size"]
>
type StateBlockAlign = NonNullable<
 VariantPropsOf<typeof stateBlockVariants>["align"]
>

type StateBlockProps = Omit<
 React.ComponentPropsWithoutRef<"section">,
 "title"
> &
 VariantPropsOf<typeof stateBlockVariants> & {
  actions?: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  icon?: React.ReactNode | false
  title?: React.ReactNode
 }

function getDefaultRole(variant: StateBlockVariant) {
 if (variant === "error" || variant === "offline") {
  return "alert"
 }

 if (variant === "loading" || variant === "success") {
  return "status"
 }

 return "region"
}

function StateBlock({
 actions,
 align,
 children,
 className,
 description,
 eyebrow,
 icon,
 role,
 size,
 title,
 variant,
 ...props
}: StateBlockProps) {
 const resolvedAlign = align ?? "start"
 const resolvedSize = size ?? "default"
 const resolvedVariant = variant ?? "empty"
 const DefaultIcon = defaultIconByVariant[resolvedVariant]
 const renderedIcon =
  icon === false ? null : (icon ?? <DefaultIcon aria-hidden="true" />)

 return (
  <section
   data-slot="state-block"
   data-variant={resolvedVariant}
   data-size={resolvedSize}
   role={role ?? getDefaultRole(resolvedVariant)}
   aria-live={resolvedVariant === "loading" ? "polite" : props["aria-live"]}
   aria-busy={resolvedVariant === "loading" ? true : props["aria-busy"]}
   className={composeClasses(
    stateBlockVariants({
     align: resolvedAlign,
     size: resolvedSize,
     variant: resolvedVariant,
    }),
    className,
   )}
   {...props}
  >
   <div
    className={composeClasses(
     "flex gap-4",
     resolvedAlign === "center" ? "flex-col items-center" : "items-start",
    )}
   >
    {renderedIcon ? (
     <div
      data-slot="state-block-icon"
      className={composeClasses(stateBlockIconVariants({ variant: resolvedVariant }))}
     >
      {resolvedVariant === "loading" && icon === undefined ? (
       <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
       renderedIcon
      )}
     </div>
    ) : null}

    <div className="min-w-0 flex-1">
     {eyebrow ? (
      <p
       data-slot="state-block-eyebrow"
       className="text-xs font-extrabold uppercase text-text-muted"
      >
       {eyebrow}
      </p>
     ) : null}
     {title ? (
      <h2
       data-slot="state-block-title"
       className="text-title font-heading text-text-primary"
      >
       {title}
      </h2>
     ) : null}
     {description ? (
      <p
       data-slot="state-block-description"
       className={composeClasses(
        "mt-2 max-w-2xl text-sm leading-6",
        resolvedAlign === "center" && "mx-auto",
        stateBlockTextVariants({ variant: resolvedVariant }),
       )}
      >
       {description}
      </p>
     ) : null}
     {children ? (
      <div
       data-slot="state-block-content"
       className={composeClasses(
        "text-sm leading-6",
        title || description || eyebrow ? "mt-3" : undefined,
        stateBlockTextVariants({ variant: resolvedVariant }),
       )}
      >
       {children}
      </div>
     ) : null}
     {actions ? (
      <div
       data-slot="state-block-actions"
       className={composeClasses(
        "mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap",
        resolvedAlign === "center" && "justify-center",
       )}
      >
       {actions}
      </div>
     ) : null}
    </div>
   </div>
  </section>
 )
}

type EmptyStateProps = Omit<StateBlockProps, "variant"> & {
 variant?: Extract<
  StateBlockVariant,
  "empty" | "no-permission" | "no-results" | "offline"
 >
}

function EmptyState({
 title = "No hay contenido disponible",
 variant = "empty",
 ...props
}: EmptyStateProps) {
 return <StateBlock title={title} variant={variant} {...props} />
}

type ErrorStateProps = Omit<StateBlockProps, "variant"> & {
 retryLabel?: React.ReactNode
 retryProps?: Omit<ButtonProps, "children" | "variant">
 variant?: Extract<
  StateBlockVariant,
  "error" | "maintenance" | "no-permission" | "offline" | "warning"
 >
}

function ErrorState({
 actions,
 retryLabel,
 retryProps,
 title = "No pudimos completar esta accion",
 variant = "error",
 ...props
}: ErrorStateProps) {
 const retryAction = retryLabel ? (
  <Button type="button" variant="outline" {...retryProps}>
   {retryLabel}
  </Button>
 ) : null
 const stateActions =
  retryAction || actions ? (
   <>
    {retryAction}
    {actions}
   </>
  ) : undefined

 return (
  <StateBlock
   actions={stateActions}
   title={title}
   variant={variant}
   {...props}
  />
 )
}

type LoadingStateProps = Omit<StateBlockProps, "variant"> & {
 label?: React.ReactNode
}

function LoadingState({
 description,
 label,
 title = "Cargando contenido",
 ...props
}: LoadingStateProps) {
 return (
  <StateBlock
   description={description ?? label}
   title={title}
   variant="loading"
   {...props}
  />
 )
}

export {
 EmptyState,
 ErrorState,
 LoadingState,
 StateBlock,
 stateBlockIconVariants,
 stateBlockTextVariants,
 stateBlockVariants,
 type EmptyStateProps,
 type ErrorStateProps,
 type LoadingStateProps,
 type StateBlockAlign,
 type StateBlockProps,
 type StateBlockSize,
 type StateBlockVariant,
}
