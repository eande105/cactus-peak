import { BottomActionBar, SkipLinks } from "@/components/site/chrome"
import { SiteFooter } from "@/components/site/footer"
import { SiteHeader } from "@/components/site/header"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <SkipLinks club />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
      <BottomActionBar />
    </div>
  )
}
