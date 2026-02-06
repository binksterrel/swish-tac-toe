# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swish Tac Toe is an NBA trivia grid game (inspired by Immaculate Grid) with zero-latency solo mode and real-time 1v1 battle mode. Live at https://swish-tac-toe.vercel.app

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Jest unit tests
npm run test:watch   # Jest watch mode
npm run test:e2e     # Playwright E2E tests
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router), TypeScript strict, React 19
- **Styling**: Tailwind CSS 4, Framer Motion, Radix/Shadcn UI
- **Backend**: Supabase (PostgreSQL + Auth), Pusher (WebSocket), Next.js API Routes
- **Testing**: Jest 30, Playwright 1.49

### Core Architecture Decisions

**Solo Mode = 100% Client-Side** (Non-negotiable)
- `lib/players.json` (~3MB, ~5000 players) is embedded at build-time
- All validation happens client-side via `lib/nba-data.ts` (<16ms per interaction)
- Game state persisted to localStorage (key: `nba-ttt-game`)
- Never add network dependencies to solo game validation

**Battle Mode = Server-Authoritative**
- Client submits moves, `/api/battle/move` validates and arbitrates
- Supabase stores state, Pusher broadcasts events (<200ms target)
- Turn-based with 60-second timeouts, best-of-5 rounds

### Key Files

| File | Purpose |
|------|---------|
| `lib/nba-data.ts` | Core game engine: validation, criteria matching, team consolidation |
| `lib/additional-nba-data.ts` | Manual data overrides for edge cases (~10K lines) |
| `lib/players.json` | Static player database (embedded at build) |
| `hooks/use-game-state.ts` | Solo game state management |
| `hooks/use-battle.ts` | Multiplayer battle logic |
| `lib/translations.ts` | i18n strings (FR/EN) |
| `contexts/auth-context.tsx` | Supabase auth (Google OAuth + email) |

### Directory Structure

```
app/
├── game/           # Solo game page
├── battle/         # Multiplayer (local/ for same-device, [code]/ for rooms)
├── guess/          # "Guess the Player" mode
├── players/        # Player encyclopedia
├── stats/, games/  # User statistics and history
├── api/battle/     # Battle API routes (create, join, move, chat, etc.)
└── api/cron/       # Cleanup jobs (scheduled via vercel.json)

components/
├── game/           # GameGrid, GameCell, PlayerInput, CriteriaHeader
├── battle/         # BattleLobby, BattleGrid, BattleChat
├── ui/             # Shadcn UI primitives
└── layout/         # Header, NBATicker, LanguageToggle

lib/                # Business logic, data, utilities
hooks/              # Custom React hooks
contexts/           # React context providers (auth, language)
scripts/            # ETL & data maintenance (Python/TypeScript)
```

### Validation Logic

Players must match BOTH row AND column criteria:
```typescript
validatePlayerForCell(player, rowCriteria, colCriteria)
```

Criteria types: Team (modern + legacy), Awards (MVP/DPOY/ROY/Champion/All-Star/All-NBA), Stats (PPG/RPG/APG thresholds), Position, Decade, Origin, Draft position.

Legacy teams are consolidated (e.g., Seattle SuperSonics → OKC Thunder).

## Design System

- **Background**: Black (#000000)
- **Colors**: NBA Blue (#0d47a1), NBA Red (#c90a2a)
- **Fonts**: Oswald (headings), Roboto (body)
- **Style**: Dark mode, glassmorphism, mobile-first responsive

CSS variables defined in `app/globals.css`: `--nba-blue`, `--nba-red`, `--background`

## Constraints

- **TypeScript strict**: No `any` except with justifying comment
- **Mobile-first**: Test at 375px width minimum
- **Bundle awareness**: `players.json` is ~3MB; any data additions require justification
- **Offline-first solo**: Solo mode must work without network after initial load
- Refer to `contexte.md` for project continuity context and non-negotiable decisions

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PUSHER_KEY
PUSHER_SECRET
PUSHER_APP_ID
NEXT_PUBLIC_PUSHER_CLUSTER
```
