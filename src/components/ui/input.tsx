import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-control bg-surface px-4 py-2 text-base text-foreground transition-[background-color,border-color,box-shadow,color,transform] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground ring-2 ring-primary/30 focus:bg-primary-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-danger/40 aria-invalid:bg-danger/10 md:text-sm dark:ring-primary/40 dark:focus:bg-primary-soft",
        className
      )}
      {...props}
    />
  )
}

export { Input }
