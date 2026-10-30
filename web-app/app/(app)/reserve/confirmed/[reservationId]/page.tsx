import ConfirmedPage from "@/components/reserve/confirmed-page"

export default async function Page({
  params,
}: {
  params: Promise<{ reservationId: string }>
}) {
  const { reservationId } = await params
  return <ConfirmedPage id={reservationId} />
}
