# Swish Tac Toe 🏀

**Swish Tac Toe** est un jeu interactif de trivia NBA inspiré du "Tiki Taka Toe" et de l'"Immaculate Grid". Testez vos connaissances en basketball en remplissant une grille 3x3 avec des joueurs correspondant aux critères (Équipes, Récompenses, Stats, etc.) des lignes et colonnes qui se croisent.

## 🌟 Fonctionnalités

*   **Grille Interactive 3x3** : Sélectionnez des joueurs pour remplir les cases en fonction de critères dynamiques.
*   **Base de Données Massive** : Comprend des milliers de joueurs NBA (actifs et retraités), alimentée par l'API officielle de la NBA et les données Wikipédia.
*   **Validation en Temps Réel** : Feedback instantané pour savoir si un joueur correspond aux critères sélectionnés.
*   **Modes de Difficulté** :
    *   **Facile** : Critères standards d'équipes et de récompenses.
    *   **Difficile** : Inclut des statistiques plus poussées, les joueurs internationaux et les décennies de jeu.
*   **Mode Aveugle** : Les critères sont cachés jusqu'au lancement de la partie.
*   **Recherche Intelligente** : Recherche de joueurs optimisée pour éviter les spoils (masquage des équipes/statuts).
*   **Design Responsive** : Conçu pour être joué sur ordinateur et mobile grâce à Tailwind CSS.

## 🛠️ Stack Technique

*   **Framework** : [Next.js](https://nextjs.org/) (App Router)
*   **Langage** : TypeScript
*   **Style** : Tailwind CSS
*   **Icônes** : Lucide React
*   **Sources de Données** :
    *   `nba_api` (Python)
    *   Wikipédia (Scraping des transferts)
    *   Surcharges manuelles pour les "Superstars"

## 🚀 Installation

### Prérequis

*   Node.js 18+
*   Python 3.9+ (pour les scripts de données)

### Pour commencer

1.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/binksterrel/swish-tac-toe.git
    cd swish-tac-toe
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

4.  Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📊 Gestion des Données

Le jeu repose sur un riche jeu de données situé dans `lib/players.json`. Nous utilisons plusieurs scripts pour garder ces données précises et à jour.

### Scripts Clés

*   **`scripts/fetch_awards.py`** :
    *   Un script Python qui itère sur la base de joueurs et récupère l'historique complet des récompenses (MVP, DPOY, All-Star, Titres, etc.) directement depuis l'API NBA Stats.
    *   *Usage* : `python3 scripts/fetch_awards.py`
    *   *Note* : Inclut une gestion du rate-limiting et une capacité de reprise (resume).

*   **`scripts/update-rosters-wiki-2024.js`** & **`2025.js`** :
    *   Scripts Node.js pour scraper les listes de transferts Wikipédia et appliquer les mouvements d'effectifs à la base de données.

*   **`lib/additional-nba-data.ts`** :
    *   Un fichier de surcharge manuelle ("God Mode") pour assurer la précision des données pour les superstars et gérer les cas particuliers que les API pourraient manquer.

## 🤝 Contribuer

Les contributions, problèmes et demandes de fonctionnalités sont les bienvenus !

1.  Forker le projet
2.  Créer votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3.  Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4.  Pusher vers la branche (`git push origin feature/AmazingFeature`)
5.  Ouvrir une Pull Request

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
