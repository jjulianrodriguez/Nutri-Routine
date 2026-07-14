import * as React from "react"
import { Loader2 } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { Slot } from "radix-ui"

import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/utilities/composition"
import {
 primitiveLayoutClasses,
 primitiveMotionClasses,
 primitiveStateClasses,
} from "@/components/ui/utilities/shared-classes"

const buttonVariants = defineVariants(
 composeClasses(
  "group/button border-transparent bg-clip-padding text-sm font-bold outline-none select-none",
  primitiveLayoutClasses.control,
  primitiveLayoutClasses.iconChild,
  primitiveMotionClasses.standard,
  primitiveStateClasses.focusRing,
  "focus-visible:border-focus-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-disabled data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled data-[loading=true]:cursor-wait aria-invalid:border-status-danger aria-invalid:ring-3 aria-invalid:ring-status-danger/20 dark:aria-invalid:border-status-danger/50 dark:aria-invalid:ring-status-danger/35",
 ),
 {
  variants: {
   variant: {
    default:
     "border-action-primary/30 bg-action-primary !text-action-primary-text hover:border-action-primary/30 hover:bg-action-primary",
    outline:
     "border border-border-default bg-surface-default text-text-primary shadow-none hover:border-action-secondary/35 hover:bg-surface-interactive hover:text-text-primary aria-expanded:border-action-secondary/35 aria-expanded:bg-surface-interactive dark:border-border-default dark:bg-surface-default dark:hover:bg-surface-interactive",
    secondary:
     "border-action-secondary/15 bg-action-secondary-soft text-action-secondary-hover shadow-none hover:border-action-secondary/35 hover:bg-action-secondary-soft hover:text-action-secondary-hover aria-expanded:border-action-secondary/35 aria-expanded:bg-action-secondary-soft",
    ghost:
     "text-text-muted hover:bg-surface-interactive hover:text-text-primary aria-expanded:bg-surface-interactive aria-expanded:text-text-primary dark:hover:bg-surface-interactive",
    destructive:
     "border-status-danger/20 bg-status-danger-surface text-status-danger-text shadow-none hover:bg-status-danger-surface focus-visible:border-status-danger/40 focus-visible:ring-status-danger/20 dark:focus-visible:ring-status-danger/35",
    link: "rounded-sm text-action-primary underline-offset-4 hover:text-action-primary-hover hover:underline",
   },
   size: {
   default:
     "h-ds-11 gap-inline-sm px-ds-4 sm:h-ds-10 has-data-[icon=inline-end]:pr-ds-3 has-data-[icon=inline-start]:pl-ds-3",
    xs: "h-ds-8 gap-inline-xs rounded-[min(var(--ds-radius-md),10px)] px-ds-2 text-xs sm:h-ds-7 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-ds-1-5 has-data-[icon=inline-start]:pl-ds-1-5 [&_svg:not([class*='size-'])]:size-icon-xs",
    sm: "h-ds-10 gap-inline-xs rounded-[min(var(--ds-radius-md),12px)] px-ds-3 text-[0.8rem] sm:h-[calc(var(--ds-space-8)+var(--ds-space-1))] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-ds-2 has-data-[icon=inline-start]:pl-ds-2 [&_svg:not([class*='size-'])]:size-icon-sm",
    lg: "h-ds-12 gap-inline-md px-ds-5 has-data-[icon=inline-end]:pr-ds-4 has-data-[icon=inline-start]:pl-ds-4",
    icon: "size-ds-11 sm:size-ds-10",
    "icon-xs":
     "size-ds-8 rounded-[min(var(--ds-radius-md),10px)] sm:size-ds-7 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-icon-xs",
    "icon-sm":
     "size-ds-10 rounded-[min(var(--ds-radius-md),12px)] sm:size-[calc(var(--ds-space-8)+var(--ds-space-1))] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-icon-sm",
    "icon-lg": "size-ds-12 [&_svg:not([class*='size-'])]:size-icon-lg",
   },
  },
  defaultVariants: {
   variant: "default",
   size: "default",
  },
 },
)

type ButtonProps = React.ComponentProps<"button"> &
 VariantPropsOf<typeof buttonVariants> & {
  asChild?: boolean
  loading?: boolean
  loadingLabel?: React.ReactNode
 }

