import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({
  reversed,
  className,
  width = 200,
  symbolOnly,
}: {
  reversed?: boolean
  className?: string
  width?: number
  symbolOnly?: boolean
}) {
  const src = symbolOnly
    ? reversed
      ? "/brand/cpa-symbol-reversed.svg"
      : "/brand/cpa-symbol-color.svg"
    : reversed
      ? "/brand/cpa-horizontal-reversed.svg"
      : "/brand/cpa-horizontal-color.svg"
  const h = symbolOnly ? width : Math.round((width * 256) / 1202)
  return (
    <Link
      href="/"
      aria-label="Cactus Peak Athletic, home"
      className={cn("inline-flex min-h-11 items-center rounded-sm", className)}
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={h}
        unoptimized
        priority
        style={{ width, height: h }}
      />
    </Link>
  )
}
