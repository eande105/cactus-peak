import { redirect } from "next/navigation"
import { StoreGate } from "@/components/app/shell"
import { getSessionUser } from "@/lib/supabase/user"

export default async function AppLayout({
  children,
  panel,
}: {
  children: React.ReactNode
  panel: React.ReactNode
}) {
  // proxy.ts sends signed-out requests to /sign-in with a 307 first. This is the second check.
  if (!(await getSessionUser())) redirect("/sign-in")
  return (
    <StoreGate>
      {children}
      {panel}
    </StoreGate>
  )
}
