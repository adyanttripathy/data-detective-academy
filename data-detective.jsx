import React, { useState, useMemo } from "react";

/* ============================================================
   DATA DETECTIVE ACADEMY
   A data-analytics learning game for all ages.
   Signature: your score is itself a live line chart.
   ============================================================ */

const C = {
  ink: "#16243D",
  paper: "#F4F8FF",
  grid: "#D9E5F6",
  yellow: "#FFC83D",
  coral: "#FF5D5D",
  green: "#17B978",
  blue: "#3D7BFF",
  violet: "#8A5CF6",
};

/* ---------------- helpers ---------------- */
const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[ri(0, arr.length - 1)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = ri(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------------- fun themes ---------------- */
const BAR_THEMES = [
  { title: "Lemonade stand sales 🍋", items: ["Classic", "Strawberry", "Mint", "Mango", "Fizzy"] },
  { title: "Dragon eggs collected 🐉", items: ["Red", "Gold", "Ice", "Storm", "Moss"] },
  { title: "Pizza slices eaten 🍕", items: ["Cheese", "Pepperoni", "Veggie", "Hawaiian", "BBQ"] },
  { title: "Arcade high scores 🕹️", items: ["Maya", "Leo", "Zara", "Kai", "Noor"] },
  { title: "Books read this month 📚", items: ["Comics", "Mystery", "Sci-fi", "Fantasy", "Sports"] },
];

const TREND_THEMES = [
  "Daily visitors to the robot zoo 🤖",
  "Cupcakes sold each week 🧁",
  "Steps walked each day 👟",
  "Plants sprouting in the garden 🌱",
  "Songs streamed per day 🎧",
];

const OUTLIER_THEMES = [
  "Race times of turtles 🐢 — one had rocket skates!",
  "Daily temperatures 🌡️ — one reading looks broken.",
  "Test scores in class 📝 — someone had a wild day.",
  "Pumpkin weights at the fair 🎃 — one is suspicious.",
];

const CORR_SCENARIOS = [
  {
    prompt: "Ice cream sales 🍦 and sunburns 🔥 both go UP in the same months. Does ice cream cause sunburns?",
    options: [
      "Yes — ice cream causes sunburns",
      "No — hot sunny weather causes both",
      "No — sunburns cause ice cream cravings only",
      "We can't say anything at all",
    ],
    answer: 1,
    bite: "This is a classic CONFOUNDER: a hidden third thing (sunny weather ☀️) drives both. Correlation ≠ causation!",
  },
  {
    prompt: "Fires with MORE firefighters 🚒 have MORE damage. Should we send fewer firefighters?",
    options: [
      "Yes — firefighters cause damage",
      "No — bigger fires need more firefighters AND cause more damage",
      "Yes — data never lies",
      "No — damage attracts firefighters after it happens",
    ],
    answer: 1,
    bite: "Fire SIZE is the hidden cause behind both numbers. Always ask: what third factor could explain this?",
  },
  {
    prompt: "Kids with bigger shoe sizes 👟 tend to read better 📖. Do big feet make you smarter?",
    options: [
      "Yes — buy bigger shoes!",
      "No — older kids have bigger feet AND read better",
      "Yes — but only for sneakers",
      "No — reading shrinks your feet",
    ],
    answer: 1,
    bite: "AGE is the confounder here. Spotting hidden variables is a data detective's superpower. 🕵️",
  },
  {
    prompt: "Cities with more libraries 📚 also have more crime. Should we close libraries to fight crime?",
    options: [
      "Yes — libraries are dangerous",
      "No — bigger cities simply have more of BOTH",
      "Yes — books distract the police",
      "No — crime builds libraries",
    ],
    answer: 1,
    bite: "Population size lurks behind both numbers. Comparing RATES (per person) beats comparing raw totals.",
  },
  {
    prompt: "On days when more umbrellas ☂️ are open, the streets are wetter. Do umbrellas make streets wet?",
    options: [
      "Yes — umbrellas drip a lot",
      "No — rain causes both umbrellas AND wet streets",
      "Yes — proven by the data",
      "No — wet streets cause umbrellas to open",
    ],
    answer: 1,
    bite: "Rain 🌧️ is the common cause. When two things move together, hunt for what's driving BOTH.",
  },
];

const BITES = {
  barMax: "Bar charts make comparisons instant: the eye judges LENGTH better than almost anything else. That's why they're a data analyst's best friend.",
  barDiff: "Reading the GAP between bars is real analysis — analysts call this comparing values, the first step of every report.",
  mean: "The MEAN (average) = add everything up ➗ divide by how many. It's the 'fair share' if everyone got an equal amount.",
  median: "The MEDIAN is the middle value when sorted. Half the data sits below it, half above — it ignores wild extremes.",
  meanVsMedian: "One huge outlier can drag the mean way up, but the median barely moves. That's why house prices and salaries are usually reported as medians!",
  outlier: "An OUTLIER is a point far from the pack. It might be an error… or the most interesting discovery in your data. Always investigate!",
  trendUp: "An upward TREND means values grow over time, even with bumps. Analysts look past the noise to see the direction.",
  trendDown: "A downward TREND means values shrink over time. Spotting it early lets people act before it's too late.",
  trendFlat: "A FLAT trend means things are stable — the wiggles are just random noise, not a real change.",
};

/* ---------------- question generators ---------------- */
function genBar(diff) {
  const theme = pick(BAR_THEMES);
  const n = diff === "rookie" ? 4 : 5;
  const labels = theme.items.slice(0, n);
  let values;
  do {
    values = labels.map(() => ri(2, diff === "chief" ? 18 : 12));
  } while (new Set(values).size !== values.length);
  const maxIdx = values.indexOf(Math.max(...values));
  const minIdx = values.indexOf(Math.min(...values));

  if (diff !== "rookie" && Math.random() < 0.5) {
    const a = maxIdx, b = minIdx;
    const correct = values[a] - values[b];
    const opts = shuffle([correct, correct + ri(1, 3), Math.max(1, correct - ri(1, 3)), correct + ri(4, 6)].map(String));
    return {
      kind: "bar", skill: "Chart reading", title: theme.title,
      prompt: `How many MORE does “${labels[a]}” have than “${labels[b]}”?`,
      labels, values, options: opts, answer: opts.indexOf(String(correct)),
      bite: BITES.barDiff,
    };
  }
  const askMax = Math.random() < 0.6;
  return {
    kind: "bar", skill: "Chart reading", title: theme.title,
    prompt: askMax ? "Which one is the BIGGEST?" : "Which one is the SMALLEST?",
    labels, values, options: labels, answer: askMax ? maxIdx : minIdx,
    bite: BITES.barMax,
  };
}

function genAverage(diff) {
  if (diff === "rookie") {
    const base = ri(3, 8);
    const nums = [base - 1, base, base + 1];
    const opts = shuffle([base, base + 1, base - 1, base + 2].map(String));
    return {
      kind: "numbers", skill: "Averages", title: "Cookie counting 🍪",
      prompt: `Three friends ate ${nums.join(", ")} cookies. What's the MEAN (average)?`,
      nums, options: opts, answer: opts.indexOf(String(base)), bite: BITES.mean,
    };
  }
  if (diff === "sleuth") {
    const sorted = Array.from({ length: 5 }, () => ri(2, 20)).sort((a, b) => a - b);
    const med = sorted[2];
    const wrongs = new Set([med + 1, Math.max(1, med - 1), sorted[3]]);
    wrongs.delete(med);
    const opts = shuffle([med, ...[...wrongs].slice(0, 3)].map(String));
    return {
      kind: "numbers", skill: "Averages", title: "Game scores 🎮",
      prompt: `Scores this week: ${shuffle(sorted).join(", ")}. What's the MEDIAN?`,
      nums: sorted, options: opts, answer: opts.indexOf(String(med)), bite: BITES.median,
    };
  }
  const nums = [ri(4, 9), ri(4, 9), ri(5, 10), ri(5, 10), ri(60, 90)];
  return {
    kind: "numbers", skill: "Averages", title: "Allowance survey 💰",
    prompt: `Weekly allowances: ${nums.join(", ")} dollars. One kid is super rich! Which number best shows a TYPICAL kid?`,
    nums,
    options: ["The mean — it counts everyone", "The median — it ignores the extreme", "The maximum", "The total"],
    answer: 1, bite: BITES.meanVsMedian,
  };
}

function genOutlier() {
  const cx = ri(30, 50), cy = ri(40, 60);
  const pts = Array.from({ length: 9 }, () => ({
    x: cx + ri(-12, 12), y: cy + ri(-12, 12),
  }));
  const corner = pick([{ x: ri(80, 92), y: ri(8, 20) }, { x: ri(82, 92), y: ri(78, 90) }, { x: ri(6, 14), y: ri(6, 16) }]);
  const outlierIdx = ri(0, pts.length);
  pts.splice(outlierIdx, 0, corner);
  return {
    kind: "outlier", skill: "Outliers", title: pick(OUTLIER_THEMES),
    prompt: "Tap the OUTLIER — the dot that doesn't belong with the pack!",
    points: pts, outlierIdx, bite: BITES.outlier,
  };
}

function genTrend(diff) {
  const dir = pick(["up", "down", "flat"]);
  const n = 8;
  const noise = diff === "chief" ? 9 : 5;
  const slope = dir === "up" ? 7 : dir === "down" ? -7 : 0;
  const start = dir === "down" ? 70 : 25;
  const values = Array.from({ length: n }, (_, i) =>
    Math.max(5, Math.min(95, start + slope * i + ri(-noise, noise)))
  );
  const labelMap = { up: "Going UP 📈", down: "Going DOWN 📉", flat: "Staying FLAT ➡️" };
  const options = ["Going UP 📈", "Going DOWN 📉", "Staying FLAT ➡️"];
  return {
    kind: "trend", skill: "Trends", title: pick(TREND_THEMES),
    prompt: "Ignore the wiggles — what's the overall TREND?",
    values, options, answer: options.indexOf(labelMap[dir]),
    bite: dir === "up" ? BITES.trendUp : dir === "down" ? BITES.trendDown : BITES.trendFlat,
  };
}

function genCorr(usedRef) {
  const remaining = CORR_SCENARIOS.filter((_, i) => !usedRef.has(i));
  const pool = remaining.length ? remaining : CORR_SCENARIOS;
  const sc = pick(pool);
  usedRef.add(CORR_SCENARIOS.indexOf(sc));
  const order = shuffle(sc.options.map((o, i) => i));
  return {
    kind: "corr", skill: "Cause vs correlation", title: "Detective dilemma 🕵️",
    prompt: sc.prompt,
    options: order.map((i) => sc.options[i]),
    answer: order.indexOf(sc.answer),
    bite: sc.bite,
  };
}

function buildGame(diff) {
  const usedCorr = new Set();
  const makers = shuffle([
    () => genBar(diff), () => genBar(diff),
    () => genAverage(diff), () => genAverage(diff),
    () => genOutlier(), () => genOutlier(),
    () => genTrend(diff),
    () => genCorr(usedCorr), () => genCorr(usedCorr),
  ]);
  return [() => genTrend(diff), ...makers].map((f) => f()).slice(0, 8);
}

/* ---------------- SVG charts ---------------- */
function BarChart({ labels, values, accent }) {
  const max = Math.max(...values);
  const bw = 100 / values.length;
  const colors = [C.blue, C.coral, C.green, C.violet, C.yellow];
  return (
    <svg viewBox="0 0 100 64" className="w-full" style={{ maxHeight: 220 }}>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2="100" y1={54 - 48 * g} y2={54 - 48 * g} stroke={C.grid} strokeWidth="0.5" />
      ))}
      {values.map((v, i) => {
        const h = (v / max) * 48;
        return (
          <g key={i}>
            <rect x={i * bw + bw * 0.18} y={54 - h} width={bw * 0.64} height={h} rx="1.6" fill={colors[i % colors.length]} />
            <text x={i * bw + bw / 2} y={52 - h} textAnchor="middle" fontSize="4.4" fontWeight="700" fill={C.ink} fontFamily="'Space Mono', monospace">{v}</text>
            <text x={i * bw + bw / 2} y={61} textAnchor="middle" fontSize="3.8" fill={C.ink} fontFamily="'Nunito', sans-serif">{labels[i]}</text>
          </g>
        );
      })}
      <line x1="0" x2="100" y1="54" y2="54" stroke={C.ink} strokeWidth="0.8" />
    </svg>
  );
}

