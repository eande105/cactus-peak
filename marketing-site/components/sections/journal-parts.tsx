"use client"

import Link from "next/link"
import { useState } from "react"
import { InstructorChip } from "@/components/brand/class-parts"
import { JournalArt } from "@/components/brand/journal-art"
import { useCatalog } from "@/components/site/catalog-context"
import type { JournalEntry } from "@/lib/types"
import { EmptyState } from "./common"
import { Tabs2 } from "./small-client"

type Post = JournalEntry
export function JournalCard({ p, feature }: { p: Post; feature?: boolean }) {
  const a = useCatalog().coachBySlug(p.author)
  return (
    <article
      className={
        feature
          ? "relative grid gap-6 lg:grid-cols-12 lg:items-center"
          : "relative flex flex-col gap-3"
      }
    >
      <div className={feature ? "lg:col-span-7" : ""}>
        <JournalArt
          slug={p.slug}
          ratio={feature ? "16/9" : "3/2"}
          className="overflow-hidden rounded-lg"
        />
      </div>
      <div className={feature ? "lg:col-span-5" : ""}>
        <h2
          className={
            feature ? "font-display-wide text-h2" : "font-display-wide text-h3"
          }
        >
          <Link
            href={`/journal/${p.slug}`}
            className="after:absolute after:inset-0 hover:underline"
          >
            {p.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-caption text-muted-foreground">
          {p.dek}
        </p>
        <p className="mt-3 flex items-center gap-3 text-caption text-muted-foreground">
          {a ? <InstructorChip name={a.name} slug={a.slug} size={24} /> : null}
          <span className="tabular">
            {p.cat} · {p.date} · {p.min} min read
          </span>
        </p>
      </div>
    </article>
  )
}
export function JournalIndex() {
  const { journal, journalCats, coachBySlug } = useCatalog()
  const [cat, setCat] = useState("All")
  const list = journal.filter((p) => cat === "All" || p.cat === cat)
  const [first, ...rest] = list
  return (
    <div>
      <Tabs2
        label="Journal categories"
        items={journalCats.map((c) => ({ id: c, label: c }))}
        value={cat}
        onChange={setCat}
      />
      <div className="mt-8" aria-live="polite">
        {first ? (
          <>
            <JournalCard p={first} feature />
            {rest.length ? (
              <ul className="mt-12 border-t-2 border-foreground">
                {rest.map((p) => (
                  <li
                    key={p.slug}
                    className="relative grid gap-x-8 gap-y-1 border-b border-border py-6 md:grid-cols-[170px_minmax(0,1fr)]"
                  >
                    <p className="tabular text-caption text-muted-foreground">
                      {p.date} · {p.cat}
                    </p>
                    <div>
                      <h2 className="font-display-wide text-h2">
                        <Link
                          href={`/journal/${p.slug}`}
                          className="after:absolute after:inset-0 hover:underline"
                        >
                          {p.title}
                        </Link>
                      </h2>
                      <p className="mt-1 max-w-[62ch] text-body text-muted-foreground">
                        {p.dek}
                      </p>
                      <p className="mt-2 text-caption text-muted-foreground">
                        {coachBySlug(p.author)?.name ?? "Cactus Peak"} · {p.min}{" "}
                        min read
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Nothing here yet."
            text="Read the latest instead."
          />
        )}
      </div>
    </div>
  )
}
