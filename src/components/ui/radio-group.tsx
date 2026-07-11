"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import {
 getBooleanControlStateAttributes,
 radioControlVariants,
 radioIndicatorVariants,
 type BooleanControlSize,
} from "@/components/ui/boolean-control"
import { composeClasses } from "@/components/ui/composition"

type RadioGroupProps = React.ComponentPropsWithoutRef<
 typeof RadioGroupPrimitive.Root
> & {
 invalid?: boolean
}

type RadioGroupItemProps = React.ComponentPropsWithoutRef<
 typeof RadioGroupPrimitive.Item
> & {
 invalid?: boolean
 size?: BooleanControlSize
}

const RadioGroup = React.forwardRef<
 React.ElementRef<typeof RadioGroupPrimitive.Root>,
 RadioGroupProps
>(({ className, disabled, invalid = false, ...props }, ref) => {
 return (
  <RadioGroupPrimitive.Root
   ref={ref}
   data-slot="radio-group"
   disabled={disabled}
   className={composeClasses("grid gap-stack-sm", className)}
   {...getBooleanControlStateAttributes({ disabled, invalid })}
   {...props}
  />
 )
})

RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
 React.ElementRef<typeof RadioGroupPrimitive.Item>,
 RadioGroupItemProps
>(
 (
  {
   className,
   disabled,
   invalid = false,
   size = "default",
   children,
   ...props
  },
  ref,
 ) => {
  return (
   <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio"
    data-size={size}
    disabled={disabled}
    className={composeClasses(radioControlVariants({ size }), className)}
    {...getBooleanControlStateAttributes({ disabled, invalid })}
    {...props}
   >
    {children ?? (
     <RadioGroupPrimitive.Indicator data-slot="radio-indicator">
      <span
       aria-hidden="true"
       className={radioIndicatorVariants({ size })}
      />
     </RadioGroupPrimitive.Indicator>
    )}
   </RadioGroupPrimitive.Item>
  )
 },
)

RadioGroupItem.displayName = "RadioGroupItem"

export {
 RadioGroup,
 RadioGroupItem,
 type RadioGroupItemProps,
 type RadioGroupProps,
}