function LineChart({ values }) {
  const n = values.length;
  const pts = values.map((v, i) => `${(i / (n - 1)) * 92 + 4},${58 - (v / 100) * 50}`).join(" ");
  return (
    <svg viewBox="0 0 100 64" className="w-full" style={{ maxHeight: 220 }}>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1="4" x2="96" y1={58 - 50 * g} y2={58 - 50 * g} stroke={C.grid} strokeWidth="0.5" />
      ))}
      <polyline points={pts} fill="none" stroke={C.blue} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (n - 1)) * 92 + 4} cy={58 - (v / 100) * 50} r="1.7" fill={C.yellow} stroke={C.ink} strokeWidth="0.6" />
      ))}
      <line x1="4" x2="96" y1="58" y2="58" stroke={C.ink} strokeWidth="0.8" />
    </svg>
  );
}

function Scatter({ points, outlierIdx, picked, revealed, onPick }) {
  return (
    <svg viewBox="0 0 100 96" className="w-full" style={{ maxHeight: 260 }}>
      {[20, 40, 60, 80].map((g) => (
        <g key={g}>
          <line x1="0" x2="100" y1={g} y2={g} stroke={C.grid} strokeWidth="0.5" />
          <line y1="0" y2="96" x1={g} x2={g} stroke={C.grid} strokeWidth="0.5" />
        </g>
      ))}
      {points.map((p, i) => {
        let fill = C.blue;
        if (revealed) {
          if (i === outlierIdx) fill = C.green;
          else if (i === picked) fill = C.coral;
        } else if (i === picked) fill = C.yellow;
        return (
          <circle
            key={i} cx={p.x} cy={p.y} r={revealed && i === outlierIdx ? 5 : 3.6}
            fill={fill} stroke={C.ink} strokeWidth="0.8"
            style={{ cursor: revealed ? "default" : "pointer", transition: "all .2s" }}
            onClick={() => !revealed && onPick(i)}
          />
        );
      })}
    </svg>
  );
}

