import type { Metadata } from "next"
import Link from "next/link"
import { LinkButton } from "@/components/brand/atoms"
import { ObjectRack } from "@/components/brand/graphics"
import {
  Breadcrumbs,
  ClosingRow,
  Container,
  DenseSection,
  SplitSection,
} from "@/components/sections/common"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Fall climb: $0 enrollment through Nov 30 — Cactus Peak",
  description: "Join any plan by Nov 30 and skip the $49 enrollment fee.",
}
export default async function Promo() {
  const { plans } = await getCatalog()
  return (
    <>
      <Breadcrumbs trail={[{ label: "Fall climb" }]} />
      <Container className="grid items-center gap-8 pt-4 pb-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h1 className="font-display-wide text-h1 lg:text-[3.5rem] lg:leading-[1.02]">
            $0 enrollment through Nov 30.
          </h1>
          <p className="mt-4 max-w-[44ch] text-body">
            Join any plan by Nov 30 and skip the $49 enrollment fee.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/join/plan" size="lg">
              Join now
            </LinkButton>
            <LinkButton href="/tour" variant="outline" size="lg">
              Book a free tour
            </LinkButton>
          </div>
        </div>
      </Container>
      <SplitSection
        label="The terms, in plain words"
        graphic={
          <ObjectRack
            ratio="4/3"
            layout="climb"
            scheme="copper"
            focus="squat-rack"
            ids={[
              "water-bottle",
              "jump-rope",
              "kettlebell",
              "plate",
              "dumbbell",
            ]}
          />
        }
      >
        <ul className="max-w-2xl divide-y divide-border border-y border-border text-body">
          {[
            "Applies to Trailhead, Ridge and Summit.",
            "Month to month. Cancel or freeze with 30 days' notice.",
            "The $49 annual facility fee is still charged in March.",
            "Offer ends Nov 30, 2026 at 11:59 p.m. Arizona time.",
          ].map((t) => (
            <li key={t} className="py-3">
              {t}
            </li>
          ))}
        </ul>
      </SplitSection>
      <DenseSection label="Plans" icon="gym-bag">
        <table className="w-full border-t-2 border-foreground text-left">
          <caption className="sr-only">Plans with the Fall climb offer</caption>
          <tbody>
            {plans.map((p) => (
              <tr key={p.slug} className="border-b border-border">
                <th scope="row" className="font-display-wide py-4 text-h2">
                  {p.name}
                </th>
                <td className="tabular py-4 font-data text-h2 font-bold">
                  ${p.price}
                  <span className="text-body font-normal text-muted-foreground">
                    /mo
                  </span>
                </td>
                <td className="hidden py-4 text-body text-muted-foreground md:table-cell">
                  {p.bestFor}
                </td>
                <td className="py-4 text-right">
                  <Link
                    className="inline-flex min-h-11 items-center font-semibold text-link underline-offset-4 hover:underline"
                    href={`/join/plan?plan=${p.slug}`}
                  >
                    Join {p.name}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseSection>
      <ClosingRow title="Still deciding? Come see it." />
    </>
  )
}
