"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SessionDetail } from "@/components/booking/session-detail"
import { SideSheet } from "@/components/kit/overlays"

export function SessionSheet({ id }: { id: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const close = () => setOpen(false)
  return (
    <SideSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setOpen(false)
      }}
      label="Class details"
      onClosed={() => router.back()}
    >
      <SessionDetail id={id} mode="sheet" onClose={close} />
    </SideSheet>
  )
}
