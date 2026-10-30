"use client"

import Link from "next/link"
import * as React from "react"

import { TextLink } from "@/components/brand/atoms"
import {
  type CategoryId,
  CategoryTile,
  categoryObject,
  ObjectRack,
} from "@/components/brand/graphics"
import { useCatalog } from "@/components/site/catalog-context"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { ClassType } from "@/lib/types"

/** Home "Eight ways to move." body: a carousel of featured classes next to the eight class types. */
export function HomeClasses({ className }: { className?: string }) {
  return (
    <div
      className={`grid gap-12 lg:grid-cols-12 lg:gap-x-12 ${className ?? ""}`}
    >
      <FeaturedCarousel className="min-w-0 lg:col-span-5" />
      <CategoryGrid className="lg:col-span-7" />
    </div>
  )
}

function FeaturedCarousel({ className }: { className?: string }) {
  const { popularNow, classBySlug } = useCatalog()
  // The "popular now" classes plus Switchback HIIT, so conditioning is also in the set.
  const featured = [...new Set([...popularNow, "switchback-hiit"])]
    .map(classBySlug)
    .filter((c): c is ClassType => Boolean(c))
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  // Subscribe to Embla events. State changes only inside the handler, never in the effect body.
  React.useEffect(() => {
    if (!api) return
    const sync = () => setCurrent(api.selectedScrollSnap())
    api.on("select", sync)
    api.on("reInit", sync)
    return () => {
      api.off("select", sync)
      api.off("reInit", sync)
    }
  }, [api])

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start" }}
      aria-label="Featured classes"
      className={`max-w-2xl lg:max-w-none ${className ?? ""}`}
    >
      <CarouselContent className="-ml-4">
        {featured.map((c, i) => (
          <CarouselItem
            key={c.slug}
            aria-label={`${i + 1} of ${featured.length}`}
            className="basis-[88%] pl-4 sm:basis-full"
          >
            <ObjectRack
              ratio="4/3"
              layout="arc"
              focus={categoryObject[c.category as CategoryId]}
              seed={i + 1}
              className="rounded-lg"
            />
            <h3 className="font-display-wide mt-6 text-h2">{c.name}</h3>
            <p className="mt-2 max-w-[40ch] text-body text-pretty">{c.blurb}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6">
              <TextLink href={`/classes/${c.slug}`}>Class details</TextLink>
              <span className="text-body text-muted-foreground">
                {c.duration} min
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex items-center gap-3">
        <CarouselPrevious className="static inset-auto m-0 translate-x-0 translate-y-0" />
        <CarouselNext className="static inset-auto m-0 translate-x-0 translate-y-0" />
        <p
          aria-live="polite"
          aria-atomic="true"
          className="ml-2 text-body text-muted-foreground tabular-nums"
        >
          {current + 1} of {featured.length}
        </p>
      </div>
    </Carousel>
  )
}

/** The eight categories as a list: the name leads, the category Tile labels it (VISUAL-IDENTITY.md, section 6). */
function CategoryGrid({ className }: { className?: string }) {
  const { categories } = useCatalog()
  return (
    <ul
      className={`grid content-start border-t border-border sm:grid-cols-2 sm:gap-x-8 ${className ?? ""}`}
    >
      {categories.map((c) => (
        <li key={c.id} className="border-b border-border">
          <Link
            href={`/classes/category/${c.id}`}
            className="group flex min-h-16 items-center gap-4 py-3 no-underline"
          >
            <CategoryTile
              category={c.id as CategoryId}
              className="size-10 shrink-0"
            />
            <span className="font-display-wide min-w-0 flex-1 text-h3 group-hover:underline">
              {c.name}
            </span>
            <span className="text-body text-muted-foreground tabular-nums">
              {c.count} classes
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
