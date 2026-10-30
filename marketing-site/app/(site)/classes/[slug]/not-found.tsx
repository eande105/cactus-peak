import { LinkButton } from "@/components/brand/atoms"
import { Container } from "@/components/sections/common"

export default function NotFound() {
  return (
    <Container className="py-16 lg:py-24">
      <h1 className="font-display-wide text-h1 lg:text-display">
        We do not run a class by that name.
      </h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href="/classes" size="lg">
          See all classes
        </LinkButton>
        <LinkButton href="/search" variant="outline" size="lg">
          Search
        </LinkButton>
      </div>
    </Container>
  )
}
