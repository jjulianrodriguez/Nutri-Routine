import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-control bg-black/5 px-4 py-2 text-base text-foreground shadow-none transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-danger/40 aria-invalid:bg-danger/10 md:text-sm dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:ring-primary/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
