"use client"

import { useEffect, useState } from "react"
import { BattleChat } from "@/components/battle/battle-chat"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useBattle } from "@/hooks/use-battle"
import { BattleGrid } from "@/components/battle/battle-grid"
import { PlayerInput } from "@/components/game/player-input" // Reusing
import { NBAPlayer } from "@/lib/nba-data"
import { Header, SiteFooter } from "@/components/layout/header"
import { useLanguage } from "@/contexts/language-context"
import { Loader2, Copy, Check } from "lucide-react"

import { NBATicker } from "@/components/layout/nba-ticker"

export default function BattleRoom() {
    const params = useParams()
    const searchParams = useSearchParams()
    const code = params.code as string
    const roleParam = searchParams.get('role') as 'host' | 'guest'
    const nameParam = searchParams.get('name')
    
    const { state, role, setRole, submitMove, voteSkip, passTurn, handleNextRound } = useBattle(code, nameParam || "")
    const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)
    const [copySuccess, setCopySuccess] = useState(false)
    const { t } = useLanguage()

    useEffect(() => {
        if (roleParam) setRole(roleParam)
    }, [roleParam, setRole])

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const handlePlayerSelect = (player: NBAPlayer) => {
        if (selectedCell) {
            submitMove(selectedCell.row, selectedCell.col, player)
            setSelectedCell(null)
        }
    }

    const shell = (children: React.ReactNode) => (
        <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans text-body">
            <NBATicker />
            <Header />
            <main className="flex flex-1 items-center justify-center px-s16 py-s48">{children}</main>
            <SiteFooter />
        </div>
    )

    if (!role) return shell(<p className="text-ink-muted">Accès invalide.</p>)

    if (!state) return shell(
        <div className="flex items-center gap-s16 text-ink-muted">
            <Loader2 className="size-5 animate-spin" strokeWidth={1.75} />
            <span className="text-meta">Connexion à la salle…</span>
        </div>
    )

    // Waiting Room UI
    if (!state.players.guest && role === 'host') {
        return shell(
            <div className="w-full max-w-md rounded-ref border border-line bg-surface p-s24 md:p-s32 text-center shadow-window animate-in fade-in zoom-in-95 duration-200 ease-out">
                <p className="font-heading text-meta font-semibold uppercase tracking-wider text-ink-muted">{t('battle.lobby_ready')}</p>
                <h1 className="mt-s8 font-heading text-display-sm font-bold uppercase tracking-tight text-ink">{t('battle.share_code')}</h1>

                <button
                    type="button"
                    onClick={handleCopyCode}
                    className="group mt-s24 flex w-full items-center justify-between gap-s16 rounded-nested border border-line bg-canvas px-s24 py-s16 transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                >
                    <span className="font-heading text-display-sm font-bold tabular-nums tracking-[0.12em] text-ink">{code}</span>
                    <span className="inline-flex items-center gap-s8 text-meta text-ink-muted group-hover:text-ink">
                        {copySuccess ? <Check className="size-4 text-success" strokeWidth={1.75} /> : <Copy className="size-4" strokeWidth={1.75} />}
                        {copySuccess ? t('battle.code_copied') : 'Copier'}
                    </span>
                </button>

                <p className="mt-s24 inline-flex items-center gap-s8 text-meta text-ink-muted">
                    <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                    {t('battle.waiting_p2')}
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans text-body">
            <NBATicker />
            <Header />
            <div className="flex-1 w-full max-w-5xl mx-auto px-s16 md:px-s32 py-s32">
                <BattleGrid 
                    state={state} 
                    role={role}
                    onCellClick={(r, c) => setSelectedCell({ row: r, col: c})}
                    selectedCell={selectedCell}
                    onVoteSkip={voteSkip}
                    onPassTurn={passTurn}
                    onNextRound={handleNextRound}
                />
                
                {selectedCell && (
                    <PlayerInput
                        onSubmit={handlePlayerSelect}
                        onCancel={() => setSelectedCell(null)}
                        usedPlayers={new Set(state.grid.flat().filter(c => c.player).map(c => c.player!.id))}
                        rowLabel={state.criteria.rows[selectedCell.row]?.label || "Row"}
                        colLabel={state.criteria.cols[selectedCell.col]?.label || "Column"}
                        rowType={state.criteria.rows[selectedCell.row]?.type}
                        colType={state.criteria.cols[selectedCell.col]?.type}
                    />
                )}

                <BattleChat 
                    code={code}
                    role={role}
                    playerName={state.players[role]?.name || "Me"}
                    opponentName={state.players[role === 'host' ? 'guest' : 'host']?.name}
                />
            </div>
            <SiteFooter />
        </div>
    )
}
