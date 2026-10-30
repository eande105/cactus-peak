import Link from "next/link"
import { ObjectRack } from "@/components/brand/graphics"

const rows = [
  [
    "Pools",
    "Lap lanes, warm water and a splash pad.",
    "Dobson, Red Mountain, Val Vista",
    "/aquatics",
  ],
  [
    "Courts",
    "Pickleball, tennis and hoops.",
    "Dobson, Red Mountain, Val Vista",
    "/courts",
  ],
  [
    "Recovery",
    "Sauna, cold plunge and compression.",
    "Dobson, Val Vista, Downtown, Heritage",
    "/recovery",
  ],
  [
    "Kids club",
    "Trusted care while you train.",
    "Dobson, Red Mountain, Val Vista",
    "/kids",
  ],
  ["Studios", "Yoga, HIIT, strength and cycling.", "All 5 clubs", "/classes"],
  [
    "Strength floor",
    "Racks, platforms and a spotter's hand.",
    "All 5 clubs",
    "/classes/category/strength",
  ],
]
/** What each club has, as a table that names the clubs. One picture, not six. */
export function AmenityTable() {
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="hidden lg:col-span-4 lg:block">
        <ObjectRack
          ratio="3/4"
          layout="fade"
          focus="pool"
          className="rounded-lg"
        />
      </div>
      <table className="w-full text-left lg:col-span-8">
        <caption className="sr-only">What each club has</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Amenity</th>
            <th scope="col">What it is</th>
            <th scope="col">Where</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([n, d, w, h]) => (
            <tr
              key={n}
              className="border-t border-border first:border-t-2 first:border-foreground"
            >
              <th
                scope="row"
                className="font-display-wide py-4 pr-4 align-top text-h3"
              >
                <Link href={h} className="hover:underline">
                  {n}
                </Link>
              </th>
              <td className="hidden py-4 pr-4 align-top text-body sm:table-cell">
                {d}
              </td>
              <td className="py-4 align-top text-caption text-muted-foreground">
                <span className="block text-body text-foreground sm:hidden">
                  {d}
                </span>
                {w}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export const AmenityBento = AmenityTable
