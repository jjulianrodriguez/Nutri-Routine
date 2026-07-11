import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/composition"
import {
 primitiveMotionClasses,
 primitiveStateClasses,
} from "@/components/ui/shared-classes"

const booleanControlBaseClasses = composeClasses(
 "shrink-0 border border-border-default bg-surface-default text-action-primary-text outline-none",
 primitiveMotionClasses.standard,
 primitiveStateClasses.focusRing,
 "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-disabled data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled aria-invalid:border-status-danger aria-invalid:ring-3 aria-invalid:ring-status-danger/20",
)

const booleanSelectionClasses =
 "data-[state=checked]:border-action-primary data-[state=checked]:bg-action-primary data-[state=checked]:text-action-primary-text"

const checkboxControlVariants = defineVariants(
 composeClasses(
  booleanControlBaseClasses,
  booleanSelectionClasses,
  "grid place-items-center rounded-[min(var(--ds-radius-sm),7px)] shadow-none",
 ),
 {
  variants: {
   size: {
    sm: "size-ds-4 [&_svg]:size-icon-xs",
    default: "size-ds-5 [&_svg]:size-icon-sm",
    lg: "size-ds-6 rounded-[min(var(--ds-radius-md),9px)] [&_svg]:size-icon-md",
   },
  },
  defaultVariants: {
   size: "default",
  },
 },
)

const radioControlVariants = defineVariants(
 composeClasses(
  booleanControlBaseClasses,
  booleanSelectionClasses,
  "grid place-items-center rounded-full shadow-none",
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

const radioIndicatorVariants = defineVariants("rounded-full bg-current", {
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
})

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
 VariantPropsOf<typeof checkboxControlVariants>["size"]
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
 getBooleanControlStateAttributes,
 radioControlVariants,
 radioIndicatorVariants,
 switchControlVariants,
 switchThumbVariants,
 type BooleanControlSize,
}
