import { AuthShell } from "@/components/app/auth-shell"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthShell>{children}</AuthShell>
}
