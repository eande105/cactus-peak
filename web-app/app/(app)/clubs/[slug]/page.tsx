import { notFound } from "next/navigation"
import ClubDetail from "@/components/clubs/club-detail"
import { getCatalog } from "@/lib/data/catalog-server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return {
    title:
      (await getCatalog()).clubs.find((x) => x.slug === slug)?.name ?? "Club",
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { clubs } = await getCatalog()
  if (!clubs.some((x) => x.slug === slug)) notFound()
  return <ClubDetail slug={slug} />
}
