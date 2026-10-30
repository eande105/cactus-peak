"use client"
import Link from "next/link"
import { ObjectRack } from "@/components/brand/graphics"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <main
        id="main"
        className="flex flex-col justify-center px-4 py-10 sm:px-10 lg:px-16"
      >
        <div className="mx-auto flex w-full max-w-[400px] flex-col gap-8">
          <Link href="/sign-in" aria-label="Cactus Peak Athletic">
            {/* biome-ignore lint/performance/noImgElement: static SVG brand mark, next/image adds nothing */}
            <img
              src="/brand/cpa-horizontal-color.svg"
              alt="Cactus Peak Athletic"
              className="h-12 w-auto dark:hidden"
            />
            {/* biome-ignore lint/performance/noImgElement: static SVG brand mark, next/image adds nothing */}
            <img
              src="/brand/cpa-horizontal-reversed.svg"
              alt=""
              className="hidden h-12 w-auto dark:block"
            />
          </Link>
          {children}
          <p className="text-caption text-muted-foreground">
            Not a member yet?{" "}
            <button
              type="button"
              className="text-link cursor-pointer underline underline-offset-4"
              onClick={(e) => e.preventDefault()}
            >
              See plans
            </button>
            . Need help? Call{" "}
            <a
              className="text-link num underline underline-offset-4"
              href="tel:4805550142"
            >
              (480) 555-0142
            </a>
            .
          </p>
        </div>
      </main>
      <div className="relative hidden lg:block">
        <ObjectRack ratio="4/5" layout="cluster" focus="kettlebell" fill />
        {/* biome-ignore lint/performance/noImgElement: static SVG brand mark, next/image adds nothing */}
        <img
          src="/brand/cpa-symbol-reversed.svg"
          alt=""
          className="absolute top-10 left-10 size-14"
        />
      </div>
    </div>
  )
}
