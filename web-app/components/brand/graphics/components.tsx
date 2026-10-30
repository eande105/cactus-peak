import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { buildSpaceArt, type SpaceArtId, spaceArt } from "./art"
import {
  type BrandGraphicId,
  brandGraphics,
  buildBrandGraphic,
  type ContainerShape,
  containerShapes,
} from "./bespoke"
import {
  type CropOptions,
  crop,
  type RackLayout,
  rack,
  row,
  tile,
} from "./compose"
import { parseRatio } from "./engine"
import { buildCoachMark, type CoachMarkId, coachMarks } from "./marks"
import {
  type CategoryId,
  type ClubId,
  categoryObject,
  clubObjects,
  generalObjects,
  type ObjectId,
  objects,
} from "./objects"
import { PAPER_CSS, paintCss, rampStyle } from "./paint"
import { OBJECT_CSS, objPaintCss, type Scheme, schemeStyle } from "./scheme"
import { elementsToSvg } from "./serialize"
import {
  buildClassGraphic,
  buildSpaceGraphic,
  type ClassGraphicId,
  classGraphics,
  HAIR_CSS,
  type SpaceGraphicId,
  spaceGraphics,
} from "./sets"
import type { Drawing, ObjPaint, Tone } from "./types"

/** "16/9", "4:3" or a number (width ÷ height). */
export type Ratio = string | number

