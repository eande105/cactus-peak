"use client"
import Link from "next/link"
import { type ReactNode, useId } from "react"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import {
  Avatar,
  Checkbox,
  Radio,
  RadioGroup,
  SelectField,
  Switch,
  Toggle,
  ToggleGroup,
} from "@/components/graphical"
import {
  ArrowLeft,
  CheckCircle2,
  type IconComponent,
  Info,
  OctagonAlert,
  TriangleAlert,
} from "@/components/icons"
import { CoachArt } from "@/components/kit/brand-art"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORIES, INSTRUCTOR_BY_ID } from "@/lib/data/catalog"
import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel,
  className,
  primaryFull,
}: {
  primaryFull?: boolean
  eyebrow?: ReactNode
  title: string
  description?: string
  actions?: ReactNode
  backHref?: string
  backLabel?: string
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="text-link inline-flex min-h-8 w-fit items-center gap-1 text-caption hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {backLabel ?? "Back"}
          </Link>
        ) : null}
        {eyebrow ? (
          <p className="eyebrow text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1
          id="page-title"
          tabIndex={-1}
          className="font-heading text-h2 display-stretch outline-none md:text-h1"
        >
          {title}
        </h1>
        {description ? (
          <p className="max-w-[70ch] text-body text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            primaryFull && "max-sm:[&>*:first-child]:w-full"
          )}
        >
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export function SectionTitle({
  children,
  action,
  id,
  className,
}: {
  children: ReactNode
  action?: ReactNode
  id?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <h2 id={id} className="font-heading text-h3 display-stretch">
        {children}
      </h2>
      {action}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  object,
  title,
  body,
  action,
  secondary,
  className,
  tone,
}: {
  icon?: IconComponent
  /** The gym object for what is missing, in a cut tile (VISUAL-IDENTITY.md). Wins over `icon`. */
  object?: ObjectId
  title: string
  body?: ReactNode
  action?: ReactNode
  secondary?: ReactNode
  className?: string
  tone?: "default" | "error"
}) {
  return (
    <div
      className={cn(
        "flex max-w-[560px] flex-col items-start gap-3 py-6",
        className
      )}
    >
      {object ? (
        <GymObject id={object} cut className="size-24" />
      ) : Icon ? (
        <Icon
          className={cn(
            "size-7",
            tone === "error" ? "text-warning" : "text-muted-foreground"
          )}
          aria-hidden="true"
        />
      ) : null}
      <h2 className="font-heading text-h3 display-stretch">{title}</h2>
      {body ? <p className="text-body text-muted-foreground">{body}</p> : null}
      {action || secondary ? (
        <div className="mt-1 flex flex-wrap items-center gap-3">
          {action}
          {secondary}
        </div>
      ) : null}
    </div>
  )
}

export function ErrorState({
  what,
  onRetry,
}: {
  what: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex max-w-[560px] flex-col items-start gap-3 py-4"
    >
      <TriangleAlert className="size-6 text-warning" aria-hidden="true" />
      <h2 className="font-heading text-h3">We couldn&apos;t load {what}.</h2>
      <p className="text-muted-foreground">
        Your bookings are safe. Try again.
      </p>
      <div className="flex flex-wrap gap-2">
        {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
        <Button variant="outline" render={<Link href="/inbox" />}>
          Message the front desk
        </Button>
      </div>
      <p className="text-detail text-muted-foreground">Error code: NETWORK</p>
    </div>
  )
}

type Tone = "neutral" | "success" | "warning" | "danger" | "accent" | "outline"
export function StatusPill({
  tone = "neutral",
  icon: Icon,
  children,
  className,
}: {
  tone?: Tone
  icon?: IconComponent
  children: ReactNode
  className?: string
}) {
  return (
    <Badge tone={tone} className={cn("rounded-full", className)}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </Badge>
  )
}

export function Banner({
  tone = "info",
  icon,
  title,
  children,
  actions,
  className,
  role,
}: {
  tone?: "info" | "warning" | "danger" | "success" | "neutral"
  icon?: IconComponent
  title?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  className?: string
  role?: "status" | "alert"
}) {
  const Icon =
    icon ??
    (tone === "danger"
      ? OctagonAlert
      : tone === "warning"
        ? TriangleAlert
        : tone === "success"
          ? CheckCircle2
          : Info)
  const bg =
    tone === "danger"
      ? "bg-danger-subtle"
      : tone === "warning"
        ? "bg-warning-subtle"
        : tone === "success"
          ? "bg-success-subtle"
          : "bg-muted"
  const ic =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : "text-muted-foreground"
  return (
    <div
      role={role ?? (tone === "danger" ? "alert" : "status")}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md px-3 py-2 md:px-4 md:py-3",
        bg,
        className
      )}
    >
      <Icon className={cn("size-5 shrink-0", ic)} aria-hidden="true" />
      <div className="min-w-0 flex-1 basis-48 text-caption max-md:[&>:not(:first-child)]:hidden">
        {title ? <p className="text-label">{title}</p> : null}
        {children ? <p>{children}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export function StatRow({
  cells,
  className,
}: {
  cells: { label: string; value: ReactNode; hint?: ReactNode; big?: boolean }[]
  className?: string
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))] [&>div]:border-border lg:[&>div+div]:border-l max-lg:[&>div:nth-child(even)]:border-l max-lg:[&>div:nth-child(n+3)]:border-t",
        className
      )}
      style={{ "--cols": cells.length } as React.CSSProperties}
    >
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex min-w-0 flex-col gap-1 px-4 py-3 first:pl-0 max-lg:odd:pl-0 lg:first:pl-0"
        >
          <dt className="eyebrow text-muted-foreground">{c.label}</dt>
          <dd
            className={cn(
              "num",
              c.big ? "text-h2 leading-tight" : "text-body-strong"
            )}
          >
            {c.value}
          </dd>
          {c.hint ? (
            <dd className="text-detail text-muted-foreground">{c.hint}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  )
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: { value: T; label: ReactNode; sr?: string; disabled?: boolean }[]
  value: T
  onChange: (v: T) => void
  label: string
  size?: "sm" | "md"
  className?: string
}) {
  // The theme owns the control height now. `size` stays in the API so call sites keep working.
  void size
  return (
    <ToggleGroup
      aria-label={label}
      value={[String(value)]}
      onValueChange={(next) => {
        // Single choice: a press on the selected item would empty the group, so ignore it.
        const o = options.find((x) => String(x.value) === next[0])
        if (o && o.value !== value) onChange(o.value)
      }}
      className={cn("inline-flex max-w-full overflow-x-auto", className)}
    >
      {options.map((o) => (
        <Toggle
          key={String(o.value)}
          value={String(o.value)}
          aria-label={o.sr}
          disabled={o.disabled}
          // The selected fill (design review S8) comes from the shared pressed-toggle rule in app/globals.css.
          className="max-md:min-h-11"
        >
          {o.label}
        </Toggle>
      ))}
    </ToggleGroup>
  )
}

