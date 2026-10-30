import ThreadPage from "@/components/inbox/thread-page"

export default async function Page({
  params,
}: {
  params: Promise<{ threadId: string }>
}) {
  const { threadId } = await params
  return <ThreadPage id={threadId} />
}
