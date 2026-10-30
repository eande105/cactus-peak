"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { StepUp } from "@/components/app/step-up"
import { useApp } from "@/components/app/use-app"
import { Check, Download, Loader2, TriangleAlert } from "@/components/icons"
import {
  LoadingBlock,
  PageHeader,
  SectionTitle,
  SelectBox,
  StatusPill,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { makeDefaultCard, retryPayment, setBillingField } from "@/lib/actions"
import { announce } from "@/lib/announce"
import {
  guestPassesLeft,
  householdMonthly,
  nextBillingDate,
  paymentDaysLate,
  ptCreditsLeft,
} from "@/lib/engine"
import { fmtDateFull, fmtDayShort, fmtMoney } from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Invoice } from "@/lib/types"
import { openDialog } from "@/lib/ui-state"

export const statusPill = (st: Invoice["status"]) =>
  st === "paid" ? (
    <StatusPill tone="success" icon={Check}>
      Paid
    </StatusPill>
  ) : st === "failed" ? (
    <StatusPill tone="danger" icon={TriangleAlert}>
      Failed
    </StatusPill>
  ) : st === "refunded" ? (
    <StatusPill tone="neutral">Refunded</StatusPill>
  ) : (
    <StatusPill tone="neutral">Open</StatusPill>
  )
export const download = (i: Invoice) => {
  const blob = new Blob(
    [`Cactus Peak Athletic\nInvoice ${i.id}\n${i.desc}\n${fmtMoney(i.amount)}`],
    { type: "text/plain" }
  )
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `invoice-${i.id}.txt`
  a.click()
}

function Editable({
  label,
  value,
  field,
}: {
  label: string
  value: string
  field: "billingName" | "billingAddress" | "receiptEmail"
}) {
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(value)
  const [saved, setSaved] = useState(false)
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-detail text-muted-foreground">{label}</p>
        {edit ? (
          <Input
            aria-label={label}
            value={v}
            onChange={(e) => setV(e.target.value)}
            onBlur={() => {
              setBillingField(field, v)
              setEdit(false)
              setSaved(true)
              setTimeout(() => setSaved(false), 3000)
            }}
            autoFocus
          />
        ) : (
          <p className="text-body">
            {value}
            {saved ? (
              <span role="status" className="ml-2 text-detail text-success">
                Saved
              </span>
            ) : null}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEdit(true)}
        aria-label={`Edit ${label}`}
      >
        Edit
      </Button>
    </div>
  )
}