export function SelectBox<V extends string>({
  label,
  value,
  onChange,
  options,
  className,
  hideLabel,
}: {
  label: string
  value: V
  onChange: (v: V) => void
  options: { value: V; label: string; disabled?: boolean }[]
  className?: string
  hideLabel?: boolean
}) {
  return (
    <div
      className={cn(
        "min-w-0 max-md:[&_.themed-select]:!min-h-11",
        hideLabel && "[&_.field-label]:sr-only",
        className
      )}
    >
      <SelectField<V>
        label={label}
        value={value}
        onValueChange={(v) => onChange(v as V)}
        options={options}
      />
    </div>
  )
}

export function CheckRow({
  checked,
  onChange,
  children,
  disabled,
  id,
  className,
}: {
  checked: boolean
  onChange: (c: boolean) => void
  children: ReactNode
  disabled?: boolean
  id?: string
  className?: string
}) {
  return (
    <Checkbox.Row className={className}>
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(!!c)}
        disabled={disabled}
      />
      <Checkbox.Label>{children}</Checkbox.Label>
    </Checkbox.Row>
  )
}
export function SwitchRow({
  checked,
  onChange,
  children,
  disabled,
}: {
  checked: boolean
  onChange: (c: boolean) => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <Switch.Row>
      <Switch.Root
        checked={checked}
        onCheckedChange={(c) => onChange(!!c)}
        disabled={disabled}
      >
        <Switch.Thumb />
      </Switch.Root>
      <Switch.Label>{children}</Switch.Label>
    </Switch.Row>
  )
}

