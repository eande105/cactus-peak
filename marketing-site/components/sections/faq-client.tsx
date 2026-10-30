"use client"

import { useEffect, useMemo, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { Search } from "@/components/icons"
import { useCatalog } from "@/components/site/catalog-context"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { useMedia } from "@/lib/use-media"

const groups = ["Getting started", "Memberships", "Kids and teens"] as const

export function FaqExplorer() {
  const { faqs } = useCatalog()
  const [group, setGroup] = useState<(typeof groups)[number]>("Getting started")
  const [q, setQ] = useState("")
  const [open, setOpen] = useState<string[]>(["card"])
  const wide = useMedia("(min-width: 1024px)")
  // Syncs from the URL hash, an external system, once after mount.
  useEffect(() => {
    const h = window.location.hash.slice(1)
    const f = faqs.find((x) => x.id === h)
    if (f) {
      setGroup(f.group as (typeof groups)[number])
      setOpen([f.id])
      setTimeout(() => document.getElementById(h)?.scrollIntoView(), 50)
    }
  }, [faqs])
  const list = useMemo(
    () =>
      q.trim()
        ? faqs.filter((f) =>
            `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase())
          )
        : faqs.filter((f) => f.group === group),
    [faqs, q, group]
  )
  return (
    <div>
      <div className="max-w-lg">
        <label htmlFor="faq-q" className="mb-1 block text-label">
          Search the questions
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="faq-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-card pl-9"
          />
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <h2 className="sr-only">Question groups</h2>
        {/* Single choice on a Graphical ToggleGroup: a row on phones, a vertical list from lg. While a search runs,
            no group is pressed. Pressing a group clears the search; pressing the current group again keeps it. */}
        <ToggleGroup
          aria-label="Question groups"
          orientation={wide ? "vertical" : "horizontal"}
          value={q ? [] : [group]}
          onValueChange={(v) => {
            if (!v[0]) return
            setQ("")
            setGroup(v[0] as (typeof groups)[number])
          }}
          className="max-w-full scrollbar-none overflow-x-auto lg:sticky lg:top-24 lg:col-span-4 lg:flex-col lg:items-stretch lg:self-start"
        >
          {groups.map((g) => (
            <Toggle
              key={g}
              value={g}
              className="min-h-12 justify-between gap-6 lg:w-full"
            >
              {g}
              <span className="tabular text-muted-foreground">
                {faqs.filter((f) => f.group === g).length}
              </span>
            </Toggle>
          ))}
        </ToggleGroup>
        <div className="lg:col-span-8" aria-live="polite">
          <h2 className="sr-only">{q ? "Search results" : group}</h2>
          {list.length ? (
            <Accordion
              value={open}
              onValueChange={(v) => {
                setOpen(v as string[])
                if (v.length) history.replaceState(null, "", `#${v[0]}`)
              }}
              className="border-t border-border"
            >
              {list.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={f.id}
                  id={f.id}
                  className="scroll-mt-24 border-b border-border shadow-none"
                >
                  <AccordionTrigger className="font-display-wide text-h3 hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="max-w-[62ch] pb-5 text-body text-muted-foreground">
                      {f.a}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div>
              <p className="text-body">No questions match &lsquo;{q}&rsquo;.</p>
              <LinkButton href="/contact" variant="outline" className="mt-3">
                Ask a person
              </LinkButton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
