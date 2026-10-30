"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Phone } from "@/components/icons"
import {
  Banner,
  EmptyState,
  PageHeader,
  SectionTitle,
} from "@/components/kit/ui"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ensureThread, sendMessage } from "@/lib/actions"
import { CLUBS, FAQ } from "@/lib/data/catalog"
import { toast } from "@/lib/toast"

export default function Help() {
  const { s, me } = useApp()
  const router = useRouter()
  const [q, setQ] = useState("")
  const [msg, setMsg] = useState("")
  const groups = FAQ.map((g) => ({
    ...g,
    items: g.items.filter(
      (i) => !q || (i.q + i.a).toLowerCase().includes(q.toLowerCase())
    ),
  })).filter((g) => g.items.length)
  void s
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Help"
        description="Answers, club phone numbers and the front desk."
      />
      <div className="max-w-xl">
        <label htmlFor="help-q" className="sr-only">
          Search help
        </label>
        <Input
          id="help-q"
          type="search"
          placeholder="Search help"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {groups.length ? (
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
          {groups.map((g) => (
            <section key={g.group} aria-labelledby={`h-${g.group}`}>
              <SectionTitle id={`h-${g.group}`}>{g.group}</SectionTitle>
              <Accordion className="mt-1">
                {g.items.map((i) => (
                  <AccordionItem key={i.q} value={i.q}>
                    <AccordionTrigger>{i.q}</AccordionTrigger>
                    <AccordionContent className="max-w-[60ch] text-muted-foreground">
                      {i.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No answers for "${q}".`}
          body="Message the front desk. We're staffed 6:00 a.m.–8:00 p.m."
          action={
            <Button
              onClick={() =>
                document.getElementById("contact")?.scrollIntoView()
              }
            >
              Message the front desk
            </Button>
          }
        />
      )}
      <section
        id="contact"
        aria-labelledby="ct"
        className="grid scroll-mt-24 gap-x-12 gap-y-6 pt-6 rule-t lg:grid-cols-2"
      >
        <div className="flex flex-col gap-3">
          <SectionTitle id="ct">Call a person</SectionTitle>
          <p className="text-caption text-muted-foreground">
            Member services{" "}
            <a className="text-link num underline" href="tel:4805550100">
              (480) 555-0100
            </a>
          </p>
          <ul className="rule-rows">
            {CLUBS.map((c) => (
              <li
                key={c.slug}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span>{c.name}</span>
                <a
                  href={`tel:${c.phone.replace(/\D/g, "")}`}
                  className="text-link inline-flex min-h-11 items-center gap-2 num underline"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {c.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <SectionTitle>Message the front desk</SectionTitle>
          <p className="text-caption text-muted-foreground">
            Staffed 6:00 a.m.–8:00 p.m. We answer within the hour.
          </p>
          <label htmlFor="fd" className="sr-only">
            Your message
          </label>
          <Textarea
            id="fd"
            rows={4}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="How can we help?"
          />
          <div className="flex gap-2">
            <Button
              disabled={!msg.trim()}
              onClick={() => {
                const id = ensureThread("Front desk", "Help")
                sendMessage(id, msg.trim())
                setMsg("")
                toast({
                  title: "Message sent",
                  description: "Find the reply in your inbox.",
                })
                router.push(`/inbox/${id}`)
              }}
            >
              Send message
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  title: "Report sent",
                  description: "Thanks. We'll look into it.",
                })
              }
            >
              Report a problem
            </Button>
          </div>
        </div>
      </section>
      <Banner
        tone="neutral"
        title={`Signed in as ${me.firstName} ${me.lastName}`}
      >
        Demo data resets from the account menu.
      </Banner>
    </div>
  )
}
