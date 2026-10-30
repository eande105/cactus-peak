import { Input as InputPrimitive } from "@base-ui/react/input"
import type * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-md bg-card px-3 py-3 text-body leading-(--line-s) text-foreground edge ring-input transition-[box-shadow] placeholder:text-muted-foreground hover:ring-input-hover focus-visible:ring-accent disabled:pointer-events-none disabled:bg-muted disabled:text-disabled-foreground disabled:ring-border/20 aria-invalid:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