function Button({
 className,
 variant = "default",
 size = "default",
 asChild = false,
 loading = false,
 loadingLabel,
 disabled,
 children,
 "aria-busy": ariaBusy,
 "aria-disabled": ariaDisabled,
 ...props
}: ButtonProps) {
 const Comp = asChild ? Slot.Root : "button"
 const isDisabled = disabled || loading
 const buttonContent = (
  <>
   {loading ? (
    <Loader2
     data-slot="button-loading-icon"
     className="size-icon-md animate-spin"
     aria-hidden="true"
    />
   ) : null}
   {loading && loadingLabel ? loadingLabel : children}
  </>
 )

 return (
  <Comp
   data-slot="button"
   data-variant={variant}
   data-size={size}
   data-disabled={isDisabled ? "true" : undefined}
   data-loading={loading ? "true" : undefined}
   aria-busy={loading ? true : ariaBusy}
   aria-disabled={asChild && isDisabled ? true : ariaDisabled}
   className={composeClasses(buttonVariants({ variant, size, className }))}
   {...(!asChild ? { disabled: isDisabled } : {})}
   {...props}
  >
   {asChild ? children : buttonContent}
  </Comp>
 )
}

type ActionButtonProps = Omit<ButtonProps, "children"> & {
 children: React.ReactNode
 icon?: React.ReactNode
 iconPosition?: "end" | "start"
}

function ActionButton({
 children,
 icon,
 iconPosition = "end",
 loading = false,
 ...props
}: ActionButtonProps) {
 return (
  <Button loading={loading} {...props}>
   {!loading && icon && iconPosition === "start" ? (
    <span data-icon="inline-start" aria-hidden="true">
     {icon}
    </span>
   ) : null}
   {children}
   {!loading && icon && iconPosition === "end" ? (
    <span data-icon="inline-end" aria-hidden="true">
     {icon}
    </span>
   ) : null}
  </Button>
 )
}

type LinkButtonProps = Omit<
 React.AnchorHTMLAttributes<HTMLAnchorElement>,
 "href"
> &
 VariantPropsOf<typeof buttonVariants> &
 Pick<LinkProps, "href" | "locale" | "prefetch" | "replace" | "scroll" | "shallow"> & {
  disabled?: boolean
  external?: boolean
  loading?: boolean
  loadingLabel?: React.ReactNode
 }

function LinkButton({
 children,
 className,
 disabled = false,
 external = false,
 href,
 loading = false,
 loadingLabel,
 locale,
 onClick,
 prefetch,
 rel,
 replace,
 scroll,
 shallow,
 size = "default",
 target,
 variant = "default",
 ...props
}: LinkButtonProps) {
 const isDisabled = disabled || loading
 const safeRel =
  target === "_blank"
   ? Array.from(
    new Set(
     [rel, "noopener", "noreferrer"]
      .filter(Boolean)
      .flatMap((value) => String(value).split(/\s+/)),
    ),
   ).join(" ")
   : rel
 const content = (
  <>
   {loading ? (
    <Loader2
     data-slot="button-loading-icon"
     className="size-icon-md animate-spin"
     aria-hidden="true"
    />
   ) : null}
   {loading && loadingLabel ? loadingLabel : children}
  </>
 )

 function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
  if (isDisabled) {
   event.preventDefault()
   return
  }

  onClick?.(event)
 }

 if (external) {
  return (
   <Button
    asChild
    className={className}
    disabled={isDisabled}
    loading={loading}
    size={size}
    variant={variant}
   >
    <a
     href={isDisabled ? undefined : String(href)}
     rel={safeRel}
     target={target}
     onClick={handleClick}
     {...props}
    >
     {content}
    </a>
   </Button>
  )
 }

 return (
  <Button
   asChild
   className={className}
   disabled={isDisabled}
   loading={loading}
   size={size}
   variant={variant}
  >
   <Link
    href={href}
    locale={locale}
    prefetch={prefetch}
    replace={replace}
    scroll={scroll}
    shallow={shallow}
    rel={safeRel}
    target={target}
    onClick={handleClick}
    {...props}
   >
    {content}
   </Link>
  </Button>
 )
}

export {
 ActionButton,
 Button,
 LinkButton,
 buttonVariants,
 type ActionButtonProps,
 type ButtonProps,
 type LinkButtonProps,
}
