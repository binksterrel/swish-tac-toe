"use client"

import { cn } from "@/lib/utils"
import { Trophy, RotateCcw, Share2, Frown, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GameOverModalProps {
  won: boolean
  score: number
  correctCells: number
  onNewGame: () => void
}

export function GameOverModal({
  won,
  score,
  correctCells,
  onNewGame,
}: GameOverModalProps) {
  const handleShare = () => {
    const text = `NBA Tiki Taka Toe\n${won ? "Victoire !" : "Partie terminée"}\nScore : ${score}\nCases : ${correctCells}/9\n\nJouez sur : ${window.location.href}`
    
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div
          className={cn(
            "p-6 text-center",
            won ? "bg-success/20" : "bg-destructive/20"
          )}
        >
          {won ? (
            <PartyPopper className="w-16 h-16 mx-auto text-success mb-2" />
          ) : (
            <Frown className="w-16 h-16 mx-auto text-destructive mb-2" />
          )}
          <h2 className="text-2xl font-bold text-foreground">
            {won ? "Vous avez gagné !" : "Partie terminée"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {won
              ? "Félicitations, vous avez gagné la partie !"
              : "Plus de chance la prochaine fois !"}
          </p>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Score Final</span>
            <span className="text-2xl font-bold text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {score}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Cases Trouvées</span>
            <span className="text-lg font-semibold text-foreground">
              {correctCells}/9
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Précision</span>
            <span className="text-lg font-semibold text-foreground">
              {correctCells > 0 ? Math.round((correctCells / 9) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border bg-secondary/30 flex gap-2">
          <Button variant="outline" onClick={handleShare} className="flex-1 bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button onClick={onNewGame} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Rejouer
          </Button>
        </div>
      </div>
    </div>
  )
}
