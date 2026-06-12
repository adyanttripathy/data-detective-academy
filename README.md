# 🕵️ Data Detective Academy

**A data-analytics learning game for all ages — learn to read data the fun way.**

### ▶️ [PLAY NOW — one click, right in your browser](https://adyanttripathy.github.io/data-detective-academy/)

*(If the link 404s, GitHub Pages isn't enabled yet — see [Run it](#-getting-started) below.)*

Players take on the role of a rookie detective at the Data Detective Academy and crack **8 randomly generated mini-cases** per playthrough. Every case is a hands-on puzzle built on a real analytics skill, and every answer — right or wrong — ends with a **"Data Bite"** that explains the concept in plain language.

---

## 🎮 What you'll learn by playing

| Skill | What the game teaches | Example case |
|---|---|---|
| 📊 Chart reading | Comparing values and measuring gaps on bar charts | *"How many MORE Strawberry than Mint?"* |
| ➗ Averages | Mean vs. median, and why outliers make the mean lie | *"One kid is super rich — which number shows a TYPICAL kid?"* |
| 🎯 Outlier hunting | Spotting points that don't belong (tap them on a live scatter plot!) | *"One turtle had rocket skates…"* |
| 📈 Trend spotting | Seeing direction through random noise on line charts | *"Ignore the wiggles — what's the overall trend?"* |
| 🧠 Correlation vs. causation | Hunting hidden confounders behind "X causes Y" claims | *"Do umbrellas make streets wet?"* |

## ✨ Features

- **Three difficulty ranks** — 🌱 Rookie (ages 7+), 🔍 Sleuth (ages 11+), 🎓 Chief (teens & adults). Same skills, scaled complexity.
- **Endlessly replayable** — questions, numbers, and charts are randomly generated every game.
- **Streak bonuses** — consecutive correct answers earn growing point multipliers. 🔥
- **Your score IS a line chart** — the HUD draws your cumulative score live as you play. Meta, right?
- **Skill report card** — the end screen breaks down accuracy per skill so players see exactly what to practice.
- **Badges** — from 🌱 Data Rookie to 🏆 Chief Data Detective.
- **Zero dependencies beyond React** — all charts are hand-rolled inline SVG. No chart libraries.
- **Accessible by default** — keyboard focus styles and `prefers-reduced-motion` respected.

## 🚀 Getting started

`data-detective.jsx` is a **single self-contained React component** (default export, no required props).

### Option 1: Drop into an existing React app

```bash
cp data-detective.jsx src/DataDetective.jsx
```

```jsx
import DataDetective from "./DataDetective";

export default function Page() {
  return <DataDetective />;
}
```

### Option 2: Spin up a fresh project

```bash
npm create vite@latest data-detective -- --template react
cd data-detective && npm install
cp ../data-detective.jsx src/App.jsx
npm run dev
```

> **Note on styling:** the component uses a handful of Tailwind utility classes for layout plus inline styles for everything visual. With Tailwind installed it looks pixel-perfect; without it, it degrades gracefully since all colors, borders, and typography are inline. Fonts (Baloo 2, Nunito, Space Mono) load automatically from Google Fonts.

## 🧩 How it works

- **Question generators** (`genBar`, `genAverage`, `genOutlier`, `genTrend`, `genCorr`) produce randomized cases at three difficulty levels. Each returns a prompt, render data, the correct answer, and an educational "Data Bite."
- **Hand-rolled SVG charts** (`BarChart`, `LineChart`, `Scatter`, `ScoreSpark`) keep the bundle dependency-free; the scatter plot's dots are clickable and double as the answer input.
- **Scoring** = 10 points per correct answer + 2 × current streak.

## 🛠️ Customizing

Want to make it yours? The easy levers, all near the top of the file:

- `BAR_THEMES`, `TREND_THEMES`, `OUTLIER_THEMES` — swap in your own fun scenarios (classroom topics, company data, sports…).
- `CORR_SCENARIOS` — add more correlation-vs-causation dilemmas.
- `C` — the color palette (graph-paper blue, ink, marker yellow).
- `buildGame()` — change the question mix or game length (default: 8 cases).

## 💡 Ideas for contributions

- Pie chart reading cases · sample-size traps · misleading-axis detection
- Two-player pass-and-play mode
- Sound effects and a case-cracked animation
- Localization of prompts and Data Bites

---

Made with 📊 and ☕ — because the world creates 400+ million terabytes of data every day, and somebody has to learn to read it.
