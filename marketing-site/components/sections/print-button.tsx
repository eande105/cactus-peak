"use client"
import { Button } from "@/components/ui/button"
export function PrintButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => window.print()}
      className="print:hidden"
    >
      Print
    </Button>
  )
}
