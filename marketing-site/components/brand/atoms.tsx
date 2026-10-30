import type { VariantProps } from "class-variance-authority"
import Link from "next/link"
import { Check, type IconComponent, Minus } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import type { CategoryId } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CategoryIcon, catColor, catText, catTint } from "./icons"

/** A link that looks like a Graphical button. */
export function LinkButton({
  href,
  variant,
  size,
  className,
  children,
  external,
  ...rest
}: {
  href: string
  external?: boolean
  className?: string
  children: React.ReactNode
} & VariantProps<typeof buttonVariants> &
  Omit<React.ComponentProps<"a">, "href" | "children" | "className">) {
  const cls = cn(buttonVariants({ variant, size }), className)
  if (
    external ||
    href.startsWith("tel:") ||
    href.startsWith("mailto:") ||
    href.startsWith("http")
  )
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener" } : {})}
        {...rest}
      >
        {children}
      </a>
    )
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  )
}
export { Button }

/** Inline text link with an arrow. */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    // The label carries the underline, so it stops before the arrow. The base rule for main links is switched off here.
    <Link
      href={href}
      className={cn(
        "group/link inline-flex min-h-11 items-center gap-1.5 text-label text-link no-underline",
        className
      )}
    >
      <span className="underline [text-decoration-color:color-mix(in_oklab,currentColor_40%,transparent)] decoration-from-font underline-offset-4 group-hover/link:[text-decoration-color:currentColor]">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none"
      >
        →
      </span>
    </Link>
  )
}

export function CategoryBadge({
  id,
  name,
  variant = "tint",
  iconOnly,
  className,
}: {
  id: CategoryId
  /** The category name from the catalog. */
  name: string
  variant?: "tint" | "solid"
  iconOnly?: boolean
  className?: string
}) {
  const solid = variant === "solid"
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-1 text-caption font-semibold whitespace-nowrap",
        className
      )}
      style={
        solid
          ? { background: catColor(id), color: "var(--night-foreground)" }
          : { background: catTint(id), color: catText(id) }
      }
    >
      <CategoryIcon id={id} className="size-3.5" />
      {iconOnly ? <span className="sr-only">{name}</span> : name}
    </span>
  )
}

export function AmenityChip({
  icon: Icon,
  children,
  className,
  tone = "default",
}: {
  icon?: IconComponent
  children: React.ReactNode
  className?: string
  tone?: "default" | "muted"
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 w-fit items-center gap-1.5 rounded-sm px-2 text-caption font-medium whitespace-nowrap text-foreground",
        tone === "default" ? "bg-card edge ring-border" : "bg-muted",
        className
      )}
    >
      {Icon ? (
        <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  )
}

export function YesNo({
  yes,
  yesText = "Yes",
  noText = "No",
  cell = false,
}: {
  yes: boolean
  yesText?: string
  noText?: string
  cell?: boolean
}) {
  if (cell)
    return yes ? (
      <span>
        <span
          aria-hidden="true"
          className="inline-block size-2 rounded-full bg-foreground"
        />
        <span className="sr-only">{yesText}</span>
      </span>
    ) : (
      <span className="sr-only">{noText}</span>
    )
  return yes ? (
    <span className="inline-flex items-center gap-1.5 text-caption font-medium text-foreground">
      <Check className="size-4 text-success" aria-hidden="true" />
      {yesText}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
      <Minus className="size-4" aria-hidden="true" />
      {noText}
    </span>
  )
}

// The heading is the section's only label (REDESIGN.md goal 1). A lede is one line that adds a fact, never a restatement.
export function SectionHead({
  title,
  lede,
  action,
  className,
  as: H = "h2",
  size = "normal",
}: {
  title: string
  lede?: string
  action?: React.ReactNode
  className?: string
  as?: "h1" | "h2"
  size?: "lead" | "normal" | "quiet"
}) {
  const cls =
    size === "lead"
      ? "display-lead"
      : size === "quiet"
        ? "display-quiet"
        : "font-display-wide text-h2 lg:text-h1"
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-3",
        className
      )}
    >
      <div className="min-w-0 flex-1 basis-[28rem]">
        <H className={cn("max-w-[24ch] text-balance", cls)}>{title}</H>
        {lede ? (
          <p className="mt-4 max-w-[48ch] text-lead text-pretty text-muted-foreground">
            {lede}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cn("h-px border-0 bg-border", className)} />
}
