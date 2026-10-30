"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { openDialog } from "@/lib/ui-state"

// /billing/payment-method opens the card dialog over the billing page.
export default function CardRoute() {
  const router = useRouter()
  useEffect(() => {
    openDialog("card")
    router.replace("/billing")
  }, [router])
  return (
    <p role="status" className="text-caption text-muted-foreground">
      Opening…
    </p>
  )
}