type Shared = {
  /** Override the default tone. */
  tone?: Tone
  /** Accessible name. Without it the graphic is decorative and hidden from assistive tech. */
  label?: string
  /** "simple" drops fine detail for small tiles and thumbnails. */
  detail?: "full" | "simple"
  /** Fill a positioned parent (absolute, inset 0) instead of setting its own aspect ratio. */
  fill?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Render a drawing. The drawing is composed for one ratio; if the box differs a little, `slice`
 * crops the edges and never stretches. Colours come from CSS variables, so the graphic follows the theme.
 */
function Svg({
  drawing,
  tone,
  label,
  fill,
  className,
  style,
}: { drawing: Drawing; tone: Tone } & Pick<
  Shared,
  "label" | "fill" | "className" | "style"
>) {
  const html = `<style>${PAPER_CSS}</style>${elementsToSvg(drawing.els, (p) => paintCss(p, tone), "style")}`
  const a11y = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true as const, focusable: false as const }
  return (
    <svg
      viewBox={`0 0 ${Math.round(drawing.w * 100) / 100} ${drawing.h}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "cpg",
        fill ? "absolute inset-0 size-full" : "block h-auto w-full",
        className
      )}
      style={{
        ...(rampStyle(tone) as CSSProperties),
        ...(fill ? {} : { aspectRatio: `${drawing.w} / ${drawing.h}` }),
        ...style,
      }}
      {...a11y}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: markup is serialized from the in-repo drawing data, never from user input
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Render a line graphic. The SVG sits in an inline-size container so the hair stroke width
 * (HAIR_CSS, in cqi) follows the rendered width. Strokes are non-scaling, so the viewBox does not thicken them.
 * The wrapper takes the accessible name, the class names and the sizing.
 */
function LineSvg({
  drawing,
  tone,
  label,
  fill,
  className,
  style,
}: { drawing: Drawing; tone: Tone } & Pick<
  Shared,
  "label" | "fill" | "className" | "style"
>) {
  const html = `<style>${PAPER_CSS}</style>${elementsToSvg(drawing.els, (p) => paintCss(p, tone), "style")}`
  const a11y = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true as const }
  const box: CSSProperties = {
    ...(rampStyle(tone, true) as CSSProperties),
    ...({ "--g-sw": HAIR_CSS } as CSSProperties),
    containerType: "inline-size",
    ...(fill ? {} : { aspectRatio: `${drawing.w} / ${drawing.h}` }),
    ...style,
  }
  return (
    <span
      className={cn(
        "cpg overflow-hidden",
        fill ? "absolute inset-0" : "relative block w-full",
        className
      )}
      style={box}
      {...a11y}
    >
      <svg
        viewBox={`0 0 ${Math.round(drawing.w * 100) / 100} ${drawing.h}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden="true"
        focusable="false"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: markup is serialized from the in-repo drawing data, never from user input
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </span>
  )
}

/** Image graphic for a gym space or amenity (club spaces section, app cards). Default ratio 4:3. */
export function SpaceGraphic({
  id,
  ratio = "4/3",
  tone,
  detail,
  ...rest
}: Shared & { id: SpaceGraphicId; ratio?: Ratio }) {
  return (
    <LineSvg
      drawing={buildSpaceGraphic(id, ratio, detail === "simple")}
      tone={tone ?? spaceGraphics[id].tone}
      {...rest}
    />
  )
}

/** Image graphic for a class category (carousel slides, class cards). Default ratio 4:3, tone from the category. */
export function ClassGraphic({
  id,
  ratio = "4/3",
  tone,
  detail,
  ...rest
}: Shared & { id: ClassGraphicId; ratio?: Ratio }) {
  return (
    <LineSvg
      drawing={buildClassGraphic(id, ratio, detail === "simple")}
      tone={tone ?? classGraphics[id].tone}
      {...rest}
    />
  )
}

/** Scene art for a club space or exterior, for photo slots at any ratio. Default ratio 16:9. */
export function SpaceArt({
  id,
  ratio = "16/9",
  tone,
  detail,
  ...rest
}: Shared & { id: SpaceArtId; ratio?: Ratio }) {
  return (
    <LineSvg
      drawing={buildSpaceArt(id, ratio, detail === "simple")}
      tone={tone ?? spaceArt[id].tone}
      {...rest}
    />
  )
}

/** Decorative composition for a section. Pass a container `shape`, or any `ratio`. */
export function BrandGraphic({
  id,
  shape = "band",
  ratio,
  tone,
  detail,
  ...rest
}: Shared & { id: BrandGraphicId; shape?: ContainerShape; ratio?: Ratio }) {
  const r =
    ratio !== undefined ? parseRatio(ratio) : containerShapes[shape].ratio
  const simple = detail
    ? detail === "simple"
    : shape === "tile" && ratio === undefined
  return (
    <Svg
      drawing={buildBrandGraphic(id, r, simple)}
      tone={tone ?? brandGraphics[id].tone}
      {...rest}
    />
  )
}

/**
 * A coach's profile mark, cropped to a circle by default. `size` sets width and height in px;
 * leave it out and set the size with className instead.
 */
export function CoachMark({
  slug,
  size,
  shape = "circle",
  tone,
  label,
  className,
  style,
}: Omit<Shared, "detail" | "fill"> & {
  slug: CoachMarkId
  size?: number
  shape?: "circle" | "square"
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden",
        shape === "circle" ? "rounded-full" : "rounded-sm",
        className
      )}
      style={{ ...(size ? { width: size, height: size } : {}), ...style }}
    >
      <LineSvg
        drawing={buildCoachMark(slug)}
        tone={tone ?? coachMarks[slug].tone}
        label={label}
        fill
      />
    </span>
  )
}

// ---------- Gym objects (VISUAL-IDENTITY.md) ----------

type ObjShared = {
  /** Accessible name. Without it the graphic is decorative and hidden from assistive tech. */
  label?: string
  /** Fill a positioned parent (absolute, inset 0) instead of setting its own aspect ratio. */
  fill?: boolean
  className?: string
  style?: CSSProperties
}

