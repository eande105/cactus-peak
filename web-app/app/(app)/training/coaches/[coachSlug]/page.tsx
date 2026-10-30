import { notFound } from "next/navigation"
import CoachProfile from "@/components/training/coach-profile"
import { getCatalog } from "@/lib/data/catalog-server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ coachSlug: string }>
}) {
  const { coachSlug } = await params
  return {
    title:
      (await getCatalog()).coaches.find((x) => x.slug === coachSlug)?.name ??
      "Coach",
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ coachSlug: string }>
}) {
  const { coachSlug } = await params
  const { coaches } = await getCatalog()
  if (!coaches.some((x) => x.slug === coachSlug)) notFound()
  return <CoachProfile slug={coachSlug} />
}
