import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Kit badge (Graphical has no badge): radius xs, caption type role, a 1px edge drawn as a shadow. Status badges add an icon and text; see StatusBadge.
// Status text stays in the foreground color: the status color on its own 20% tint is under 4.5:1 for success in light mode.
// The icon carries the status color.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-sm px-2 py-1 text-caption font-semibold whitespace-nowrap has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-foreground",
        outline: "bg-transparent text-foreground edge ring-input",
        success: "bg-success-subtle text-foreground [&>svg]:text-success",
        warning: "bg-warning-subtle text-foreground [&>svg]:text-warning",
        danger: "bg-danger-subtle text-foreground [&>svg]:text-destructive",
        accent: "bg-accent text-accent-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

function Badge({
  className,
  tone = "neutral",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ tone }), className) },
      props
    ),
    render,
    state: { slot: "badge", tone },
  })
}

export { Badge, badgeVariants }
