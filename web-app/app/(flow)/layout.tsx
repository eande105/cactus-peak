import { redirect } from "next/navigation"
import { FlowShell } from "@/components/app/flow-shell"
import { getSessionUser } from "@/lib/supabase/user"

export default async function FlowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // proxy.ts redirects first. This is the second check.
  if (!(await getSessionUser())) redirect("/sign-in?next=%2Fwelcome")
  return <FlowShell>{children}</FlowShell>
}
