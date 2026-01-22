"use client"

import { cn } from "@/lib/utils"
import { Trophy, RotateCcw, Share2, Frown, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

interface GameOverModalProps {
  won: boolean
  score: number
  correctCells: number
  onNewGame: () => void
  gridSize?: number
}

export function GameOverModal({
  won,
  score,
  correctCells,
  onNewGame,
  gridSize = 3,
}: GameOverModalProps) {
  const { t } = useLanguage()
  const totalCells = gridSize * gridSize
  const percentage = Math.round((correctCells / totalCells) * 100)

  // Determine tier based on percentage
  let tier = 0 // Airball (0%)
  if (percentage >= 100) tier = 6 // Hall of Fame
  else if (percentage >= 80) tier = 5 // All-Star
  else if (percentage >= 60) tier = 4 // Starter
  else if (percentage >= 40) tier = 3 // 6th Man
  else if (percentage >= 20) tier = 2 // Rookie
  else if (percentage >= 1) tier = 1 // G-League
  
  // Dynamic title and description
  // @ts-ignore - dynamic keys
  const title = t(`game.result_title_${tier}`)
  // @ts-ignore - dynamic keys
  const description = t(`game.result_desc_${tier}`)

  const handleShare = () => {
    const text = `NBA Tiki Taka Toe\n${title}\nScore : ${score}\nCases : ${correctCells}/${totalCells}\n\nJouez sur : ${window.location.href}`
    
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
            percentage >= 40 ? "bg-success/20" : "bg-destructive/20"
          )}
        >
          {percentage >= 40 ? (
            <PartyPopper className="w-16 h-16 mx-auto text-success mb-2" />
          ) : (
            <Frown className="w-16 h-16 mx-auto text-destructive mb-2" />
          )}
          <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {description}
          </p>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('game.score_final')}</span>
            <span className="text-2xl font-bold text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {score}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('game.found')}</span>
            <span className="text-lg font-semibold text-foreground">
              {correctCells}/{totalCells}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Précision</span>
            <span className="text-lg font-semibold text-foreground">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border bg-secondary/30 flex gap-2">
          <Button variant="outline" onClick={handleShare} className="flex-1 bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            {t('game.share')}
          </Button>
          <Button onClick={onNewGame} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('game.reset')}
          </Button>
        </div>
      </div>
    </div>
  )
}
