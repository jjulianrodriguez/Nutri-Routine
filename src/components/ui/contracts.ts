import type * as React from "react"

type PrimitiveVariant =
 | "default"
 | "destructive"
 | "ghost"
 | "link"
 | "outline"
 | "secondary"

type PrimitiveSize =
 | "default"
 | "icon"
 | "icon-lg"
 | "icon-sm"
 | "icon-xs"
 | "lg"
 | "sm"
 | "xs"

type PrimitiveTone =
 | "danger"
 | "default"
 | "notice"
 | "success"
 | "warning"

type PrimitiveDataAttributes = {
 "data-disabled"?: boolean | "true"
 "data-invalid"?: boolean | "true"
 "data-loading"?: boolean | "true"
 "data-selected"?: boolean | "true"
}

type PrimitiveStateProps = {
 disabled?: boolean
 invalid?: boolean
 loading?: boolean
 selected?: boolean
}

type AsChildProp = {
 asChild?: boolean
}

type ClassNameProp = {
 className?: string
}

type PrimitiveComponentProps<TElement extends React.ElementType> =
 React.ComponentPropsWithoutRef<TElement> & ClassNameProp

function getPrimitiveStateAttributes({
 disabled,
 invalid,
 loading,
 selected,
}: PrimitiveStateProps): PrimitiveDataAttributes & {
 "aria-busy"?: true
 "aria-disabled"?: true
 "aria-invalid"?: true
} {
 return {
  "aria-busy": loading || undefined,
  "aria-disabled": disabled || undefined,
  "aria-invalid": invalid || undefined,
  "data-disabled": disabled ? "true" : undefined,
  "data-invalid": invalid ? "true" : undefined,
  "data-loading": loading ? "true" : undefined,
  "data-selected": selected ? "true" : undefined,
 }
}

export {
 getPrimitiveStateAttributes,
 type AsChildProp,
 type ClassNameProp,
 type PrimitiveComponentProps,
 type PrimitiveDataAttributes,
 type PrimitiveSize,
 type PrimitiveStateProps,
 type PrimitiveTone,
 type PrimitiveVariant,
}
