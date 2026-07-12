import { cva as defineVariants } from "class-variance-authority"
import type { ClassValue } from "clsx"

import { cn } from "@/lib/utils"

export { defineVariants }
export type { VariantProps as VariantPropsOf } from "class-variance-authority"
export type { ClassValue }

export function composeClasses(...inputs: ClassValue[]) {
 return cn(...inputs)
}
