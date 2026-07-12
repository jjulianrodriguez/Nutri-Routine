"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import {
 getBooleanControlStateAttributes,
 radioControlVariants,
 radioGroupVariants,
 radioIndicatorVariants,
 type BooleanControlSize,
} from "@/components/ui/forms/boolean-control"
import { composeClasses } from "@/components/ui/utilities/composition"

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
>(
 (
  {
   className,
   disabled,
   invalid = false,
   orientation = "vertical",
   ...props
  },
  ref,
 ) => {
  return (
   <RadioGroupPrimitive.Root
    ref={ref}
    data-slot="radio-group"
    data-orientation={orientation}
    disabled={disabled}
    orientation={orientation}
    className={composeClasses(
     radioGroupVariants({ orientation }),
     className,
    )}
    {...getBooleanControlStateAttributes({ disabled, invalid })}
    {...props}
   />
  )
 },
)

const RadioGroupItem = React.forwardRef<
 React.ElementRef<typeof RadioGroupPrimitive.Item>,
 RadioGroupItemProps
>(
 (
  {
   children,
   className,
   disabled,
   invalid = false,
   size = "default",
   ...props
  },
  ref,
 ) => {
  return (
   <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio-group-item"
    data-size={size}
    disabled={disabled}
    className={composeClasses(radioControlVariants({ size }), className)}
    {...getBooleanControlStateAttributes({ disabled, invalid })}
    {...props}
   >
    <RadioGroupPrimitive.Indicator
     data-slot="radio-group-indicator"
     className="flex items-center justify-center"
    >
     {children ?? <span className={radioIndicatorVariants({ size })} />}
    </RadioGroupPrimitive.Indicator>
   </RadioGroupPrimitive.Item>
  )
 },
)

RadioGroup.displayName = "RadioGroup"
RadioGroupItem.displayName = "RadioGroupItem"

export {
 RadioGroup,
 RadioGroupItem,
 type RadioGroupItemProps,
 type RadioGroupProps,
}
