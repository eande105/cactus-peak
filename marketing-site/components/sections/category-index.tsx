import Link from "next/link"
import { CategoryTile } from "@/components/brand/graphics"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

/** The eight class types as a name and one line each. Intensity and example classes live on the category pages (REDESIGN.md goal 4). */
export function CategoryIndex({
  categories,
  className,
}: {
  categories: Category[]
  className?: string
}) {
  return (
    <ul
      className={cn(
        "grid border-t border-border sm:grid-cols-2 sm:gap-x-12",
        className
      )}
    >
      {categories.map((c) => (
        <li key={c.id} className="border-b border-border">
          <Link
            href={`/classes/category/${c.id}`}
            className="group flex items-center gap-5 py-5 sm:py-6"
          >
            <CategoryTile category={c.id} cut className="size-16 shrink-0" />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-display-wide text-h2 group-hover:underline">
                {c.name}
              </span>
              <span className="text-body text-muted-foreground">
                {c.tagline}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
