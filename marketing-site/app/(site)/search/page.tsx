import type { Metadata } from "next"
import { Suspense } from "react"
import { Container } from "@/components/sections/common"
import { SearchResults } from "@/components/sections/search-results"
export const metadata: Metadata = {
  title: "Search — Cactus Peak",
  robots: { index: false, follow: true },
}
export default function Search() {
  return (
    <Container className="py-10">
      <Suspense fallback={null}>
        <SearchResults />
      </Suspense>
    </Container>
  )
}
