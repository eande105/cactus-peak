import { nucleoArt } from "./nucleo-art"
import type { SpaceGraphicId } from "./sets"
import type { El, ObjPaint } from "./types"

/*
 * The gym objects: the brand's graphic language (VISUAL-IDENTITY.md, section 3).
 * The art is the Nucleo Pro core family, glyph style, 48 px, imported by
 * scripts/import-nucleo-objects.mjs into nucleo-art.ts. Each glyph has two tones: `a` for the body
 * and `b` for the parts Nucleo marks as the secondary colour. The compositions (compose.ts) and the
 * schemes (scheme.ts) decide where and in which colours the objects appear.
 */

type Meta = { label: string; means: string }

const meta = {
  plate: { label: "Weight plate", means: "Free weights, strength" },
  dumbbell: { label: "Dumbbell", means: "Strength floor, personal training" },
  barbell: { label: "Barbell", means: "Olympic platforms" },
  kettlebell: { label: "Kettlebell", means: "Strength classes" },
  "squat-rack": { label: "Squat rack", means: "Racks, lifting platforms" },
  bench: { label: "Bench", means: "Strength floor" },
  "medicine-ball": { label: "Medicine ball", means: "Functional training" },
  "punching-bag": { label: "Heavy bag", means: "Boxing, conditioning" },
  "resistance-band": { label: "Resistance band", means: "Mobility, rehab" },
  "spin-bike": { label: "Spin bike", means: "Cycle studio, cycle classes" },
  rower: { label: "Rower", means: "Cardio floor" },
  treadmill: { label: "Treadmill", means: "Cardio floor, cardio deck" },
  "jump-rope": { label: "Jump rope", means: "Conditioning classes" },
  stopwatch: { label: "Stopwatch", means: "Early classes, short sessions" },
  sneaker: { label: "Sneaker", means: "Turf lane, cardio" },
  cone: { label: "Cone", means: "Youth, agility" },
  pool: { label: "Pool", means: "Lap pool, swim school" },
  wave: { label: "Water", means: "Aqua classes, warm pool" },
  paddle: { label: "Paddle", means: "Pickleball courts" },
  "tennis-ball": { label: "Ball", means: "Courts, open play" },
  basketball: { label: "Basketball", means: "Basketball courts" },
  mat: { label: "Mat", means: "Studios, mind and body" },
  "spa-stones": { label: "Spa stones", means: "Recovery suite" },
  towel: { label: "Towel", means: "Towel service, lounge" },
  "water-bottle": { label: "Water bottle", means: "Day pass, drop-in" },
  shaker: { label: "Shaker", means: "Café, nutrition" },
  whistle: { label: "Whistle", means: "Coaches, personal training" },
  "gym-bag": { label: "Gym bag", means: "Membership, guest passes" },
  playground: { label: "Play structure", means: "Kids club" },
  key: { label: "Key", means: "Lockers, member access" },
  schedule: { label: "Schedule", means: "Class schedule, booking" },
  "heart-watch": { label: "Heart-rate watch", means: "Progress, visits" },
  sun: { label: "Sun", means: "Outdoor pool, rooftop, early hours" },
} as const satisfies Record<keyof typeof nucleoArt, Meta>

export type ObjectId = keyof typeof nucleoArt
export const objectIds = Object.keys(nucleoArt) as ObjectId[]

export const objects = Object.fromEntries(
  objectIds.map((id) => [
    id,
    { ...meta[id], els: nucleoArt[id] as readonly El<ObjPaint>[] },
  ])
) as Record<ObjectId, Meta & { els: readonly El<ObjPaint>[] }>

/** The object for each class category (the Tile). Same keys as `categoryTone` in paint.ts. */
export const categoryObject = {
  strength: "kettlebell",
  cycle: "spin-bike",
  conditioning: "jump-rope",
  "mind-body": "mat",
  aqua: "wave",
  court: "paddle",
  recovery: "spa-stones",
  youth: "cone",
} as const satisfies Record<string, ObjectId>
export type CategoryId = keyof typeof categoryObject

/** Each club's Set: three objects taken from what is real there (supabase/seed.sql). */
export const clubObjects = {
  "mesa-dobson": ["pool", "paddle", "spa-stones"],
  "mesa-red-mountain": ["stopwatch", "tennis-ball", "sneaker"],
  "mesa-downtown": ["dumbbell", "spin-bike", "water-bottle"],
  "gilbert-val-vista": ["pool", "basketball", "playground"],
  "gilbert-heritage": ["barbell", "squat-rack", "mat"],
} as const satisfies Record<string, readonly [ObjectId, ObjectId, ObjectId]>
export type ClubId = keyof typeof clubObjects

/** Each plan's Row: one object for each thing the plan includes (VISUAL-IDENTITY.md, section 6). */
export const planObjects = {
  trailhead: ["plate", "wave"],
  ridge: ["plate", "wave", "paddle", "spin-bike"],
  summit: [
    "plate",
    "wave",
    "paddle",
    "spin-bike",
    "spa-stones",
    "towel",
    "whistle",
  ],
} as const satisfies Record<string, readonly ObjectId[]>
export type PlanId = keyof typeof planObjects

/**
 * Each club space: its lead object and the objects around it in a hub (what the space includes).
 * Keyed by the retiring SpaceGraphicId, so club-spaces data can move over without a data change.
 */
