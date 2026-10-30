import { SessionSheet } from "@/components/booking/session-sheet"

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  return <SessionSheet id={decodeURIComponent(sessionId)} />
}
