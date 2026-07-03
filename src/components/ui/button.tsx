import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
 "group/button inline-flex shrink-0 items-center justify-center rounded-control border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-[background-color,border-color,box-shadow,color,opacity,transform] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/35 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
 {
 variants: {
 variant: {
 default:
 "border-primary/30 bg-primary !text-white hover:border-primary/30 hover:bg-primary",
 outline:
 "border border-input bg-surface text-foreground shadow-none hover:border-secondary/35 hover:bg-surface-hover hover:text-foreground aria-expanded:border-secondary/35 aria-expanded:bg-surface-hover dark:border-input dark:bg-surface dark:hover:bg-surface-hover",
 secondary:
 "border-secondary/15 bg-secondary-soft text-secondary-hover shadow-none hover:border-secondary/35 hover:bg-secondary-soft hover:text-secondary-hover aria-expanded:border-secondary/35 aria-expanded:bg-secondary-soft",
 ghost:
 "text-muted hover:bg-surface-hover hover:text-foreground aria-expanded:bg-surface-hover aria-expanded:text-foreground dark:hover:bg-surface-hover",
 destructive:
 "border-danger/20 bg-destructive/10 text-destructive shadow-none hover:bg-destructive/16 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/18 dark:hover:bg-destructive/25 dark:focus-visible:ring-destructive/35",
 link: "rounded-sm text-primary underline-offset-4 hover:text-primary-hover hover:underline",
 },
 size: {
 default:
 "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
 xs: "h-7 gap-1.5 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
 sm: "h-9 gap-1.5 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
 lg: "h-12 gap-2.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
 icon: "size-10",
 "icon-xs":
 "size-7 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
 "icon-sm":
 "size-9 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
 "icon-lg": "size-12",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "default",
 },
 }
)

function Button({
 className,
 variant = "default",
 size = "default",
 asChild = false,
 ...props
}: React.ComponentProps<"button"> &
 VariantProps<typeof buttonVariants> & {
 asChild?: boolean
 }) {
 const Comp = asChild ? Slot.Root : "button"

 return (
 <Comp
 data-slot="button"
 data-variant={variant}
 data-size={size}
 className={cn(buttonVariants({ variant, size, className }))}
 {...props}
 />
 )
}

export { Button, buttonVariants }
