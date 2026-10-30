import type { Metadata } from "next"
import {
  BrandGraphic,
  brandGraphicIds,
  type CategoryId,
  CategoryTile,
  ClassGraphic,
  type ClubId,
  ClubSet,
  CoachMark,
  categoryObject,
  classGraphicIds,
  clubObjects,
  coachMarkIds,
  GymObject,
  ObjectCrop,
  type ObjectId,
  ObjectRack,
  ObjectRow,
  objectIds,
  objects,
  type RackLayout,
  SpaceArt,
  SpaceGraphic,
  spaceArtIds,
  spaceGraphicIds,
} from "@/components/brand/graphics"

export const metadata: Metadata = {
  title: "Graphics",
  robots: { index: false, follow: false },
}

// Internal preview of components/brand/graphics: one card per graphic, no site chrome.
function Section({
  title,
  children,
  cols,
}: {
  title: string
  children: React.ReactNode
  cols: string
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-body-strong">{title}</h2>
      <div className={`mt-3 grid gap-4 ${cols}`}>{children}</div>
    </section>
  )
}
function Card({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <figure>
      <div className="overflow-hidden rounded-md">{children}</div>
      <figcaption className="font-mono mt-1.5 text-caption text-muted-foreground">
        {id}
      </figcaption>
    </figure>
  )
}

const clubNames: Record<ClubId, string> = {
  "mesa-dobson": "Mesa – Dobson",
  "mesa-red-mountain": "Mesa – Red Mountain",
  "mesa-downtown": "Mesa – Downtown",
  "gilbert-val-vista": "Gilbert – Val Vista",
  "gilbert-heritage": "Gilbert – Heritage",
}

const sectionCards: {
  layout: RackLayout
  scheme: "night" | "sand" | "copper"
  ratio: string
  span: string
  title: string
  line: string
  ids?: readonly ObjectId[]
  focus?: ObjectId
  overlay?: boolean
}[] = [
  {
    layout: "cluster",
    scheme: "night",
    ratio: "4/3",
    span: "lg:col-span-3",
    title: "Five clubs. One membership.",
    line: "Pools, courts, classes and recovery across Mesa and Gilbert.",
    focus: "kettlebell",
  },
  {
    layout: "orbit",
    scheme: "copper",
    ratio: "4/3",
    span: "lg:col-span-3",
    title: "Mesa – Dobson",
    line: "Two pools, courts and a full recovery suite.",
    ids: [
      "paddle",
      "spa-stones",
      "wave",
      "towel",
      "tennis-ball",
      "cone",
      "water-bottle",
      "mat",
    ],
    focus: "pool",
  },
  {
    layout: "arc",
    scheme: "sand",
    ratio: "16/10",
    span: "lg:col-span-2",
    title: "Eight ways to move.",
    line: "Strength, cycle, aqua, court and more.",
    focus: "spin-bike",
  },
  {
    layout: "hub",
    scheme: "sand",
    ratio: "16/10",
    span: "lg:col-span-2",
    title: "Summit adds recovery.",
    line: "Recovery suite, towel service and a PT intro.",
    ids: [
      "towel",
      "whistle",
      "mat",
      "resistance-band",
      "water-bottle",
      "wave",
      "shaker",
      "key",
    ],
    focus: "spa-stones",
  },
  {
    layout: "climb",
    scheme: "copper",
    ratio: "16/10",
    span: "lg:col-span-2",
    title: "Climb at your own pace.",
    line: "Start at Trailhead. Move up when you are ready.",
    ids: ["water-bottle", "jump-rope", "kettlebell", "plate", "barbell"],
    focus: "squat-rack",
  },
  {
    layout: "spotlight",
    scheme: "night",
    ratio: "21/9",
    span: "lg:col-span-6",
    title: "Book a bike in two taps.",
    line: "Pick a class, pick a bike, done.",
    focus: "spin-bike",
  },
  {
    layout: "stagger",
    scheme: "sand",
    ratio: "16/9",
    span: "lg:col-span-3",
    title: "Every club in one app.",
    line: "Schedules, bookings and your pass.",
  },
  {
    layout: "frame",
    scheme: "night",
    ratio: "16/9",
    span: "lg:col-span-3",
    title: "Come see one. It is free.",
    line: "Book a tour at any club.",
    focus: "gym-bag",
    overlay: true,
  },
  {
    layout: "ascent",
    scheme: "night",
    ratio: "21/9",
    span: "lg:col-span-6",
    title: "Climb at your own pace.",
    line: "Start where you are. Everything the clubs offer is on the way up.",
    ids: [
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
    ],
    focus: "squat-rack",
  },
]