export default function BillingPage() {
  const { s, me, hh, now } = useApp()
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [retrying, setRetrying] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  if (me.role !== "primary") return null
  if (loading) return <LoadingBlock text="Loading your billing…" rows={4} />
  const money = householdMonthly(s, hh)
  const late = paymentDaysLate(s, me.id, now)
  const exp = hh.card.expYear * 100 + hh.card.expMonth
  const cur =
    (new Date(now - 7 * 3600_000).getUTCFullYear() % 100) * 100 +
    new Date(now - 7 * 3600_000).getUTCMonth() +
    1
  const months =
    (hh.card.expYear - (cur - (cur % 100)) / 100) * 12 +
    hh.card.expMonth -
    (cur % 100)
  void exp
  const expiring = months <= 2 && months >= 0
  const inv = hh.invoices
    .filter(
      (i) =>
        filter === "all" ||
        (filter === "membership"
          ? i.kind === "membership"
          : filter === "training"
            ? i.kind === "training"
            : filter === "guest"
              ? i.kind === "guest"
              : i.kind === "fee")
    )
    .sort((a, b) => b.date - a.date)
  const pages = Math.max(1, Math.ceil(inv.length / 10))
  const rows = inv.slice((page - 1) * 10, page * 10)
  const brand = hh.card.brand[0].toUpperCase() + hh.card.brand.slice(1)
  const { left } = guestPassesLeft(s, hh.id, now)
  return (
    <div className="flex flex-col gap-8">
      <StepUp />
      <PageHeader title="Billing" />
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section aria-labelledby="nc" className="flex flex-col gap-3">
          <p id="nc" className="eyebrow text-muted-foreground">
            Next charge
          </p>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <p className="num-l text-display leading-none">
              {fmtMoney(money.total)}
            </p>
            <p className="num text-body">
              {fmtDateFull(nextBillingDate(hh, now))}
            </p>
          </div>
          <ul className="max-w-md num text-body rule-rows">
            <li className="flex justify-between py-2">
              <span>{hh.plan[0].toUpperCase() + hh.plan.slice(1)}</span>
              <span>{fmtMoney(money.base)}</span>
            </li>
            {money.adults ? (
              <li className="flex justify-between py-2">
                <span>Adult add-on</span>
                <span>{fmtMoney(money.adultTotal)}</span>
              </li>
            ) : null}
            {money.kids ? (
              <li className="flex justify-between py-2">
                <span>Child add-ons, {money.kids} × $19.00</span>
                <span>{fmtMoney(money.kidTotal)}</span>
              </li>
            ) : null}
          </ul>
          <p className="text-caption text-muted-foreground">
            Annual facility fee $49 is charged in March.
          </p>
        </section>
        <section
          aria-labelledby="pm"
          className="flex flex-col gap-3 lg:border-l lg:border-border lg:pl-12"
        >
          <p id="pm" className="eyebrow text-muted-foreground">
            Payment method
          </p>
          <p className="flex flex-wrap items-center gap-2 text-body-strong">
            <span className="rounded-xs font-bold border border-input px-1.5 text-detail uppercase">
              {hh.card.brand}
            </span>
            {brand} ending {hh.card.last4}
            <StatusPill>Default</StatusPill>
          </p>
          {late >= 0 ? (
            <p
              role="status"
              className={
                late >= 6
                  ? "text-caption font-semibold text-destructive"
                  : "text-caption font-semibold text-warning"
              }
            >
              Card declined {fmtDayShort(hh.paymentFailedAt ?? now)}.{" "}
              {late >= 8
                ? "New bookings are paused."
                : `${Math.max(0, 7 - late)} days of full access left.`}{" "}
              <button
                type="button"
                className="underline"
                onClick={async () => {
                  setRetrying(true)
                  await new Promise((r) => setTimeout(r, 800))
                  const r = retryPayment()
                  setRetrying(false)
                  if (r.ok) announce("Paid. Your membership is active.")
                }}
              >
                {retrying ? "Trying…" : "Try again"}
              </button>
            </p>
          ) : null}
          <p className="num text-caption text-muted-foreground">
            Expires {String(hh.card.expMonth).padStart(2, "0")}/
            {hh.card.expYear}{" "}
            {expiring ? (
              <StatusPill tone="warning" icon={TriangleAlert} className="ml-2">
                Expires next month
              </StatusPill>
            ) : null}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={late >= 0 ? "primary" : "outline"}
              onClick={() => openDialog("card")}
            >
              Update payment method
            </Button>
            {hh.backupCard ? (
              <Button
                variant="ghost"
                onClick={() => {
                  makeDefaultCard()
                  toast({
                    title: `${hh.backupCard!.brand} ending ${hh.backupCard!.last4} is now the default`,
                  })
                }}
              >
                Make {hh.backupCard.brand} ending {hh.backupCard.last4} default
                again
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => openDialog("card")}>
                Add a backup card
              </Button>
            )}
          </div>
          {hh.backupCard ? (
            <p className="text-caption text-muted-foreground">
              Backup: {hh.backupCard.brand} ending {hh.backupCard.last4}. Kept
              for 30 days.
            </p>
          ) : null}
        </section>
      </div>
      <div className="grid gap-x-12 gap-y-6 lg:grid-cols-2">
        <section aria-labelledby="bd">
          <SectionTitle id="bd">Billing details</SectionTitle>
          <div className="mt-1 rule-rows">
            <Editable label="Name" value={hh.billingName} field="billingName" />
            <Editable
              label="Billing address"
              value={hh.billingAddress}
              field="billingAddress"
            />
            <Editable
              label="Receipt email"
              value={hh.receiptEmail}
              field="receiptEmail"
            />
          </div>
        </section>
        <section aria-labelledby="cr">
          <SectionTitle id="cr">Credits and packs</SectionTitle>
          <ul className="mt-1 text-body rule-rows">
            <li className="flex justify-between py-3">
              <span>Training sessions left</span>
              <span className="num">{ptCreditsLeft(hh)}</span>
            </li>
            <li className="flex justify-between py-3">
              <span>Guest passes left this cycle</span>
              <span className="num">{left}</span>
            </li>
            <li className="flex justify-between py-3">
              <span>Guest passes bought</span>
              <span className="num">{hh.guestPassesBought}</span>
            </li>
          </ul>
        </section>
      </div>
      <section aria-labelledby="iv">
        <SectionTitle
          id="iv"
          action={
            <SelectBox
              label="Show"
              hideLabel
              value={filter}
              onChange={(v) => {
                setFilter(v)
                setPage(1)
              }}
              options={[
                { value: "all", label: "All" },
                { value: "membership", label: "Membership" },
                { value: "training", label: "Training" },
                { value: "guest", label: "Guest passes" },
                { value: "fee", label: "Fees" },
              ]}
            />
          }
        >
          Invoices
        </SectionTitle>
        {rows.length ? (
          <>
            <div className="mt-2 hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="text-left">
                      Date
                    </TableHead>
                    <TableHead scope="col" className="text-left">
                      Description
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Amount
                    </TableHead>
                    <TableHead scope="col" className="text-left">
                      Status
                    </TableHead>
                    <TableHead scope="col">
                      <span className="sr-only">Download</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="py-3 num">
                        <Link
                          href={`/billing/invoices/${i.id}`}
                          className="hover:underline"
                        >
                          {fmtDayShort(i.date)}
                        </Link>
                      </TableCell>
                      <TableCell>{i.desc}</TableCell>
                      <TableCell className="text-right num">
                        {fmtMoney(i.amount)}
                      </TableCell>
                      <TableCell>{statusPill(i.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Download invoice for ${fmtDayShort(i.date)} (PDF)`}
                          onClick={() => download(i)}
                        >
                          <Download aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="mt-2 rule-rows md:hidden">
              {rows.map((i) => (
                <li
                  key={i.id}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <Link href={`/billing/invoices/${i.id}`} className="min-w-0">
                    <span className="flex justify-between gap-4">
                      <span className="num text-label">
                        {fmtDayShort(i.date)}
                      </span>
                      <span className="num text-label">
                        {fmtMoney(i.amount)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-caption text-muted-foreground">
                      {i.desc}
                    </span>
                    <span className="mt-1 block">{statusPill(i.status)}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Download invoice for ${fmtDayShort(i.date)} (PDF)`}
                    onClick={() => download(i)}
                  >
                    <Download aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            {pages > 1 ? (
              <nav
                aria-label="Invoice pages"
                className="mt-3 flex items-center gap-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="num text-caption">
                  Page {page} of {pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </nav>
            ) : null}
          </>
        ) : (
          <p className="mt-3 text-muted-foreground">
            Your invoices will show here after your first charge.
          </p>
        )}
        <p className="mt-3 text-detail text-muted-foreground">
          Need a receipt for your employer? Download the PDF on any row.
        </p>
      </section>
      <span className="sr-only">
        <Loader2 />
      </span>
    </div>
  )
}
