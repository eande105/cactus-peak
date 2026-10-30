"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import {
  type ComponentProps,
  cloneElement,
  type ReactElement,
  type ReactNode,
} from "react"
import { Checkbox, Select, Switch, Tooltip } from "@/components/graphical"
import { cn } from "@/lib/utils"

// Form controls on the Graphical runtime (gui/components/cactus-peak-athletic/*.md). The runtime owns fill, edge,
// radius, type and state paint, so callers pass layout classes only. Patterns follow web-app/components/kit/ui.tsx.

/** Checkbox with its visible label. `name`, `value` and `required` reach Base UI's hidden input for native forms. */
export function CheckRow({
  checked,
  onChange,
  children,
  disabled,
  id,
  name,
  value,
  required,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  disabled?: boolean
  id?: string
  name?: string
  value?: string
  required?: boolean
  className?: string
}) {
  return (
    // The 44 px minimum keeps the whole row a touch target (BUILD-NOTES accessibility).
    <Checkbox.Row className={cn("min-h-11", className)}>
      <Checkbox.Root
        id={id}
        name={name}
        value={value}
        required={required}
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
  name,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  disabled?: boolean
  name?: string
  className?: string
}) {
  return (
    <Switch.Row className={cn("min-h-11", className)}>
      <Switch.Root
        name={name}
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

export type SelectOption<V extends string> = {
  value: V
  label: string
  disabled?: boolean
}

type SelectControlProps<V extends string> = {
  value: V
  onChange: (value: V) => void
  options: SelectOption<V>[]
  name?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
  "aria-label"?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

// Trigger and menu shared by SelectControl and SelectBox. Built from the Graphical Select parts, not SelectField,
// because SelectField puts extra props on the root, where an id or describedby ids never reach the DOM.
function SelectParts<V extends string>({
  options,
  placeholder,
  className,
  ...trigger
}: Pick<
  SelectControlProps<V>,
  | "options"
  | "placeholder"
  | "className"
  | "id"
  | "aria-label"
  | "aria-invalid"
  | "aria-describedby"
>) {
  return (
    <>
      {/* The runtime sets min-height 0 inline. The 44 px touch target needs the important flag to win. */}
      <Select.Trigger {...trigger} className={cn("min-h-11!", className)}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          {/* Filter rows use content-sized triggers ("All clubs"). At the trigger's width the club names would wrap,
              so the trigger width is the minimum and the popup grows to its longest option, within the screen. */}
          <Select.Popup className="w-max max-w-(--available-width) min-w-(--anchor-width)">
            <Select.List>
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={o.value}
                  disabled={o.disabled}
                >
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </>
  )
}

/**
 * Select without a label of its own. Use it inside flow-ui `Field`, which passes `id` and the describedby ids, or
 * give it an `aria-label`. `name` and `required` reach Base UI's hidden input, so native forms submit the value.
 */
export function SelectControl<V extends string>({
  value,
  onChange,
  name,
  required,
  disabled,
  ...parts
}: SelectControlProps<V>) {
  return (
    <Select.Root<V>
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(v)
      }}
      items={parts.options}
      name={name}
      required={required}
      disabled={disabled}
    >
      <SelectParts {...parts} />
    </Select.Root>
  )
}

/** Select with its own label. `inline` puts the label beside the trigger, as the filter rows do. */
export function SelectBox<V extends string>({
  label,
  hideLabel,
  inline,
  className,
  triggerClassName,
  value,
  onChange,
  options,
  name,
  required,
  disabled,
  placeholder,
  id,
}: {
  label: string
  hideLabel?: boolean
  inline?: boolean
  className?: string
  triggerClassName?: string
} & Omit<
  SelectControlProps<V>,
  "className" | "aria-label" | "aria-invalid" | "aria-describedby"
>) {
  return (
    <div
      className={cn(
        "min-w-0",
        inline ? "inline-flex items-center gap-2" : "flex flex-col gap-1.5",
        className
      )}
    >
      <Select.Root<V>
        value={value}
        onValueChange={(v) => {
          if (v !== null) onChange(v)
        }}
        items={options}
        name={name}
        required={required}
        disabled={disabled}
      >
        <Select.Label className={cn(hideLabel && "sr-only")}>
          {label}
        </Select.Label>
        <SelectParts
          options={options}
          placeholder={placeholder}
          id={id}
          className={triggerClassName}
        />
      </Select.Root>
    </div>
  )
}

/** Multi-line text field. It copies the classes of components/ui/input.tsx so both fields look the same. */
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 rounded-md bg-card px-3 py-3 text-body leading-(--line-s) text-foreground edge ring-input transition-[box-shadow] placeholder:text-muted-foreground hover:ring-input-hover focus-visible:ring-accent disabled:pointer-events-none disabled:bg-muted disabled:text-disabled-foreground disabled:ring-border/20 aria-invalid:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

/**
 * Graphical Tooltip on an existing focusable control. The child keeps its own name, classes and handlers. The
 * themed trigger's class, style and part attributes are dropped: they style a tooltip button, and on a themed child
 * such as Toggle they would replace its own part variables.
 */
export function Tip({
  label,
  children,
}: {
  label: ReactNode
  children: ReactElement<Record<string, unknown>>
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={(props) => {
          const {
            className: _className,
            style: _style,
            "data-ui-part": _part,
            "data-ui-component": _component,
            ...rest
          } = props as Record<string, unknown>
          return cloneElement(children, mergeProps(rest, children.props))
        }}
      />
      <Tooltip.Portal>
        {/* The anchor offset is the tooltip popover gap (XS, 8 px) from tooltip.md. */}
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup>{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
