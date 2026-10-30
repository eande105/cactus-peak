import { LinkButton } from "@/components/brand/atoms"
import { type ObjectId, ObjectRack } from "@/components/brand/graphics"

// The ascent steps up to the lit squat rack. The pool, courts and recovery objects fill the lists with
// the gym floor, so the way up runs through everything the clubs offer.
const climbIds: readonly ObjectId[] = [
  "water-bottle",
  "jump-rope",
  "kettlebell",
  "barbell",
  "dumbbell",
  "wave",
  "paddle",
  "spa-stones",
  "spin-bike",
  "mat",
  "towel",
  "sneaker",
]

function Climb({ ratio }: { ratio: string }) {
  return (
    <ObjectRack
      ratio={ratio}
      layout="ascent"
      scheme="night"
      ids={climbIds}
      focus="squat-rack"
      fill
    />
  )
}

// Three facts that answer "what is it, and what does it cost to start". Each one is on the page below
// (the club finder, the class index and the plans band).
const facts = [
  { title: "Five clubs", line: "Mesa and Gilbert" },
  { title: "28 classes", line: "In eight types" },
  { title: "Month to month", line: "$0 enrollment through Nov 30" },
]

/**
 * The Home hero is one inset Night panel that fills the first screen (references: the Superpower and
 * Function heroes on Mobbin). The headline, the line and two actions sit in the empty upper left. The
 * ascent rises beside them to the lit squat rack, and a row of three facts closes the panel.
 * The brand keeps its own rules: a Night field, objects instead of a photo, and one copper action
 * (VISUAL-IDENTITY.md, section 8).
 *
 * The section is the height of the first screen less the header and a 3rem strip, so the tinted
 * band below shows at the fold. The drawing is sliced to cover its box, so the ascent never stretches.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="h-[calc(100svh-4rem-3rem)] max-h-[60rem] min-h-[38rem] p-2 sm:p-3"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-night text-night-foreground lg:grid lg:grid-rows-[minmax(0,1fr)_auto]">
        {/* Below lg the ascent takes the space between the copy and the facts. From lg it fills the right of
            the first grid row: the lists start low beside the actions and the headline runs over its empty
            top. Decorative: the headline names the page. */}
        <div className="relative order-2 min-h-40 flex-1 lg:col-start-1 lg:row-start-1 lg:ml-[42%]">
          <div className="absolute inset-0 md:hidden">
            <Climb ratio="16/9" />
          </div>
          <div className="absolute inset-0 max-md:hidden lg:hidden">
            <Climb ratio="3/2" />
          </div>
          {/* From lg the box ratio follows the screen shape (about 1.1 at 4:3, 1.3 at 16:10, 1.5 at 16:9), so
              the ascent is composed for the nearest one and the slice crops little. */}
          <div className="absolute inset-0 hidden [@media(min-width:64rem)_and_(max-aspect-ratio:3/2)]:block">
            <Climb ratio="1/1" />
          </div>
          <div className="absolute inset-0 hidden [@media(min-width:64rem)_and_(min-aspect-ratio:3/2)_and_(max-aspect-ratio:17/10)]:block">
            <Climb ratio="5/4" />
          </div>
          <div className="absolute inset-0 hidden [@media(min-width:64rem)_and_(min-aspect-ratio:17/10)]:block">
            <Climb ratio="3/2" />
          </div>
        </div>

        <div className="relative z-10 order-1 px-6 pt-8 sm:px-10 sm:pt-12 lg:col-start-1 lg:row-start-1 lg:self-start lg:px-16 lg:pt-16">
          <h1 id="home-hero-title" className="display-hero max-w-[14ch]">
            Climb at your own pace.
          </h1>
          {/* The line and the actions keep to the left column, clear of the lists. */}
          <div className="lg:max-w-[42%]">
            <p className="lede mt-5 max-w-[34ch] text-pretty text-night-muted lg:mt-6">
              Pools, courts, classes and recovery at five clubs. Take the first
              step with a free tour. Move up when you are ready.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/tour" size="lg" className="max-sm:flex-1">
                Book a free tour
              </LinkButton>
              <LinkButton
                href="/trial"
                variant="ghost"
                size="lg"
                className="bg-night-foreground/10 text-night-foreground hover:bg-night-foreground/20 max-sm:flex-1"
              >
                Try a 3-day pass
              </LinkButton>
            </div>
          </div>
        </div>

        <ul className="relative order-3 grid grid-cols-3 border-t border-night-foreground/15 lg:row-start-2">
          {facts.map((f) => (
            <li
              key={f.title}
              className="px-4 py-4 not-first:border-l not-first:border-night-foreground/15 sm:px-10 sm:py-5 lg:px-16"
            >
              <p className="text-label font-semibold">{f.title}</p>
              <p className="text-caption text-night-muted max-sm:hidden">
                {f.line}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