export function FormField({
  label,
  help,
  error,
  children,
  className,
}: {
  label: string
  help?: string
  error?: string
  children: (p: {
    id: string
    "aria-describedby"?: string
    "aria-invalid"?: boolean
  }) => ReactNode
  className?: string
}) {
  const id = useId()
  const desc =
    [help ? `${id}-h` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") ||
    undefined
  // Same type and color roles as the Graphical Field label, description and error parts. Those parts are not used
  // because Field.Label links only to a Field.Control, and callers pass their own controls with this id.
  return (
    <div className={cn("flex flex-col gap-(--space-xs)", className)}>
      <label htmlFor={id} className="text-label text-foreground">
        {label}
      </label>
      {children({
        id,
        "aria-describedby": desc,
        "aria-invalid": error ? true : undefined,
      })}
      {help ? (
        <p id={`${id}-h`} className="text-caption text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-e`} role="alert" className="text-detail text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const CAT_IDS = CATEGORIES.map((c) => c.id)
export function PersonAvatar({
  name,
  hue = 0,
  size,
  className,
}: {
  name: string
  hue?: number
  size?: number
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <Avatar.Root
      aria-hidden="true"
      // The category tint tells family members apart, so it replaces the theme fill. Shape and type come from Avatar.
      className={cn(
        `cat-${CAT_IDS[Math.abs(hue) % CAT_IDS.length]}`,
        "bg-cat-tint",
        className
      )}
      // A set size also scales the initials. Without one, the theme sets both.
      style={size ? { width: size, height: size } : undefined}
    >
      <Avatar.Fallback
        className="text-cat-text"
        style={size ? { fontSize: Math.max(11, size * 0.38) } : undefined}
      >
        {initials}
      </Avatar.Fallback>
    </Avatar.Root>
  )
}
export function InstructorChip({
  id,
  size = "md",
  stacked,
}: {
  id: string
  size?: "sm" | "md" | "lg"
  stacked?: boolean
}) {
  const i = INSTRUCTOR_BY_ID[id]
  if (!i) return null
  const px = size === "lg" ? 56 : size === "md" ? 28 : 24
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2",
        stacked && "flex-col items-start"
      )}
    >
      <CoachArt name={i.name} roles={[i.role]} size={px} />
      <span className="min-w-0 truncate text-caption">{i.name}</span>
    </span>
  )
}

export function LateCancelMeter({
  count,
  max = 3,
  clears,
}: {
  count: number
  max?: number
  clears?: number
}) {
  void clears
  return (
    // biome-ignore lint/a11y/useSemanticElements: a native meter draws its own bar and would change the look
    <span
      role="meter"
      aria-label="Late cancels in the last 30 days"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={count}
      aria-valuetext={`${count} of ${max}`}
      className="inline-flex gap-1"
    >
      {Array.from({ length: max }).map((_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholders with no data identity that never reorder
          key={i}
          className={cn(
            "rounded-xs h-3 w-6",
            i < count
              ? count >= max
                ? "bg-destructive"
                : "bg-warning"
              : "edge ring-input"
          )}
        />
      ))}
    </span>
  )
}

export function LoadingBlock({
  text,
  rows = 4,
}: {
  text: string
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <p role="status" className="text-caption text-muted-foreground">
        {text}
      </p>
      {Array.from({ length: rows }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholders with no data identity that never reorder
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-xs bg-muted px-1.5 py-0.5 font-sans text-detail font-semibold text-muted-foreground">
      {children}
    </kbd>
  )
}

export function RadioList<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: {
    value: T
    label: ReactNode
    help?: ReactNode
    disabled?: boolean
  }[]
  className?: string
}) {
  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className={className}
    >
      {options.map((o) => (
        <RadioGroup.Row key={o.value}>
          <Radio.Root value={o.value} disabled={o.disabled}>
            <Radio.Indicator />
          </Radio.Root>
          <RadioGroup.Label>
            {o.label}
            {o.help ? (
              <span className="block text-caption font-normal text-muted-foreground">
                {o.help}
              </span>
            ) : null}
          </RadioGroup.Label>
        </RadioGroup.Row>
      ))}
    </RadioGroup>
  )
}