export default function GraphicsPreview() {
  return (
    <main className="mx-auto max-w-[1400px] p-6">
      <Section
        title="Gym objects"
        cols="grid-cols-3 sm:grid-cols-6 lg:grid-cols-11"
      >
        {objectIds.map((id) => (
          <figure key={id}>
            <GymObject id={id} />
            <figcaption className="mt-1.5 text-caption">
              {objects[id].label}
            </figcaption>
          </figure>
        ))}
      </Section>
      <Section title="Rack" cols="lg:grid-cols-[2fr_1fr_1fr]">
        <Card id="wall, night, 16/9">
          <ObjectRack ratio="16/9" />
        </Card>
        <Card id="fade, sand, 4/5, Val Vista focus">
          <ObjectRack
            ratio="4/5"
            scheme="sand"
            layout="fade"
            focus="pool"
            seed={4}
          />
        </Card>
        <Card id="fade, copper, 4/5">
          <ObjectRack
            ratio="4/5"
            scheme="copper"
            layout="fade"
            focus="kettlebell"
            seed={9}
          />
        </Card>
        <Card id="wall, sand, 21/9">
          <ObjectRack ratio="21/9" scheme="sand" seed={6} rows={2.4} />
        </Card>
      </Section>
      <section className="mt-10">
        <h2 className="text-body-strong">Section cards</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {sectionCards.map((c) => (
            <article
              key={c.layout}
              className={`overflow-hidden rounded-lg border bg-card ${c.span}`}
            >
              <div className="relative" style={{ aspectRatio: c.ratio }}>
                <ObjectRack
                  ratio={c.ratio}
                  layout={c.layout}
                  scheme={c.scheme}
                  ids={c.ids}
                  focus={c.focus}
                  fill
                />
                {c.overlay ? (
                  <p
                    className={`font-display-wide absolute inset-0 grid place-items-center px-[30%] text-center text-h3 ${c.scheme === "sand" ? "" : "text-night-foreground"}`}
                  >
                    {c.title}
                  </p>
                ) : null}
              </div>
              <div className="p-4">
                <h3 className="font-display-wide text-h3">{c.title}</h3>
                <p className="mt-1 text-body text-muted-foreground">{c.line}</p>
                <p className="font-mono mt-2 text-caption text-muted-foreground">
                  {c.layout}, {c.scheme}, {c.ratio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Section title="Club sets" cols="sm:grid-cols-2 lg:grid-cols-5">
        {(Object.keys(clubObjects) as ClubId[]).map((club) => (
          <figure key={club}>
            <ClubSet club={club} />
            <figcaption className="mt-1.5 text-body-strong">
              {clubNames[club]}
            </figcaption>
          </figure>
        ))}
      </Section>
      <Section title="Row" cols="sm:grid-cols-3">
        <Card id="Trailhead">
          <ObjectRow ids={["plate", "wave"]} className="max-w-40" />
        </Card>
        <Card id="Ridge">
          <ObjectRow
            ids={["plate", "wave", "paddle", "spin-bike"]}
            className="max-w-80"
          />
        </Card>
        <Card id="Summit">
          <ObjectRow
            ids={[
              "plate",
              "wave",
              "paddle",
              "spin-bike",
              "spa-stones",
              "towel",
              "whistle",
            ]}
          />
        </Card>
      </Section>
      <Section title="Crop" cols="grid-cols-2 lg:grid-cols-4">
        <Card id="ladder, sand">
          <ObjectCrop id="pool" />
        </Card>
        <Card id="flywheel, night">
          <ObjectCrop
            id="spin-bike"
            scheme="night"
            scale={1.05}
            x={0.35}
            y={0.35}
          />
        </Card>
      </Section>
      <Section title="Category tiles" cols="grid-cols-4 sm:grid-cols-8">
        {(Object.keys(categoryObject) as CategoryId[]).map((c) => (
          <Card key={c} id={c}>
            <CategoryTile category={c} cut />
            <CategoryTile category={c} className="mt-3 size-8" />
          </Card>
        ))}
      </Section>

      <h2 className="mt-16 border-t pt-6 text-h3">
        Retiring (VISUAL-IDENTITY.md, section 2)
      </h2>
      <Section
        title="Space graphics"
        cols="grid-cols-2 sm:grid-cols-4 lg:grid-cols-6"
      >
        {spaceGraphicIds.map((id) => (
          <Card key={id} id={id}>
            <SpaceGraphic id={id} ratio={1} />
          </Card>
        ))}
      </Section>
      <Section
        title="Class graphics"
        cols="grid-cols-2 sm:grid-cols-4 lg:grid-cols-6"
      >
        {classGraphicIds.map((id) => (
          <Card key={id} id={id}>
            <ClassGraphic id={id} ratio={1} />
          </Card>
        ))}
      </Section>
      <Section
        title="Coach marks"
        cols="grid-cols-3 sm:grid-cols-4 lg:grid-cols-8"
      >
        {coachMarkIds.map((slug) => (
          <Card key={slug} id={slug}>
            <CoachMark slug={slug} size={120} />
          </Card>
        ))}
      </Section>
      <Section title="Space art" cols="sm:grid-cols-2 lg:grid-cols-3">
        {spaceArtIds.map((id) => (
          <Card key={id} id={id}>
            <SpaceArt id={id} ratio="16/9" />
          </Card>
        ))}
      </Section>
      <Section title="Bespoke graphics" cols="sm:grid-cols-2 lg:grid-cols-4">
        {brandGraphicIds.map((id) => (
          <Card key={id} id={id}>
            <BrandGraphic id={id} shape="square" />
          </Card>
        ))}
      </Section>
    </main>
  )
}
