import type * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full min-w-0 rounded-md bg-card px-3 py-3 text-body text-foreground edge ring-input transition-[box-shadow] placeholder:text-muted-foreground hover:ring-input-hover focus-visible:ring-accent disabled:bg-muted disabled:text-disabled-foreground aria-invalid:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
