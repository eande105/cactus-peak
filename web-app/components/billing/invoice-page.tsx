"use client"
import { notFound } from "next/navigation"
import { useApp } from "@/components/app/use-app"
import { download, statusPill } from "@/components/billing/billing-page"
import { Download } from "@/components/icons"
import { PageHeader } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { fmtDateFull, fmtMoney } from "@/lib/time"

export default function InvoicePage({ id }: { id: string }) {
  const { me, hh } = useApp()
  const inv = hh.invoices.find((i) => i.id === id)
  if (me.role !== "primary") return null
  if (!inv) notFound()
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <PageHeader
        backHref="/billing"
        backLabel="Billing"
        eyebrow={inv.id}
        title={fmtDateFull(inv.date)}
        description={inv.desc}
        actions={
          <Button variant="outline" onClick={() => download(inv)}>
            <Download aria-hidden="true" data-icon="inline-start" />
            Download PDF
          </Button>
        }
      />
      <p>{statusPill(inv.status)}</p>
      <dl className="num text-body rule-rows">
        {inv.lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-4 py-3">
            <dt>{l.label}</dt>
            <dd>{fmtMoney(l.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-3 text-body-strong">
          <dt>Total</dt>
          <dd>{fmtMoney(inv.amount)}</dd>
        </div>
      </dl>
      <p className="text-caption text-muted-foreground">
        Paid with {hh.card.brand} ending {hh.card.last4}. Billed to{" "}
        {hh.billingName}, {hh.billingAddress}.
      </p>
    </div>
  )
}
