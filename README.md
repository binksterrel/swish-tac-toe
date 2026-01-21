# Swish Tac Toe 🏀

**Swish Tac Toe** is an interactive NBA trivia game inspired by "Tiki Taka Toe" and "Immaculate Grid". Test your basketball knowledge by filling a 3x3 grid with players who match the criteria (Teams, Awards, Stats, etc.) of the intersecting rows and columns.

## 🌟 Features

*   **Interactive 3x3 Grid**: Select players to fill cells based on dynamic criteria.
*   **Massive Player Database**: Includes thousands of NBA players (active and retired), powered by the official NBA API and Wikipedia data.
*   **Real-time Validation**: Instant feedback on whether a player matches the selected criteria.
*   **Difficulty Modes**:
    *   **Easy**: Standard team/award criteria.
    *   **Hard**: Includes deeper stats, international players, and decades played.
*   **Blind Mode**: Criteria are hidden until the game starts.
*   **Search**: Smarter player search that prevents spoilers (hides teams/status).
*   **Responsive Design**: Built for desktop and mobile play using Tailwind CSS.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Data Sources**:
    *   `nba_api` (Python)
    *   Wikipedia (Transfer scraping)
    *   Manual overrides for "Superstars"

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+
*   Python 3.9+ (for data scripts)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/binksterrel/swish-tac-toe.git
    cd swish-tac-toe
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📊 Data Management

The game relies on a rich dataset located in `lib/players.json`. We use several scripts to keep this data accurate and up-to-date.

### Key Scripts

*   **`scripts/fetch_awards.py`**:
    *   A Python script that iterates through the player database and fetches comprehensive award history (MVP, DPOY, All-Star, Championships, etc.) directly from the NBA Stats API.
    *   *Usage*: `python3 scripts/fetch_awards.py`
    *   *Note*: Includes rate-limiting and resume capability.

*   **`scripts/update-rosters-wiki-2024.js`** & **`2025.js`**:
    *   Node.js scripts to scrape Wikipedia transfer lists and apply roster moves to the database.

*   **`lib/additional-nba-data.ts`**:
    *   A manual override file ("God Mode") to ensure data accuracy for superstars and handle edge cases that APIs might miss.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
