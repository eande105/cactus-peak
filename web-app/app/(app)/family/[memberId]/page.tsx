import MemberProfile from "@/components/family/member-profile"

export default async function Page({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = await params
  return <MemberProfile id={memberId} />
}
