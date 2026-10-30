import { SessionPage } from "@/components/booking/session-page"

export const metadata = { title: "Class details" }

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  return <SessionPage id={decodeURIComponent(sessionId)} />
}