/** Render an object drawing. The scheme sets the field, body and detail colours for both themes. */
function ObjSvg({
  drawing,
  scheme,
  label,
  fill,
  className,
  style,
}: { drawing: Drawing<ObjPaint>; scheme: Scheme } & ObjShared) {
  const html = `<style>${OBJECT_CSS}</style>${elementsToSvg(drawing.els, objPaintCss, "style")}`
  const a11y = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true as const, focusable: false as const }
  return (
    <svg
      viewBox={`0 0 ${Math.round(drawing.w * 100) / 100} ${drawing.h}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "cpo",
        fill ? "absolute inset-0 size-full" : "block h-auto w-full",
        className
      )}
      style={{
        ...(schemeStyle(scheme) as CSSProperties),
        ...(fill ? {} : { aspectRatio: `${drawing.w} / ${drawing.h}` }),
        ...style,
      }}
      {...a11y}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: markup is serialized from the in-repo drawing data, never from user input
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * One gym object (the Tile). `cut` sets it in a tint square with a 60° corner, for pickers and
 * empty states at 64–160 px. Bare by default, for lists at 16–48 px.
 */
export function GymObject({
  id,
  scheme = "sand",
  cut = false,
  ...rest
}: ObjShared & { id: ObjectId; scheme?: Scheme; cut?: boolean }) {
  return <ObjSvg drawing={tile(id, cut)} scheme={scheme} {...rest} />
}

/** The Tile for a class category: the category's object in the category colour. */
export function CategoryTile({
  category,
  cut = false,
  ...rest
}: ObjShared & { category: CategoryId; cut?: boolean }) {
  return (
    <ObjSvg
      drawing={tile(categoryObject[category], cut)}
      scheme={{ category }}
      {...rest}
    />
  )
}

/**
 * The Rack: a grid of object tiles for an image slot without a photo. Pass the container's ratio.
 * `layout` picks the arrangement (see RackLayout in compose.ts): `wall` (default) and `stagger` fill
 * the frame; `cluster`, `arc`, `orbit`, `spotlight`, `hub` and `climb` centre on a lit `focus` tile; `frame`
 * keeps the middle clear for a heading; `fade` is a grid that fades out. `seed` keeps it stable.
 */
export function ObjectRack({
  ratio = "4/3",
  ids = generalObjects,
  rows,
  seed = 1,
  layout = "wall",
  focus,
  shape,
  scheme = "night",
  ...rest
}: ObjShared & {
  ratio?: Ratio
  ids?: readonly ObjectId[]
  rows?: number
  seed?: number
  layout?: RackLayout
  focus?: ObjectId
  shape?: "square" | "disc"
  scheme?: Scheme
}) {
  return (
    <ObjSvg
      drawing={rack(parseRatio(ratio), {
        ids,
        rows,
        seed,
        layout,
        focus,
        shape,
      })}
      scheme={scheme}
      {...rest}
    />
  )
}

/** A club's Set: its three objects in a row. Always show the club's name beside it. */
export function ClubSet({
  club,
  scheme = "sand",
  ...rest
}: ObjShared & { club: ClubId; scheme?: Scheme }) {
  return <ObjSvg drawing={row(clubObjects[club])} scheme={scheme} {...rest} />
}

/** The Row: one object for each item, so the count carries the point. */
export function ObjectRow({
  ids,
  scheme = "sand",
  ...rest
}: ObjShared & { ids: readonly ObjectId[]; scheme?: Scheme }) {
  return <ObjSvg drawing={row(ids)} scheme={scheme} {...rest} />
}

/** The Crop: one object at 2–3× size, cut by the frame. Pair it with a real figure. */
export function ObjectCrop({
  id,
  ratio = "1/1",
  scheme = "sand",
  scale,
  x,
  y,
  ...rest
}: ObjShared & CropOptions & { id: ObjectId; ratio?: Ratio; scheme?: Scheme }) {
  return (
    <ObjSvg
      drawing={crop(id, parseRatio(ratio), { scale, x, y })}
      scheme={scheme}
      {...rest}
    />
  )
}

/** The plain-text name of an object, for accessible labels. */
export const objectLabel = (id: ObjectId) => objects[id].label
