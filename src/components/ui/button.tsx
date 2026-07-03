import * as React from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Slot } from "radix-ui"

import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/composition"
import {
 primitiveLayoutClasses,
 primitiveMotionClasses,
 primitiveStateClasses,
} from "@/components/ui/shared-classes"

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
     "h-ds-10 gap-inline-sm px-ds-4 has-data-[icon=inline-end]:pr-ds-3 has-data-[icon=inline-start]:pl-ds-3",
    xs: "h-ds-7 gap-inline-xs rounded-[min(var(--ds-radius-md),10px)] px-ds-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-ds-1-5 has-data-[icon=inline-start]:pl-ds-1-5 [&_svg:not([class*='size-'])]:size-icon-xs",
    sm: "h-[calc(var(--ds-space-8)+var(--ds-space-1))] gap-inline-xs rounded-[min(var(--ds-radius-md),12px)] px-ds-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-ds-2 has-data-[icon=inline-start]:pl-ds-2 [&_svg:not([class*='size-'])]:size-icon-sm",
    lg: "h-ds-12 gap-inline-md px-ds-5 has-data-[icon=inline-end]:pr-ds-4 has-data-[icon=inline-start]:pl-ds-4",
    icon: "size-ds-10",
    "icon-xs":
     "size-ds-7 rounded-[min(var(--ds-radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-icon-xs",
    "icon-sm":
     "size-[calc(var(--ds-space-8)+var(--ds-space-1))] rounded-[min(var(--ds-radius-md),12px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-icon-sm",
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

type IconButtonProps = Omit<ButtonProps, "children" | "size"> & {
 children: React.ReactNode
 label: string
 size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg"
}

function IconButton({
 children,
 className,
 label,
 size = "icon",
 title,
 ...props
}: IconButtonProps) {
 return (
  <Button
   aria-label={label}
   data-action="icon"
   size={size}
   title={title ?? label}
   className={composeClasses("min-h-touch-target min-w-touch-target", className)}
   {...props}
  >
   {children}
  </Button>
 )
}

type LinkButtonProps = Omit<ButtonProps, "asChild" | "type"> & {
 external?: boolean
 href: React.ComponentProps<typeof Link>["href"] | string
 prefetch?: React.ComponentProps<typeof Link>["prefetch"]
 replace?: React.ComponentProps<typeof Link>["replace"]
 scroll?: React.ComponentProps<typeof Link>["scroll"]
 target?: React.HTMLAttributeAnchorTarget
 rel?: string
}

function LinkButton({
 children,
 external = false,
 href,
 prefetch,
 rel,
 replace,
 scroll,
 target,
 ...props
}: LinkButtonProps) {
 return (
  <Button asChild {...props}>
   {external ? (
    <a
     href={String(href)}
     target={target ?? "_blank"}
     rel={rel ?? "noopener noreferrer"}
    >
     {children}
    </a>
   ) : (
    <Link
     href={href as React.ComponentProps<typeof Link>["href"]}
     prefetch={prefetch}
     replace={replace}
     scroll={scroll}
     target={target}
     rel={rel}
    >
     {children}
    </Link>
   )}
  </Button>
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

export {
 ActionButton,
 Button,
 IconButton,
 LinkButton,
 buttonVariants,
 type ActionButtonProps,
 type ButtonProps,
 type IconButtonProps,
 type LinkButtonProps,
}
