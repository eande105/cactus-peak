import { SiteFooter } from "@/components/site/footer"
import { SiteHeader } from "@/components/site/header"
import NotFound from "./(site)/not-found"

export default function Root404() {
  return (
    <div className="isolate flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <NotFound />
      </main>
      <SiteFooter />
    </div>
  )
}
