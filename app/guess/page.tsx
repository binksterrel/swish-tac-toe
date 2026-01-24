import { GuessGame } from "@/components/guess/guess-game"
import { Header } from "@/components/layout/header"
import { NBATicker } from "@/components/layout/nba-ticker"

export default function GuessPage() {
  return (
    <main className="min-h-screen bg-[#050505] relative flex flex-col font-sans">
       <NBATicker />
       <Header />
       <section className="flex-1 container mx-auto px-4 py-8 relative z-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50"></div>
          <GuessGame />
       </section>
    </main>
  )
}
