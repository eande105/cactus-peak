import { newId } from "@/lib/advance"
import { PT_PACKS } from "@/lib/data/catalog"
import { householdOf, ptCreditsLeft } from "@/lib/engine"
import { mutate } from "@/lib/store"

// Buys a training pack with no coach picked yet. Returns the amount charged.
export function buyPack(sessions: number): number {
  return mutate((d, now) => {
    const pack = PT_PACKS.find((p) => p.sessions === sessions)
    if (!pack) return 0
    const hh = householdOf(d, d.currentMemberId)
    const carry = hh.ptPack ? ptCreditsLeft(hh) : 0
    hh.ptPack = {
      total: pack.sessions + carry,
      used: 0,
      expiresOn: now + 365 * 86400000,
      coachSlug: hh.ptPack?.coachSlug,
    }
    hh.invoices.unshift({
      id: newId("INV"),
      date: now,
      desc: `Training pack, ${pack.sessions} sessions`,
      kind: "training",
      amount: pack.price,
      status: "paid",
      lines: [
        {
          label: `Training pack, ${pack.sessions} sessions`,
          amount: pack.price,
        },
      ],
    })
    return pack.price
  })
}
