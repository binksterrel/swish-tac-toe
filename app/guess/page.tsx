import { GuessGame } from "@/components/guess/guess-game"
import { Header, SiteFooter } from "@/components/layout/header"
import { NBATicker } from "@/components/layout/nba-ticker"

export default function GuessPage() {
  return (
    <main className="min-h-screen flex flex-col bg-canvas text-ink font-sans text-body">
      <NBATicker />
      <Header />
      <section className="flex-1 w-full max-w-6xl mx-auto px-s16 md:px-s32 py-s32 md:py-s48">
        <GuessGame />
      </section>
      <SiteFooter />
    </main>
  )
}
