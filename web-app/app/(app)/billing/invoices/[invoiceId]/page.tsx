import InvoicePage from "@/components/billing/invoice-page"

export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params
  return <InvoicePage id={invoiceId} />
}
