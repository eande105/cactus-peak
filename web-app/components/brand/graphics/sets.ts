import { parseRatio, place, rect } from "./engine"
import type { LineSubject } from "./lines"
import * as S from "./lines"
import type { Drawing, El, Tone } from "./types"

/*
 * Space graphics and class graphics: one collection of line illustrations.
 * - Field: one flat, very light tint of the tone (paint "tint"). Nothing else in the background.
 * - Subject: a line drawing (lines.ts) in the tone's strong value with one tint fill, centred.
 * - Margins: the subject's 48-unit box takes 56% of the short side, so 22% stays clear on each side
 *   and the optical size is the same at every ratio.
 * - Stroke: one rule, HAIR. Hair strokes do not scale with the viewBox; their pixel width follows the
 *   rendered width of the graphic: 2 px at 96 px, 3 px at 400 px, held between 1.75 and 3.25 px.
 * - Duotone: outlines and small solid parts in the tone's strong value (f5); main surfaces in `mid`.
 */

/** Hair stroke width in px for a graphic rendered `widthPx` wide: 2 px at 96 px, 3 px at 400 px. */
export const hairPx = (widthPx: number) =>
  Math.min(3.25, Math.max(1.75, 1.684 + 0.00329 * widthPx))
/** The same rule in CSS. The component wraps the SVG in an inline-size container, so 1cqi = 1% of its width. */
export const HAIR_CSS = "clamp(1.75px, calc(1.684px + 0.329cqi), 3.25px)"

export const spaceGraphics = {
  "strength-floor": {
    label: "Strength floor",
    tone: "copper",
    subject: S.rack,
    meaning:
      "Free weights and racks: a barbell on a stand, plates seen edge-on.",
  },
  machines: {
    label: "Machines",
    tone: "sand",
    subject: S.cableStack,
    meaning:
      "Selectorized and cable machines: a frame, a pulley and a plate stack.",
  },
  cardio: {
    label: "Cardio",
    tone: "amber",
    subject: S.treadmillLine,
    meaning:
      "Cardio floor: a treadmill with its upright and console on the motor hood.",
  },
  studio: {
    label: "Studio",
    tone: "sage",
    subject: S.matAndBlock,
    meaning:
      "Group studios: a mat half rolled out, with a foam block standing on it.",
  },
  "cycle-studio": {
    label: "Cycle studio",
    tone: "pine",
    subject: S.studioBikeLine,
    meaning:
      "Indoor cycle studio: a studio bike with a flywheel, 60° seat post and stem.",
  },
  courts: {
    label: "Courts",
    tone: "gold",
    subject: S.net,
    meaning:
      "Pickleball, tennis and basketball: a sagging mesh net between its posts, over the court line.",
  },
  "lap-pool": {
    label: "Lap pool",
    tone: "teal",
    subject: S.ladder,
    meaning: "Lap pool: a pool ladder over the water.",
  },
  "warm-pool": {
    label: "Warm-water pool",
    tone: "teal",
    subject: S.thermometerLine,
    meaning: "Warm-water pool: a thermometer at the water line.",
  },
  "splash-pad": {
    label: "Splash pad",
    tone: "teal",
    subject: S.fountain,
    meaning: "Splash pad: three jets rise from a round pad.",
  },
  recovery: {
    label: "Recovery",
    tone: "plum",
    subject: S.bucket,
    meaning: "Sauna, plunge and compression: the sauna bucket and a 60° ladle.",
  },
  "kids-club": {
    label: "Kids club",
    tone: "rose",
    subject: S.climbingFrame,
    meaning:
      "Kids club: a children's slide from the side: ladder with handrails, platform, curved chute with a lip.",
  },
  lockers: {
    label: "Lockers and showers",
    tone: "sand",
    subject: S.lockers,
    meaning: "Locker rooms: a bank of lockers with a bench.",
  },
  deck: {
    label: "Outdoor deck",
    tone: "copper",
    subject: S.deckRail,
    meaning: "Rooftop or cardio deck: the sun over the deck rail.",
  },
  turf: {
    label: "Turf lane",
    tone: "pine",
    subject: S.sled,
    meaning:
      "Turf lane: an agility ladder laid flat in perspective, two training cones and a dashed turf line.",
  },
  lounge: {
    label: "Café and lounge",
    tone: "copper",
    subject: S.cup,
    meaning: "Café and lounge: a cup on a saucer.",
  },
} as const satisfies Record<
  string,
  { label: string; tone: Tone; subject: LineSubject; meaning: string }
>

export const classGraphics = {
  strength: {
    label: "Strength",
    tone: "copper",
    subject: S.kettlebellLine,
    meaning: "A kettlebell.",
  },
  cycle: {
    label: "Cycle",
    tone: "pine",
    subject: S.roadBike,
    meaning: "Ride the hills: a road bike whose frame tubes run at 60°.",
  },
  conditioning: {
    label: "Conditioning",
    tone: "amber",
    subject: S.stopwatchLine,
    meaning:
      "Work hard, then stop: a stopwatch with the hand at 60° and the work arc.",
  },
  "mind-body": {
    label: "Mind & Body",
    tone: "sage",
    subject: S.stones,
    meaning: "Move slow, breathe well: a balanced cairn.",
  },
  aqua: {
    label: "Aqua",
    tone: "teal",
    subject: S.dropLine,
    meaning: "A drop with a 60° tip and waves.",
  },
  court: {
    label: "Court",
    tone: "gold",
    subject: S.paddleAndBall,
    meaning: "A pickleball paddle and ball.",
  },
  recovery: {
    label: "Recovery",
    tone: "plum",
    subject: S.roller,
    meaning: "Rest is a skill: a ribbed foam roller.",
  },
  youth: {
    label: "Youth",
    tone: "rose",
    subject: S.kiteLine,
    meaning: "A kite with a long tail that flows away, bows along it.",
  },
} as const satisfies Record<
  string,
  { label: string; tone: Tone; subject: LineSubject; meaning: string }
>

export type SpaceGraphicId = keyof typeof spaceGraphics
export type ClassGraphicId = keyof typeof classGraphics
export const spaceGraphicIds = Object.keys(spaceGraphics) as SpaceGraphicId[]
export const classGraphicIds = Object.keys(classGraphics) as ClassGraphicId[]

/** Compose a line graphic: the tint field and the centred subject. */
export function composeLine(
  subject: LineSubject,
  r: number,
  simple: boolean
): Drawing {
  const H = 100,
    W = H * r
  const s = (Math.min(W, H) * 0.56) / 48
  const els: El[] = [
    rect(0, 0, W, H, "tint"),
    place(W / 2, H / 2, s, subject.build(simple)),
  ]
  return { w: W, h: H, els, line: true }
}

export function buildSpaceGraphic(
  id: SpaceGraphicId,
  ratio: string | number,
  simple = false
): Drawing {
  return composeLine(spaceGraphics[id].subject, parseRatio(ratio), simple)
}
export function buildClassGraphic(
  id: ClassGraphicId,
  ratio: string | number,
  simple = false
): Drawing {
  return composeLine(classGraphics[id].subject, parseRatio(ratio), simple)
}
