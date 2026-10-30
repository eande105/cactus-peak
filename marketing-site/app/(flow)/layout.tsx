import { SkipLinks } from "@/components/site/chrome"

export default function FlowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLinks />
      {children}
    </div>
  )
}
