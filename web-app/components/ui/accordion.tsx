"use client"

import { ChevronRightIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Accordion as GraphicalAccordion } from "@/components/graphical"

// Accordion on the Graphical Accordion (gui/components/cactus-peak-athletic/accordion.md). The runtime owns the
// trigger, panel and content parts, the item divider, the grid-row panel motion and the right chevron that turns
// 90 degrees when open. The exports keep the shadcn names that the screens already use.
function Accordion(props: ComponentProps<typeof GraphicalAccordion.Root>) {
  return <GraphicalAccordion.Root data-slot="accordion" {...props} />
}

function AccordionItem(props: ComponentProps<typeof GraphicalAccordion.Item>) {
  return <GraphicalAccordion.Item data-slot="accordion-item" {...props} />
}

function AccordionTrigger({
  children,
  ...props
}: ComponentProps<typeof GraphicalAccordion.Trigger>) {
  return (
    <GraphicalAccordion.Header>
      <GraphicalAccordion.Trigger data-slot="accordion-trigger" {...props}>
        {children}
        <GraphicalAccordion.Indicator>
          <ChevronRightIcon aria-hidden="true" />
        </GraphicalAccordion.Indicator>
      </GraphicalAccordion.Trigger>
    </GraphicalAccordion.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof GraphicalAccordion.Panel>) {
  return (
    <GraphicalAccordion.Panel data-slot="accordion-content" {...props}>
      <GraphicalAccordion.Content className={className as string | undefined}>
        {children}
      </GraphicalAccordion.Content>
    </GraphicalAccordion.Panel>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
