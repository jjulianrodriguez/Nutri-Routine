import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/utilities/composition"
import {
 primitiveMotionClasses,
 primitiveStateClasses,
} from "@/components/ui/utilities/shared-classes"

const switchControlVariants = defineVariants(
 composeClasses(
  "inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-surface-subtle p-0.5 outline-none",
  primitiveMotionClasses.standard,
  primitiveStateClasses.focusRing,
  "data-[state=checked]:bg-action-primary data-[state=unchecked]:hover:bg-surface-interactive disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-disabled data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled aria-invalid:ring-3 aria-invalid:ring-status-danger/20",
 ),
 {
  variants: {
   size: {
    sm: "h-ds-6 w-ds-10",
    default: "h-ds-7 w-ds-12",
    lg: "h-ds-8 w-ds-14",
   },
  },
  defaultVariants: {
   size: "default",
  },
 },
)

const checkboxControlVariants = defineVariants(
 composeClasses(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[min(var(--ds-radius-sm),6px)] border border-border-default bg-surface-default text-action-primary-text outline-none",
  primitiveMotionClasses.standard,
  primitiveStateClasses.focusRing,
  "data-[state=checked]:border-action-primary data-[state=checked]:bg-action-primary data-[state=indeterminate]:border-action-primary data-[state=indeterminate]:bg-action-primary data-[state=unchecked]:hover:bg-surface-interactive disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-disabled data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled aria-invalid:border-status-danger aria-invalid:ring-3 aria-invalid:ring-status-danger/20",
 ),
 {
  variants: {
   size: {
    sm: "size-ds-4",
    default: "size-ds-5",
    lg: "size-ds-6",
   },
  },
  defaultVariants: {
   size: "default",
  },
 },
)

const checkboxIndicatorVariants = defineVariants(
 "flex items-center justify-center text-current",
 {
  variants: {
   size: {
    sm: "size-icon-xs",
    default: "size-icon-sm",
    lg: "size-icon-md",
   },
  },
  defaultVariants: {
   size: "default",
  },
 },
)

const radioControlVariants = defineVariants(
 composeClasses(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface-default text-action-primary outline-none",
  primitiveMotionClasses.standard,
  primitiveStateClasses.focusRing,
  "data-[state=checked]:border-action-primary data-[state=checked]:bg-action-primary-soft data-[state=unchecked]:hover:bg-surface-interactive disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-disabled data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled aria-invalid:border-status-danger aria-invalid:ring-3 aria-invalid:ring-status-danger/20",
 ),
 {
  variants: {
   size: {
    sm: "size-ds-4",
    default: "size-ds-5",
    lg: "size-ds-6",
   },
  },
  defaultVariants: {
   size: "default",
  },
 },
)

const radioIndicatorVariants = defineVariants(
 "block rounded-full bg-current",
 {
  variants: {
   size: {
    sm: "size-1.5",
    default: "size-2",
    lg: "size-2.5",
   },
  },
  defaultVariants: {
   size: "default",
  },
 },
)

const radioGroupVariants = defineVariants("", {
 variants: {
  orientation: {
   horizontal: "flex flex-wrap items-center gap-x-4 gap-y-2",
   vertical: "grid gap-2",
  },
 },
 defaultVariants: {
  orientation: "vertical",
 },
})

const switchThumbVariants = defineVariants(
 composeClasses(
  "pointer-events-none block rounded-full bg-surface-default shadow-elevation-1 transition-transform duration-base ease-standard motion-reduce:transition-none",
 ),
 {
  variants: {
   size: {
    sm: "size-ds-5 data-[state=checked]:translate-x-ds-4",
    default: "size-ds-6 data-[state=checked]:translate-x-ds-5",
    lg: "size-ds-7 data-[state=checked]:translate-x-ds-6",
   },
  },
  defaultVariants: {
   size: "default",
  },
 },
)

type BooleanControlSize = NonNullable<
 VariantPropsOf<typeof switchControlVariants>["size"]
>

function getBooleanControlStateAttributes({
 disabled,
 invalid,
}: {
 disabled?: boolean
 invalid?: boolean
}) {
 return {
  "aria-invalid": invalid || undefined,
  "data-disabled": disabled ? true : undefined,
  "data-invalid": invalid ? true : undefined,
 }
}

export {
 checkboxControlVariants,
 checkboxIndicatorVariants,
 getBooleanControlStateAttributes,
 radioControlVariants,
 radioGroupVariants,
 radioIndicatorVariants,
 switchControlVariants,
 switchThumbVariants,
 type BooleanControlSize,
}
