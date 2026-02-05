# Product Requirements Document (PRD)

## Swish Tac Toe — NBA Grid Game

**Version**: 1.0
**Date**: 2026-02-04
**Statut**: Production
**URL**: https://swish-tac-toe.vercel.app

---

## 1. Vue d'ensemble

### 1.1 Qu'est-ce que Swish Tac Toe ?

Swish Tac Toe est un jeu de trivia NBA au format grille (inspiré de l'Immaculate Grid) où les joueurs doivent trouver des joueurs NBA correspondant simultanément aux critères de la ligne ET de la colonne de chaque cellule. Le jeu propose un mode solo avec plusieurs niveaux de difficulté et un mode multijoueur 1v1 en temps réel.

### 1.2 Proposition de valeur

| Problème | Solution |
|----------|----------|
| Les jeux de trivia classiques sont lents (appels serveur) | Validation 100% client-side, zéro latence (<16ms) |
| Pas d'interactivité en temps réel | Mode Battle 1v1 synchronisé via Pusher (<200ms) |
| Données NBA incomplètes ou obsolètes | Base de ~5000 joueurs (actifs + retraités) avec pipeline ETL |
| Expérience mobile dégradée | Design mobile-first, responsive, glassmorphism |

### 1.3 Utilisateurs cibles

- **Fans NBA casual** : Veulent tester leurs connaissances en mode Rookie
- **Passionnés NBA** : Cherchent le défi en mode Pro/Legend
- **Joueurs compétitifs** : Veulent affronter des amis en Battle Mode
- **Francophonie NBA** : Interface bilingue FR/EN

---

## 2. Stack technique

| Couche | Technologie |
|--------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Langage** | TypeScript 5 (strict mode) |
| **UI** | React 19, Tailwind CSS 4, Radix UI / Shadcn |
| **Animations** | Framer Motion 12 |
| **Base de données** | Supabase (PostgreSQL + Auth) |
| **Temps réel** | Pusher.js 8 |
| **Graphiques** | Recharts 2 |
| **Tests** | Jest 30 + Playwright 1.49 |
| **Déploiement** | Vercel (serverless + CDN) |
| **Données joueurs** | ~3MB JSON statique embarqué au build (~5000 joueurs) |

---

## 3. Architecture fonctionnelle

### 3.1 Modes de jeu solo

#### 3.1.1 Difficultés

| Niveau | Critères disponibles | Public cible |
|--------|---------------------|--------------|
| **ROOKIE** | Équipes populaires, récompenses majeures (MVP, Champion, All-Star) | Débutants |
| **PRO** | Toutes les équipes + récompenses + positions + stats (PPG/RPG/APG) | Intermédiaires |
| **LEGEND** | Tout : équipes, récompenses, positions, stats, décennies, pays | Experts |

#### 3.1.2 Modes de jeu

| Mode | Règle | Détail |
|------|-------|--------|
| **Classic** | Remplir la grille, 15 tentatives max | Rythme libre |
| **Time Attack** | Compte à rebours (90s pour 3x3, 300s pour 5x5) | Vitesse requise |
| **Sudden Death** | 1 erreur = Game Over | Zéro droit à l'erreur |
| **Blind** | Critères cachés (affichent `?`) | Déduction uniquement |

#### 3.1.3 Tailles de grille

- **3x3** : 15 tentatives max (standard)
- **4x4** : 25 tentatives max
- **5x5** : 40 tentatives max

### 3.2 Mode Battle (Multijoueur)

- **Format** : 1v1 tour par tour, Best-of-5 rounds
- **Création de salle** : Code 4 caractères (ex: "NBA-ABCD")
- **Tour** : 60 secondes max par joueur
- **Synchronisation** : Supabase (état) + Pusher (événements temps réel)
- **Fonctionnalités** :
  - Chat en temps réel
  - Vote pour passer une grille (unanimité requise)
  - Revanche sans quitter la salle
  - Mode local (hors-ligne, même appareil)

### 3.3 Mode "Guess the Player"

- Jeu de devinette en carrousel
- Indices progressifs basés sur la carrière du joueur
- Mode séparé accessible depuis `/guess`

### 3.4 Base de données joueurs

- Encyclopédie consultable de ~5000 joueurs NBA
- Recherche fuzzy avec classement par pertinence
- Accessible depuis `/players`

### 3.5 Statistiques & Historique

- **Stats personnelles** : Dashboard avec graphiques (Recharts)
- **Historique de parties** : Sauvegardé en localStorage
- Accessible depuis `/stats` et `/games`

---

## 4. Modèle de données

### 4.1 Joueur NBA (`NBAPlayer`)

```typescript
{
  id: string               // Identifiant unique (slug)
  name: string             // Nom complet
  teams: string[]          // Codes équipes (carrière)
  awards: string[]         // Récompenses
  allStar: boolean
  champion: boolean
  championYears: string[]
  mvp: boolean
  dpoy: boolean
  roy: boolean
  allNBA: boolean
  allDefensive: boolean
  college: string
  country: string
  decades: string[]        // ["2000s", "2010s"]
  ppgCareer: number        // Points par match (carrière)
  rpgCareer: number        // Rebonds par match
  apgCareer: number        // Assists par match
  position: string         // PG, SG, SF, PF, C
  nbaId?: string           // ID officiel NBA (pour photos)
  active?: boolean
}
```

### 4.2 Types de critères

| Catégorie | Exemples |
|-----------|----------|
| **Équipe** | LAL, BOS, GSW, CHI... (30 franchises + historiques) |
| **Récompenses** | MVP, DPOY, ROY, Champion, All-Star, All-NBA, All-Defensive |
| **Statistiques** | PPG ≥ 20, RPG ≥ 8, APG ≥ 5 |
| **Position** | PG, SG, SF, PF, C |
| **Décennie** | 1990s, 2000s, 2010s, 2020s |
| **Origine** | International vs USA |
| **Draft** | #1 Pick, Top 3 Pick, etc. |

### 4.3 Pipeline de données

```
NBA Stats API → Scripts Python/TS → Données brutes
    ↓
Wikipedia Scraping → Corrections manuelles (additional-nba-data.ts)
    ↓
Validation & Merge (scripts/audit-*.ts)
    ↓
players.json (~3MB, ~5000 joueurs)
    ↓
Embarqué au build Next.js → Client-side (zéro appel API en jeu)
```

---

## 5. Mécanique de jeu (détaillée)

### 5.1 Flux de validation

1. Le joueur clique sur une cellule → Modal de recherche s'ouvre
2. Recherche fuzzy parmi ~5000 joueurs (résultats en <16ms)
3. Sélection d'un joueur
4. Validation : `matchesCriteria(player, rowCriteria) && matchesCriteria(player, colCriteria)`
5. **Correct** → Cellule verte, photo du joueur affichée
6. **Incorrect** → Flash rouge, tentative consommée

### 5.2 Consolidation des franchises

Les équipes historiques sont mappées vers les franchises modernes :
- Seattle SuperSonics → OKC Thunder
- New Jersey Nets → Brooklyn Nets
- Vancouver Grizzlies → Memphis Grizzlies
- etc.

### 5.3 Scoring

- Score de base : 100 points
- Pénalités selon la difficulté
- Bonus de vitesse (Time Attack)
- Bonus "Unicorn" pour les correspondances rares (joueur très rarement lié au critère)

### 5.4 Conditions de fin

- **Victoire** : Toutes les cellules remplies correctement
- **Défaite** : Plus de tentatives disponibles
- **Time Out** : Temps écoulé (Time Attack)
- **Sudden Death** : Première erreur

---

## 6. Design & UX

### 6.1 Identité visuelle

| Élément | Valeur |
|---------|--------|
| **Background** | Noir pur (#000000) |
| **NBA Blue** | #0d47a1 |
| **NBA Red** | #c90a2a |
| **Texte** | Blanc (#ffffff) |
| **Font titres** | Oswald (bold, italic, uppercase) |
| **Font corps** | Roboto |
| **Style** | Glassmorphism, high contrast, dark theme |

### 6.2 Composants clés

| Composant | Description |
|-----------|-------------|
| `NBATicker` | Bandeau de scores NBA en temps réel (en haut) |
| `Header` | Navigation : Play, Players, Stats, Login |
| `GameGrid` | Grille 3x3/4x4/5x5 avec headers de critères |
| `PlayerInput` | Modal de recherche avec suggestions |
| `CriteriaHeader` | Logos équipes, drapeaux pays, icônes récompenses |
| `GameCell` | Photo joueur avec bandeau nom |
| `ScorePanel` | Score, tentatives restantes, timer |
| `GameOverModal` | Écran victoire/défaite avec breakdown |
| `BattleLobby` | Création/rejoindre une salle Battle |
| `BattleChat` | Chat temps réel pendant les battles |

### 6.3 Responsive

- **Mobile-first** : Optimisé pour smartphones
- **3x3** : max-width 32rem
- **4x4** : max-width 56rem
- **5x5** : max-width 80rem
- Gap adaptatif : 0.25rem (mobile) → 0.5rem (desktop)

### 6.4 Animations

- Framer Motion pour les transitions
- Keyframes Tailwind : pulse, bounce, zoom, fade
- Effet "shine" sur les boutons CTA
- Survol de cellule avec highlight subtil

---

## 7. Gestion d'état

### 7.1 Solo (`useGameState` hook)

```typescript
GameState {
  grid: CellState[][]          // Matrice de cellules
  rows: Criteria[]             // Critères des lignes
  cols: Criteria[]             // Critères des colonnes
  score: number
  attempts: number
  maxAttempts: number
  usedPlayers: Set<string>     // Joueurs déjà utilisés
  selectedCell: { row, col }
  gameOver: boolean
  won: boolean
  difficulty: "easy" | "medium" | "hard"
  mode: "classic" | "time_attack" | "sudden_death" | "blind"
  timeLeft: number
  gridSize: number             // 3, 4 ou 5
}
```

**Persistance** : `localStorage` (clé `nba-ttt-game`), survit au refresh.

### 7.2 Battle (Supabase + Pusher)

- **Source de vérité** : Host (Supabase row)
- **Synchronisation** : Pusher events (<200ms)
- **UI optimiste** : Mise à jour locale immédiate, vérifiée par serveur

### 7.3 Contextes React

- `LanguageProvider` : i18n FR/EN avec fonction `t()`
- `AuthProvider` : Session Supabase, signIn/signOut

---

## 8. API Routes (Backend)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/battle/create` | POST | Créer une salle de battle |
| `/api/battle/join` | POST | Rejoindre une salle |
| `/api/battle/move` | POST | Exécuter un mouvement (authoritative) |
| `/api/battle/chat` | POST | Envoyer un message chat |
| `/api/battle/skip-vote` | POST | Voter pour passer la grille |
| `/api/battle/rematch` | POST | Lancer une revanche |
| `/api/cron/*` | GET | Jobs de nettoyage automatique |

---

## 9. Internationalisation

- **Langues supportées** : Français, English
- **Fichier** : `lib/translations.ts`
- **Mécanisme** : Context React `LanguageProvider` avec fonction `t(key)`
- **Toggle** : Composant `LanguageToggle` dans le header

---

## 10. Tests

| Type | Outil | Couverture |
|------|-------|------------|
| **Unitaire** | Jest 30 | Logique de jeu, validation, recherche |
| **E2E** | Playwright 1.49 | Flux de jeu complets, navigation |
| **Manuel** | Scripts d'audit | Intégrité des données joueurs |

---

## 11. Infrastructure & Déploiement

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Vercel     │────▶│   Supabase   │────▶│  Pusher    │
│  (Frontend   │     │ (PostgreSQL  │     │ (WebSocket │
│   + API)     │     │  + Auth)     │     │  Events)   │
└─────────────┘     └──────────────┘     └────────────┘
       │
       ▼
  CDN mondial
  (assets statiques)
```

**Variables d'environnement requises** :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_PUSHER_KEY`
- `PUSHER_SECRET`

---

## 12. Limites connues

### 12.1 Données

- Mises à jour manuelles via scripts ETL (pas de sync temps réel avec la NBA)
- Les trades/rookies récents peuvent avoir un délai
- Le fichier `players.json` (~3MB) alourdit le bundle initial

### 12.2 Multijoueur

- Nécessite Supabase + Pusher (pas 100% offline)
- Uniquement synchrone (pas de tours asynchrones)
- Maximum 2 joueurs par battle

### 12.3 Plateforme

- NBA uniquement (pas de WNBA, Euroleague)
- Pas de puzzle quotidien/saisonnier
- Pas de leaderboard persistant global
- Pas de PWA/app mobile native

### 12.4 Technique

- `lib/nba-data.ts` fait ~28K lignes (devrait être découpé en modules)
- Historique des parties en localStorage uniquement (pas de backup cloud)
- Support navigateurs modernes uniquement (ES2020+)

---

## 13. Roadmap proposée

### Phase 1 — Consolidation
- [ ] Découper `nba-data.ts` en modules (data, criteria, search, validation)
- [ ] Migrer l'historique des parties vers Supabase (backup cloud)
- [ ] Augmenter la couverture de tests (unitaires + E2E)
- [ ] Optimiser le bundle (lazy-load `players.json`, code splitting)

### Phase 2 — Engagement
- [ ] **Puzzle quotidien** : Grille du jour identique pour tous les joueurs
- [ ] **Leaderboard global** : Classement persistant (Supabase)
- [ ] **Système de streaks** : Jours consécutifs de jeu
- [ ] **Partage social** : Résultats partageables (image générée)

### Phase 3 — Expansion
- [ ] **PWA** : Installation mobile, notifications push
- [ ] **Tournois** : Brackets multijoueurs (8/16 joueurs)
- [ ] **Nouvelles ligues** : WNBA, Euroleague (architecture extensible)
- [ ] **Mode spectateur** : Regarder des battles en direct

### Phase 4 — Monétisation (optionnel)
- [ ] **Comptes premium** : Stats avancées, thèmes custom
- [ ] **Puzzle sponsorisé** : Partenariats NBA/équipes
- [ ] **API publique** : Accès aux données pour développeurs tiers

---

## 14. Métriques de succès

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| **Latence validation** | <20ms | Performance client-side |
| **Latence battle sync** | <300ms | Pusher round-trip |
| **Taux de rétention J7** | >30% | Analytics |
| **Parties/utilisateur/jour** | >2 | localStorage + Supabase |
| **Taux de complétion grille** | >60% (Rookie) | Scoring data |
| **NPS** | >50 | Feedback utilisateur |

---

*Document généré le 2026-02-04. Basé sur l'analyse complète du codebase Swish Tac Toe v0.1.0.*
