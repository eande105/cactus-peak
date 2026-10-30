import { LinkButton } from "@/components/brand/atoms"
import { Container } from "@/components/sections/common"

export default function NotFound() {
  return (
    <Container className="py-16 lg:py-24">
      <h1 className="font-display-wide text-h1 lg:text-display">
        We could not find that coach.
      </h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href="/coaches" size="lg">
          Meet the coaches
        </LinkButton>
        <LinkButton href="/search" variant="outline" size="lg">
          Search
        </LinkButton>
      </div>
    </Container>
  )
}
