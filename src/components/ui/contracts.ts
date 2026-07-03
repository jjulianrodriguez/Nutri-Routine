import type * as React from "react"

export const primitiveVariants = [
 "default",
 "secondary",
 "outline",
 "ghost",
 "destructive",
 "link",
] as const

export const primitiveSizes = [
 "xs",
 "sm",
 "default",
 "lg",
 "icon",
 "icon-xs",
 "icon-sm",
 "icon-lg",
] as const

export const primitiveTones = [
 "default",
 "muted",
 "primary",
 "secondary",
 "success",
 "warning",
 "danger",
 "notice",
] as const

export const primitiveStates = [
 "idle",
 "hover",
 "focus",
 "active",
 "disabled",
 "loading",
 "invalid",
 "selected",
 "expanded",
] as const

export type PrimitiveVariant = (typeof primitiveVariants)[number]
export type PrimitiveSize = (typeof primitiveSizes)[number]
export type PrimitiveTone = (typeof primitiveTones)[number]
export type PrimitiveState = (typeof primitiveStates)[number]

export type ClassNameProp = {
 className?: string
}

export type AsChildProp = {
 asChild?: boolean
}

export type PrimitiveStateProps = {
 disabled?: boolean
 invalid?: boolean
 loading?: boolean
 selected?: boolean
 expanded?: boolean
}

export type PrimitiveComponentProps<
 TElement extends React.ElementType,
 TOwnProps extends object = object,
> = TOwnProps &
 Omit<React.ComponentPropsWithoutRef<TElement>, keyof TOwnProps>

export type PrimitiveDataAttributes = {
 "data-slot"?: string
 "data-variant"?: string
 "data-size"?: string
 "data-tone"?: string
 "data-state"?: string
}

export function getPrimitiveStateAttributes({
 disabled,
 expanded,
 invalid,
 loading,
 selected,
}: PrimitiveStateProps): {
 "aria-busy"?: true
 "aria-disabled"?: true
 "aria-expanded"?: boolean
 "aria-invalid"?: true
 "aria-selected"?: true
 "data-disabled"?: true
 "data-invalid"?: true
 "data-loading"?: true
 "data-selected"?: true
} {
 return {
  "aria-busy": loading || undefined,
  "aria-disabled": disabled || undefined,
  "aria-expanded": expanded,
  "aria-invalid": invalid || undefined,
  "aria-selected": selected || undefined,
  "data-disabled": disabled || undefined,
  "data-invalid": invalid || undefined,
  "data-loading": loading || undefined,
  "data-selected": selected || undefined,
 }
}

