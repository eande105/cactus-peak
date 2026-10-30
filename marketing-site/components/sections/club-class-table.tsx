"use client"

import { useState } from "react"
import { ClassTable } from "@/components/brand/class-table"
import { useCatalog } from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { SelectBox } from "@/components/ui/controls"
import type { ClassType, ClubSlug } from "@/lib/types"

/** Class table with a club select. Defaults to the visitor's club; with none set, to Gilbert – Val Vista and says so. */
export function ClubClassTable({
  items,
  grouped = true,
}: {
  items: ClassType[]
  grouped?: boolean
}) {
  const { club: mine } = useMyClub()
  const { clubs } = useCatalog()
  const [pick, setPick] = useState<ClubSlug | "">("")
  const club = (pick || mine?.slug || "gilbert-val-vista") as ClubSlug
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SelectBox
          inline
          label="Next times at"
          value={club}
          onChange={setPick}
          options={clubs.map((c) => ({ value: c.slug, label: c.name }))}
        />
        {!mine && !pick ? (
          <span className="text-caption text-muted-foreground">
            (default: you have not picked a club)
          </span>
        ) : null}
      </div>
      <ClassTable items={items} grouped={grouped} club={club} />
    </div>
  )
}
