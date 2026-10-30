import { ObjectCrop, type ObjectId, type Ratio } from "./graphics"

type Pick = { object: ObjectId; scheme: "night" | "copper" | "sand" }
// Each article's picture is the one object it is about, large and cropped. Keyed by slug so the data
// file stays free of graphic ids.
const BY_SLUG: Record<string, Pick> = {
  "your-first-climb-cycle": { object: "spin-bike", scheme: "night" },
  "a-week-back-after-surgery": { object: "wave", scheme: "sand" },
  "what-to-eat-before-a-6-am-class": { object: "shaker", scheme: "copper" },
  "packing-for-kids-club": { object: "gym-bag", scheme: "copper" },
  "heritage-rooftop-deck-open": { object: "sun", scheme: "night" },
  "pickleball-in-the-heat": { object: "paddle", scheme: "sand" },
}

/** The article picture: a Crop of the object the article is about. Decorative, because the headline sits beside it. */
export function JournalArt({
  slug,
  ratio,
  className,
}: {
  slug: string
  ratio: Ratio
  className?: string
}) {
  const p = BY_SLUG[slug] ?? { object: "kettlebell", scheme: "night" }
  return (
    <ObjectCrop
      id={p.object}
      ratio={ratio}
      scheme={p.scheme}
      scale={0.55}
      x={0.45}
      y={0.2}
      className={className}
    />
  )
}
