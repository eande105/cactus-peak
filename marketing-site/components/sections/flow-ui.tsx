"use client"

import { useId } from "react"
import { AlertCircle } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function Field({
  label,
  error,
  help,
  children,
  className,
}: {
  label: string
  error?: string
  help?: string
  children: (p: {
    id: string
    "aria-invalid": boolean
    "aria-describedby": string | undefined
  }) => React.ReactNode
  className?: string
}) {
  const id = useId()
  const d =
    [help ? `${id}-h` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") ||
    undefined
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-label">
        {label}
      </label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": d })}
      {help ? (
        <p id={`${id}-h`} className="text-caption text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-e`}
          className="flex items-start gap-1.5 text-caption font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
export function TextField({
  label,
  value,
  onChange,
  error,
  help,
  type = "text",
  autoComplete,
  inputMode,
  className,
  maxLength,
  onBlur,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  help?: string
  type?: string
  autoComplete?: string
  inputMode?: "numeric" | "tel" | "email" | "text"
  className?: string
  maxLength?: number
  onBlur?: () => void
}) {
  return (
    <Field label={label} error={error} help={help} className={className}>
      {(p) => (
        <Input
          {...p}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          className="bg-card"
        />
      )}
    </Field>
  )
}
export function ErrorSummary({ errors }: { errors: Record<string, string> }) {
  const list = Object.values(errors).filter(Boolean)
  if (!list.length) return null
  return (
    <div
      role="alert"
      tabIndex={-1}
      id="error-summary"
      className="rounded-lg bg-danger-subtle p-4 text-caption edge ring-destructive"
    >
      <p className="font-semibold">
        Fix {list.length === 1 ? "1 thing" : `${list.length} things`} to
        continue.
      </p>
      <ul className="mt-1 list-disc pl-5">
        {list.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  )
}
export function StepBar({
  step,
  total,
  label,
}: {
  step: number
  total: number
  label: string
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role=group on a non-form control group; fieldset adds default min-inline-size and a legend that would change the layout
    <div role="group" aria-label={`Step ${step} of ${total}: ${label}`}>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: step dots are a fixed-length list that never reorders
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full",
              i < step ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
      <p className="tabular mt-2 text-caption font-medium">
        Step {step} of {total}: {label}
      </p>
    </div>
  )
}

/**
 * A field that people never see and bots fill in. The server action drops a post that has a value here.
 * It is off-screen (not display: none, which some bots skip) and out of the tab order and the accessibility tree.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[10000px] h-px w-px overflow-hidden"
    >
      <label>
        Company
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  )
}
/** The honeypot value of a submitted form. */
export const honeypotOf = (form: HTMLFormElement) =>
  String(new FormData(form).get("company") ?? "")

/** Field errors from a server action, or its one general error. */
export function serverErrors(r: {
  error: string
  fields?: Record<string, string>
}): Record<string, string> {
  return r.fields && Object.keys(r.fields).length ? r.fields : { form: r.error }
}
export const focusErrors = () =>
  setTimeout(() => document.getElementById("error-summary")?.focus(), 0)