export const spaceObjects = {
  "strength-floor": {
    lead: "squat-rack",
    around: [
      "plate",
      "dumbbell",
      "kettlebell",
      "bench",
      "barbell",
      "medicine-ball",
    ],
  },
  machines: {
    lead: "bench",
    around: ["plate", "dumbbell", "towel", "water-bottle", "key", "schedule"],
  },
  cardio: {
    lead: "treadmill",
    around: [
      "rower",
      "spin-bike",
      "heart-watch",
      "water-bottle",
      "towel",
      "sneaker",
    ],
  },
  studio: {
    lead: "mat",
    around: [
      "resistance-band",
      "medicine-ball",
      "jump-rope",
      "spa-stones",
      "water-bottle",
      "schedule",
    ],
  },
  "cycle-studio": {
    lead: "spin-bike",
    around: [
      "heart-watch",
      "stopwatch",
      "water-bottle",
      "towel",
      "sneaker",
      "schedule",
    ],
  },
  courts: {
    lead: "paddle",
    around: [
      "tennis-ball",
      "basketball",
      "sneaker",
      "water-bottle",
      "towel",
      "whistle",
    ],
  },
  "lap-pool": {
    lead: "pool",
    around: ["wave", "towel", "whistle", "stopwatch", "water-bottle", "sun"],
  },
  "warm-pool": {
    lead: "wave",
    around: [
      "pool",
      "towel",
      "spa-stones",
      "resistance-band",
      "water-bottle",
      "sun",
    ],
  },
  "splash-pad": {
    lead: "wave",
    around: ["sun", "towel", "playground", "cone", "water-bottle", "whistle"],
  },
  recovery: {
    lead: "spa-stones",
    around: ["towel", "resistance-band", "wave", "mat", "water-bottle", "key"],
  },
  "kids-club": {
    lead: "playground",
    around: [
      "cone",
      "tennis-ball",
      "basketball",
      "whistle",
      "sneaker",
      "water-bottle",
    ],
  },
  lockers: {
    lead: "key",
    around: [
      "towel",
      "gym-bag",
      "water-bottle",
      "sneaker",
      "shaker",
      "schedule",
    ],
  },
  deck: {
    lead: "sun",
    around: [
      "mat",
      "treadmill",
      "water-bottle",
      "towel",
      "resistance-band",
      "sneaker",
    ],
  },
  turf: {
    lead: "sneaker",
    around: [
      "cone",
      "medicine-ball",
      "jump-rope",
      "stopwatch",
      "water-bottle",
      "whistle",
    ],
  },
  lounge: {
    lead: "shaker",
    around: ["water-bottle", "towel", "key", "gym-bag", "schedule", "sun"],
  },
} as const satisfies Record<
  SpaceGraphicId,
  { lead: ObjectId; around: readonly ObjectId[] }
>

/** Objects that belong with each class category, for Racks on class and category pages. */
export const categoryRelated = {
  strength: [
    "plate",
    "dumbbell",
    "barbell",
    "squat-rack",
    "bench",
    "medicine-ball",
    "water-bottle",
    "towel",
  ],
  cycle: [
    "heart-watch",
    "stopwatch",
    "water-bottle",
    "towel",
    "sneaker",
    "schedule",
    "shaker",
    "key",
  ],
  conditioning: [
    "medicine-ball",
    "punching-bag",
    "stopwatch",
    "sneaker",
    "cone",
    "kettlebell",
    "water-bottle",
    "rower",
  ],
  "mind-body": [
    "spa-stones",
    "resistance-band",
    "water-bottle",
    "towel",
    "sun",
    "schedule",
    "heart-watch",
    "shaker",
  ],
  aqua: [
    "pool",
    "towel",
    "whistle",
    "stopwatch",
    "water-bottle",
    "sun",
    "spa-stones",
    "key",
  ],
  court: [
    "tennis-ball",
    "basketball",
    "sneaker",
    "water-bottle",
    "towel",
    "whistle",
    "schedule",
    "sun",
  ],
  recovery: [
    "towel",
    "resistance-band",
    "wave",
    "mat",
    "water-bottle",
    "heart-watch",
    "shaker",
    "key",
  ],
  youth: [
    "playground",
    "tennis-ball",
    "basketball",
    "whistle",
    "sneaker",
    "water-bottle",
    "jump-rope",
    "pool",
  ],
} as const satisfies Record<CategoryId, readonly ObjectId[]>

/** Each coach's object (their discipline), shown as a badge on the initials avatar until headshots exist. */
export const coachObjects: Record<string, ObjectId> = {
  "marisol-vega": "spin-bike",
  "tomas-reyes": "barbell",
  "aisha-brooks": "mat",
  "kenji-ito": "jump-rope",
  "dana-whitfield": "wave",
  "luis-ortega": "pool",
  "hannah-cole": "cone",
  "ruth-nakamura": "spa-stones",
  "devon-hart": "barbell",
  "jamal-carter": "spin-bike",
  "elise-moreno": "mat",
  "owen-kim": "medicine-ball",
  "lena-ortiz": "spin-bike",
  "gabe-santos": "pool",
  "hector-vance": "wave",
  "tessa-lund": "kettlebell",
  "sam-okafor": "whistle",
  "elena-duarte": "barbell",
  "marcus-hale": "pool",
  "rosa-lindgren": "resistance-band",
  "jake-whitcomb": "cone",
  "imani-brooks": "mat",
  "tess-nakamura": "spin-bike",
  "ray-delgado": "paddle",
  "nadia-kowalski": "spa-stones",
}

/** General objects: a Rack that shows the range of what is inside any club. */
export const generalObjects: readonly ObjectId[] = [
  "kettlebell",
  "spin-bike",
  "wave",
  "paddle",
  "tennis-ball",
  "plate",
  "jump-rope",
  "mat",
  "spa-stones",
  "cone",
  "stopwatch",
  "dumbbell",
  "rower",
  "medicine-ball",
  "towel",
  "water-bottle",
]
