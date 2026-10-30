/**
 * Cactus Peak graphics system. Import components and ids from here:
 *   import { ObjectRack, ClubSet, CategoryTile, GymObject, ObjectCrop } from "@/components/brand/graphics"
 * Gym objects (the brand language, VISUAL-IDENTITY.md): objects.ts, compose.ts, scheme.ts.
 * Retiring (scenes, line pictograms, coach marks, bespoke): lines.ts, sets.ts, art.ts, marks.ts, bespoke.ts.
 * Export to standalone SVG: node scripts/export-graphics.mjs (writes ../brand-graphics/svg).
 */

export { type SpaceArtId, spaceArt, spaceArtIds } from "./art"
export {
  type BrandGraphicId,
  brandGraphicIds,
  brandGraphics,
  type ContainerShape,
  containerShapeIds,
  containerShapes,
} from "./bespoke"
export {
  BrandGraphic,
  CategoryTile,
  ClassGraphic,
  ClubSet,
  CoachMark,
  GymObject,
  ObjectCrop,
  ObjectRack,
  ObjectRow,
  objectLabel,
  type Ratio,
  SpaceArt,
  SpaceGraphic,
} from "./components"
export type { RackLayout } from "./compose"
export { type CoachMarkId, coachMarkIds, coachMarks } from "./marks"
export {
  type CategoryId,
  type ClubId,
  categoryObject,
  categoryRelated,
  clubObjects,
  coachObjects,
  generalObjects,
  type ObjectId,
  objectIds,
  objects,
  type PlanId,
  planObjects,
  spaceObjects,
} from "./objects"
export { categoryTone, tones, toneVar } from "./paint"
export type { BrandScheme, Scheme } from "./scheme"
export {
  type ClassGraphicId,
  classGraphicIds,
  classGraphics,
  type SpaceGraphicId,
  spaceGraphicIds,
  spaceGraphics,
} from "./sets"
export type { Tone } from "./types"