function ScoreSpark({ history }) {
  const cum = [0];
  history.forEach((h) => cum.push(cum[cum.length - 1] + h.pts));
  const max = Math.max(20, ...cum);
  const n = Math.max(cum.length, 9);
  const pts = cum.map((v, i) => `${(i / (n - 1)) * 96 + 2},${26 - (v / max) * 22}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className="w-full" style={{ maxHeight: 60 }}>
      <line x1="2" x2="98" y1="26" y2="26" stroke={C.grid} strokeWidth="1" />
      <polyline points={pts} fill="none" stroke={C.green} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {cum.length > 1 && (
        <circle cx={((cum.length - 1) / (n - 1)) * 96 + 2} cy={26 - (cum[cum.length - 1] / max) * 22} r="2.6" fill={C.yellow} stroke={C.ink} strokeWidth="0.8" />
      )}
    </svg>
  );
}

/* ---------------- main app ---------------- */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [diff, setDiff] = useState("rookie");
  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [choice, setChoice] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const q = questions[qi];

  const start = (d) => {
    setDiff(d);
    setQuestions(buildGame(d));
    setQi(0); setScore(0); setStreak(0); setBestStreak(0);
    setHistory([]); setChoice(null); setRevealed(false);
    setScreen("play");
  };

  const submit = (idx) => {
    if (revealed) return;
    const correct = q.kind === "outlier" ? idx === q.outlierIdx : idx === q.answer;
    const pts = correct ? 10 + streak * 2 : 0;
    const ns = correct ? streak + 1 : 0;
    setChoice(idx);
    setRevealed(true);
    setScore((s) => s + pts);
    setStreak(ns);
    setBestStreak((b) => Math.max(b, ns));
    setHistory((h) => [...h, { correct, pts, skill: q.skill }]);
  };

  const next = () => {
    if (qi + 1 >= questions.length) setScreen("end");
    else { setQi(qi + 1); setChoice(null); setRevealed(false); }
  };

  const skillStats = useMemo(() => {
    const m = {};
    history.forEach((h) => {
      m[h.skill] = m[h.skill] || { ok: 0, total: 0 };
      m[h.skill].total++;
      if (h.correct) m[h.skill].ok++;
    });
    return m;
  }, [history]);

  const accuracy = history.length ? Math.round((history.filter((h) => h.correct).length / history.length) * 100) : 0;
  const badge =
    accuracy === 100 ? { e: "🏆", t: "Chief Data Detective" } :
    accuracy >= 75 ? { e: "🥇", t: "Insight Hunter" } :
    accuracy >= 50 ? { e: "🔍", t: "Pattern Spotter" } :
    { e: "🌱", t: "Data Rookie — keep going!" };

  const wrap = {
    minHeight: "100vh",
    background: `${C.paper}`,
    backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
    backgroundSize: "26px 26px",
    color: C.ink,
    fontFamily: "'Nunito', sans-serif",
  };
  const card = {
    background: "#fff",
    border: `3px solid ${C.ink}`,
    borderRadius: 18,
    boxShadow: `6px 6px 0 ${C.ink}`,
  };
  const btn = (bg) => ({
    background: bg, color: C.ink, border: `3px solid ${C.ink}`,
    borderRadius: 14, boxShadow: `4px 4px 0 ${C.ink}`,
    fontFamily: "'Baloo 2', sans-serif", fontWeight: 700,
    transition: "transform .1s, box-shadow .1s", cursor: "pointer",
  });

  return (
    <div style={wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        .dd-btn:active { transform: translate(3px,3px); box-shadow: 1px 1px 0 ${C.ink} !important; }
        .dd-btn:focus-visible { outline: 3px dashed ${C.blue}; outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ============ HOME ============ */}
        {screen === "home" && (
          <div className="flex flex-col gap-6">
            <div style={card} className="p-6 sm:p-8 text-center">
              <div style={{ fontFamily: "'Space Mono', monospace", letterSpacing: 2 }} className="text-xs mb-2">
                CASE FILE Nº 001 — OPEN
              </div>
              <h1 style={{ fontFamily: "'Baloo 2', sans-serif", lineHeight: 1.05 }} className="text-4xl sm:text-5xl font-extrabold">
                Data Detective<br />
                <span style={{ background: C.yellow, padding: "0 10px", borderRadius: 8, display: "inline-block", transform: "rotate(-1.5deg)" }}>Academy</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg font-semibold">
                🕵️ Crack 8 mini-cases by reading charts, spotting outliers, taming averages, and busting fake "causes."
                Every answer teaches a real analytics skill!
              </p>
            </div>

            <div style={card} className="p-6">
              <div style={{ fontFamily: "'Baloo 2', sans-serif" }} className="text-xl font-bold mb-3">Pick your rank:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { d: "rookie", e: "🌱", t: "Rookie", s: "Ages 7+ · gentle numbers" },
                  { d: "sleuth", e: "🔍", t: "Sleuth", s: "Ages 11+ · medians & gaps" },
                  { d: "chief", e: "🎓", t: "Chief", s: "Teens & adults · tricky data" },
                ].map((o) => (
                  <button key={o.d} className="dd-btn p-4 text-left" style={btn(o.d === "rookie" ? "#CFF5E4" : o.d === "sleuth" ? "#FFE9A8" : "#E4D9FF")} onClick={() => start(o.d)}>
                    <div className="text-3xl">{o.e}</div>
                    <div className="text-lg">{o.t}</div>
                    <div className="text-xs font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>{o.s}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...card, background: C.ink, color: "#fff" }} className="p-5">
              <div style={{ fontFamily: "'Space Mono', monospace" }} className="text-xs mb-1">DID YOU KNOW?</div>
              <div className="font-semibold">The world creates over 400 million terabytes of data every day — detectives who can read it run the show. 📊</div>
            </div>
          </div>
        )}

        {/* ============ PLAY ============ */}
        {screen === "play" && q && (
          <div className="flex flex-col gap-4">
            {/* HUD */}
            <div style={card} className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div style={{ fontFamily: "'Space Mono', monospace" }} className="text-sm font-bold">
                  CASE {qi + 1}/{questions.length}
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ background: C.yellow, border: `2px solid ${C.ink}`, borderRadius: 10, padding: "2px 10px", fontFamily: "'Baloo 2', sans-serif" }} className="font-bold">
                    ⭐ {score}
                  </span>
                  <span style={{ background: streak > 1 ? "#FFD9D9" : "#EEF3FB", border: `2px solid ${C.ink}`, borderRadius: 10, padding: "2px 10px", fontFamily: "'Baloo 2', sans-serif" }} className="font-bold">
                    🔥 {streak}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <div style={{ fontFamily: "'Space Mono', monospace" }} className="text-[10px] mb-1">YOUR SCORE — AS A LINE CHART (meta, right?)</div>
                <ScoreSpark history={history} />
              </div>
            </div>

            {/* Question */}
            <div style={card} className="p-5 sm:p-6">
              <div style={{ fontFamily: "'Space Mono', monospace", color: C.blue }} className="text-xs font-bold mb-1">
                SKILL: {q.skill.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Baloo 2', sans-serif" }} className="text-xl sm:text-2xl font-bold">{q.title}</div>
              <p className="mt-1 font-semibold">{q.prompt}</p>

              <div className="mt-4">
                {q.kind === "bar" && <BarChart labels={q.labels} values={q.values} />}
                {q.kind === "trend" && <LineChart values={q.values} />}
                {q.kind === "outlier" && (
                  <Scatter points={q.points} outlierIdx={q.outlierIdx} picked={choice} revealed={revealed} onPick={submit} />
                )}
                {q.kind === "numbers" && (
                  <div className="flex flex-wrap gap-2 justify-center my-2">
                    {q.nums.map((n, i) => (
                      <span key={i} style={{ fontFamily: "'Space Mono', monospace", background: "#EEF3FB", border: `2px solid ${C.ink}`, borderRadius: 10 }} className="px-3 py-1 font-bold text-lg">{n}</span>
                    ))}
                  </div>
                )}
              </div>

              {q.kind !== "outlier" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {q.options.map((opt, i) => {
                    let bg = "#fff";
                    if (revealed) {
                      if (i === q.answer) bg = "#CFF5E4";
                      else if (i === choice) bg = "#FFD9D9";
                      else bg = "#F2F2F2";
                    }
                    return (
                      <button key={i} className="dd-btn p-3 text-left text-sm sm:text-base" style={{ ...btn(bg), fontFamily: "'Nunito', sans-serif", fontWeight: 700 }} onClick={() => submit(i)} disabled={revealed}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Feedback */}
              {revealed && (
                <div className="mt-4 p-4" style={{ background: history[history.length - 1]?.correct ? "#E8FBF2" : "#FFF1F1", border: `3px solid ${C.ink}`, borderRadius: 14 }}>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif" }} className="text-lg font-bold">
                    {history[history.length - 1]?.correct
                      ? `✅ Case cracked! +${history[history.length - 1].pts} points${streak > 1 ? ` (streak bonus! 🔥)` : ""}`
                      : "❌ Not quite — but here's the clue you needed:"}
                  </div>
                  <div className="mt-1 font-semibold">💡 <b>Data Bite:</b> {q.bite}</div>
                  <button className="dd-btn mt-3 px-5 py-2" style={btn(C.yellow)} onClick={next}>
                    {qi + 1 >= questions.length ? "See my results →" : "Next case →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ END ============ */}
        {screen === "end" && (
          <div className="flex flex-col gap-4">
            <div style={card} className="p-6 sm:p-8 text-center">
              <div className="text-6xl">{badge.e}</div>
              <h2 style={{ fontFamily: "'Baloo 2', sans-serif" }} className="text-3xl font-extrabold mt-2">{badge.t}</h2>
              <div className="flex justify-center gap-3 mt-4 flex-wrap">
                <span style={{ background: C.yellow, border: `2px solid ${C.ink}`, borderRadius: 10, padding: "4px 14px", fontFamily: "'Baloo 2', sans-serif" }} className="font-bold">⭐ {score} pts</span>
                <span style={{ background: "#CFF5E4", border: `2px solid ${C.ink}`, borderRadius: 10, padding: "4px 14px", fontFamily: "'Baloo 2', sans-serif" }} className="font-bold">🎯 {accuracy}% accuracy</span>
                <span style={{ background: "#FFD9D9", border: `2px solid ${C.ink}`, borderRadius: 10, padding: "4px 14px", fontFamily: "'Baloo 2', sans-serif" }} className="font-bold">🔥 best streak {bestStreak}</span>
              </div>
              <div className="mt-4">
                <div style={{ fontFamily: "'Space Mono', monospace" }} className="text-[10px] mb-1">YOUR FULL CASE GRAPH</div>
                <ScoreSpark history={history} />
              </div>
            </div>

            <div style={card} className="p-5">
              <div style={{ fontFamily: "'Baloo 2', sans-serif" }} className="text-xl font-bold mb-3">Skill report 📋</div>
              {Object.entries(skillStats).map(([skill, s]) => (
                <div key={skill} className="mb-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{skill}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>{s.ok}/{s.total}</span>
                  </div>
                  <div style={{ background: "#EEF3FB", border: `2px solid ${C.ink}`, borderRadius: 8, height: 14, overflow: "hidden" }}>
                    <div style={{ width: `${(s.ok / s.total) * 100}%`, height: "100%", background: s.ok === s.total ? C.green : s.ok > 0 ? C.yellow : C.coral, transition: "width .4s" }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="dd-btn p-4 text-lg" style={btn(C.yellow)} onClick={() => start(diff)}>🔁 New cases (same rank)</button>
              <button className="dd-btn p-4 text-lg" style={btn("#E4D9FF")} onClick={() => setScreen("home")}>🏠 Change rank</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
