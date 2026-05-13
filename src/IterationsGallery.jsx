import { useState } from "react";

/* ============================================================================
   PAYOFF · 10 UI ITERATIONS
   Static design explorations of the same product (goal tracking + wins).
   Each iteration shows the Dashboard / hero screen in a phone mockup.
   ============================================================================ */

const ITERATIONS = [
  { id: 1,  name: "Onyx Pulse",       tag: "Dark · Bold",       desc: "On-brief palette (black/purple/orange). Big progress ring centerpiece, premium fitness-app feel." },
  { id: 2,  name: "Cream Pastel",     tag: "Light · Warm",      desc: "Cream + lavender + peach. Soft and friendly. Rounded everything. Conversational tone." },
  { id: 3,  name: "Bento Grid",       tag: "Modular · Glanceable", desc: "iOS-widget style. Goals, streak, and wins in a quick-glance grid. Information-dense." },
  { id: 4,  name: "Streak Hero",      tag: "Gamified · Duolingo-like", desc: "Streak is the star. Huge flame, days counter, freeze pips. Designed for habit-loops." },
  { id: 5,  name: "Editorial",        tag: "Typographic · Refined", desc: "Magazine-style serif headlines, asymmetric grid, generous whitespace, single accent." },
  { id: 6,  name: "Glass Layer",      tag: "Premium · Frosted", desc: "Glassmorphism on a gradient mesh. Floating frosted cards. iOS 17 control-center vibe." },
  { id: 7,  name: "Brutalist Mono",   tag: "Raw · Terminal",    desc: "Monospace, hard 1px borders, ASCII progress bars. For users who want truth over delight." },
  { id: 8,  name: "Neon Cyber",       tag: "Futuristic · Tron", desc: "Pitch black with neon glows. Thin scanlines. Big neon numbers. A finance app from 2099." },
  { id: 9,  name: "Paper Statement",  tag: "Editorial · Print", desc: "Off-white paper, serif body, ledger-like rows. Reads like a private banker's statement." },
  { id: 10, name: "Coach Mode",       tag: "Conversational · Warm", desc: "Chat-style UI. Payoff coach greets you, surfaces nudges, and accepts quick-reply wins." },
];

export default function IterationsGallery() {
  const [active, setActive] = useState(null);
  return (
    <>
      <style>{CSS}</style>
      <div className="gallery">
        <Header />
        <Index onJump={(id) => {
          setActive(id);
          const el = document.getElementById(`iter-${id}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }} active={active} />

        <Section iter={ITERATIONS[0]}><Iteration01 /></Section>
        <Section iter={ITERATIONS[1]}><Iteration02 /></Section>
        <Section iter={ITERATIONS[2]}><Iteration03 /></Section>
        <Section iter={ITERATIONS[3]}><Iteration04 /></Section>
        <Section iter={ITERATIONS[4]}><Iteration05 /></Section>
        <Section iter={ITERATIONS[5]}><Iteration06 /></Section>
        <Section iter={ITERATIONS[6]}><Iteration07 /></Section>
        <Section iter={ITERATIONS[7]}><Iteration08 /></Section>
        <Section iter={ITERATIONS[8]}><Iteration09 /></Section>
        <Section iter={ITERATIONS[9]}><Iteration10 /></Section>

        <Footer />
      </div>
    </>
  );
}

/* ----------------------------- Shell components --------------------------- */

function Header() {
  return (
    <header className="g-header">
      <div className="g-header-inner">
        <div className="g-brand">
          <span className="g-brand-mark">◐</span>
          <span className="g-brand-name">Payoff</span>
          <span className="g-brand-sep">·</span>
          <span className="g-brand-sub">10 UI Directions</span>
        </div>
        <div className="g-meta">
          <span className="g-pill">Static · v0.1</span>
          <span className="g-pill g-pill-ghost">React + Vite</span>
        </div>
      </div>
      <div className="g-hero">
        <h1 className="g-h1">Ten ways to ship<br/>the same idea.</h1>
        <p className="g-sub">
          A side-by-side gallery of design directions for the Payoff MVP — goal tracking,
          progress, and wins. Same product, ten personalities. Pick one and we ship it.
        </p>
      </div>
    </header>
  );
}

function Index({ onJump, active }) {
  return (
    <nav className="g-index">
      {ITERATIONS.map(it => (
        <button
          key={it.id}
          className={`g-index-pill ${active === it.id ? "on" : ""}`}
          onClick={() => onJump(it.id)}
        >
          <span className="g-index-num">{String(it.id).padStart(2, "0")}</span>
          <span className="g-index-nm">{it.name}</span>
        </button>
      ))}
    </nav>
  );
}

function Section({ iter, children }) {
  return (
    <section className="g-section" id={`iter-${iter.id}`}>
      <div className="g-section-head">
        <div className="g-num">{String(iter.id).padStart(2, "0")}</div>
        <div className="g-section-text">
          <h2 className="g-section-name">
            {iter.name}
            <span className="g-section-tag">{iter.tag}</span>
          </h2>
          <p className="g-section-desc">{iter.desc}</p>
        </div>
      </div>
      <div className="g-stage">
        <div className="g-stage-frame">
          {children}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="g-footer">
      <div>Payoff · Static UI gallery · Pick a direction and we build it for real.</div>
    </footer>
  );
}

/* ============================================================================
   PHONE FRAME — shared chrome (notch + screen) all iterations live inside
   ============================================================================ */
function Phone({ bg = "#FAFAF7", children, frame = "dark" }) {
  return (
    <div className={`phone ${frame === "light" ? "phone-light" : ""}`}>
      <div className="phone-notch" />
      <div className="phone-screen" style={{ background: bg }}>
        {children}
      </div>
    </div>
  );
}

/* ============================================================================
   ITERATION 01 — ONYX PULSE
   Dark mode, on-brief: black / purple / orange. Big ring centerpiece.
   ============================================================================ */
function Iteration01() {
  const saved = 3250, target = 5000;
  const pct = Math.round((saved / target) * 100);
  const r = 92, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <Phone bg="#0A0A0A">
      <div className="i1">
        <div className="i1-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
        <div className="i1-top">
          <div className="i1-greet">
            <div className="i1-hi">Hey, Hamza</div>
            <div className="i1-sub">Sunday — quiet money day</div>
          </div>
          <div className="i1-avatar">H</div>
        </div>
        <div className="i1-ring-wrap">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <defs>
              <linearGradient id="i1g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="60%" stopColor="#6D28D9" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <circle cx="110" cy="110" r={r} stroke="#1C1C1E" strokeWidth="14" fill="none" />
            <circle
              cx="110" cy="110" r={r}
              stroke="url(#i1g)" strokeWidth="14" fill="none"
              strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
              transform="rotate(-90 110 110)"
            />
          </svg>
          <div className="i1-ring-text">
            <div className="i1-ring-pct">{pct}<span>%</span></div>
            <div className="i1-ring-lbl">of $5,000</div>
          </div>
        </div>
        <div className="i1-amount">
          <div className="i1-amt-big">$3,250<span>.00</span></div>
          <div className="i1-amt-sub">$1,750 to go · Aug 2027</div>
        </div>
        <div className="i1-row">
          <div className="i1-chip i1-chip-purple">🏠 Home Deposit</div>
          <div className="i1-chip i1-chip-orange">🔥 12 weeks</div>
        </div>
        <div className="i1-cta">＋  Add a win</div>
        <div className="i1-section">RECENT WINS</div>
        <div className="i1-win">
          <span className="i1-win-em">💰</span>
          <span className="i1-win-lbl">Skipped takeaway</span>
          <span className="i1-win-amt">+$12</span>
        </div>
        <div className="i1-win">
          <span className="i1-win-em">💳</span>
          <span className="i1-win-lbl">Got a refund</span>
          <span className="i1-win-amt">+$28</span>
        </div>
        <div className="i1-win">
          <span className="i1-win-em">🛍️</span>
          <span className="i1-win-lbl">Didn't buy something</span>
          <span className="i1-win-amt">+$45</span>
        </div>
        <NavBar variant="dark" />
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 02 — CREAM PASTEL
   Cream / lavender / peach. Soft, friendly, rounded.
   ============================================================================ */
function Iteration02() {
  return (
    <Phone bg="#FFF8F0">
      <div className="i2">
        <div className="i2-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
        <div className="i2-greet">
          <div className="i2-hello">Good morning ☀️</div>
          <h2 className="i2-title">Your home<br/>is closer<br/>than yesterday.</h2>
        </div>
        <div className="i2-card">
          <div className="i2-card-top">
            <div className="i2-card-em">🏠</div>
            <div>
              <div className="i2-card-lbl">Home Deposit</div>
              <div className="i2-card-meta">Target Aug 2027</div>
            </div>
            <div className="i2-card-pct">65%</div>
          </div>
          <div className="i2-bar"><div className="i2-bar-fill" style={{ width: "65%" }} /></div>
          <div className="i2-card-bottom">
            <div><span>$3,250</span> saved</div>
            <div><span>$1,750</span> to go</div>
          </div>
        </div>
        <div className="i2-grid">
          <div className="i2-mini">
            <div className="i2-mini-em">🔥</div>
            <div className="i2-mini-num">12</div>
            <div className="i2-mini-lbl">week streak</div>
          </div>
          <div className="i2-mini i2-mini-peach">
            <div className="i2-mini-em">🏆</div>
            <div className="i2-mini-num">8</div>
            <div className="i2-mini-lbl">wins this week</div>
          </div>
        </div>
        <div className="i2-section">Lately</div>
        <div className="i2-list">
          <div className="i2-row">
            <span className="i2-row-em">🍕</span>
            <span className="i2-row-lbl">Skipped takeaway</span>
            <span className="i2-row-amt">+$12</span>
          </div>
          <div className="i2-row">
            <span className="i2-row-em">💰</span>
            <span className="i2-row-lbl">Spent less on groceries</span>
            <span className="i2-row-amt">+$8</span>
          </div>
          <div className="i2-row">
            <span className="i2-row-em">💳</span>
            <span className="i2-row-lbl">Got a refund</span>
            <span className="i2-row-amt">+$28</span>
          </div>
        </div>
        <NavBar variant="cream" />
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 03 — BENTO GRID
   iOS widget grid. Different sized tiles. Quick glance.
   ============================================================================ */
function Iteration03() {
  return (
    <Phone bg="#F2F2F7">
      <div className="i3">
        <div className="i3-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
        <div className="i3-head">
          <div>
            <div className="i3-eye">YOUR DAY</div>
            <div className="i3-title">Wednesday</div>
          </div>
          <div className="i3-search">🔍</div>
        </div>
        <div className="i3-bento">
          <div className="i3-tile i3-tile-lg i3-tile-purple">
            <div className="i3-tile-top">
              <span className="i3-tile-em">🏠</span>
              <span className="i3-tile-mini">Home Deposit</span>
            </div>
            <div className="i3-tile-big">$3,250</div>
            <div className="i3-tile-sub">of $5,000 · 65%</div>
            <div className="i3-tile-bar"><div className="i3-tile-fill" style={{ width: "65%" }} /></div>
          </div>
          <div className="i3-tile i3-tile-sm i3-tile-orange">
            <div className="i3-tile-em-big">🔥</div>
            <div className="i3-tile-num">12</div>
            <div className="i3-tile-lbl">week streak</div>
          </div>
          <div className="i3-tile i3-tile-sm i3-tile-black">
            <div className="i3-tile-em-big">🏆</div>
            <div className="i3-tile-num">37</div>
            <div className="i3-tile-lbl">lifetime wins</div>
          </div>
          <div className="i3-tile i3-tile-md i3-tile-white">
            <div className="i3-tile-top">
              <span className="i3-tile-em">📈</span>
              <span className="i3-tile-mini">This week</span>
            </div>
            <div className="i3-tile-stat">
              <span className="i3-tile-stat-num">+$145</span>
              <span className="i3-tile-stat-delta">▲ 23%</span>
            </div>
            <div className="i3-tile-sub">vs last week</div>
          </div>
          <div className="i3-tile i3-tile-md i3-tile-white">
            <div className="i3-tile-top">
              <span className="i3-tile-em">⏳</span>
              <span className="i3-tile-mini">ETA</span>
            </div>
            <div className="i3-tile-stat">
              <span className="i3-tile-stat-num">Aug '27</span>
            </div>
            <div className="i3-tile-sub">on current pace</div>
          </div>
          <div className="i3-tile i3-tile-wide i3-tile-white">
            <div className="i3-tile-top">
              <span className="i3-tile-em">⚡</span>
              <span className="i3-tile-mini">Recent</span>
            </div>
            <div className="i3-mini-row"><span>🍕 Skipped takeaway</span><b>+$12</b></div>
            <div className="i3-mini-row"><span>💳 Got a refund</span><b>+$28</b></div>
            <div className="i3-mini-row"><span>🛍️ Didn't buy</span><b>+$45</b></div>
          </div>
        </div>
        <NavBar variant="ios" />
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 04 — STREAK HERO (Duolingo-like)
   Streak first. Big flame. Gamified.
   ============================================================================ */
function Iteration04() {
  return (
    <Phone bg="#FFFBEB">
      <div className="i4">
        <div className="i4-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
        <div className="i4-top">
          <div className="i4-coin">$</div>
          <div className="i4-streak-pill">🔥 12</div>
          <div className="i4-heart">❄️ 2</div>
        </div>
        <div className="i4-flame">🔥</div>
        <div className="i4-flame-num">12</div>
        <div className="i4-flame-lbl">week streak — Locked in</div>
        <div className="i4-days">
          {["M","T","W","T","F","S","S"].map((d,i) => (
            <div key={i} className={`i4-day ${i<5?"on":""} ${i===4?"today":""}`}>{d}</div>
          ))}
        </div>
        <div className="i4-quest">
          <div className="i4-quest-top">
            <span className="i4-quest-em">🎯</span>
            <div>
              <div className="i4-quest-lbl">Today's quest</div>
              <div className="i4-quest-name">Log one win to keep the streak</div>
            </div>
          </div>
          <div className="i4-quest-bar"><div className="i4-quest-fill" style={{ width: "70%" }}/></div>
          <div className="i4-quest-meta">3 of 4 wins this week</div>
        </div>
        <div className="i4-cta">＋  Add a win</div>
        <div className="i4-goal">
          <div className="i4-goal-em">🏠</div>
          <div className="i4-goal-info">
            <div className="i4-goal-lbl">Home Deposit</div>
            <div className="i4-goal-meta">$3,250 / $5,000</div>
          </div>
          <div className="i4-goal-pct">65%</div>
        </div>
        <NavBar variant="duo" />
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 05 — EDITORIAL
   Serif headline, asymmetric, refined typography.
   ============================================================================ */
function Iteration05() {
  return (
    <Phone bg="#FBFAF7">
      <div className="i5">
        <div className="i5-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
        <div className="i5-masthead">
          <span className="i5-rule" />
          <span className="i5-mast-name">PAYOFF</span>
          <span className="i5-rule" />
        </div>
        <div className="i5-date">VOLUME 12 · WEDNESDAY EDITION</div>
        <h1 className="i5-headline">The<br/><i>finish line</i><br/>is closer.</h1>
        <p className="i5-deck">
          You've saved <b>$3,250</b> of <b>$5,000</b> toward your home deposit.
          At this pace, you'll arrive in August 2027.
        </p>
        <div className="i5-grid">
          <div className="i5-stat">
            <div className="i5-stat-num">65<span>%</span></div>
            <div className="i5-stat-lbl">complete</div>
          </div>
          <div className="i5-stat">
            <div className="i5-stat-num">12</div>
            <div className="i5-stat-lbl">week streak</div>
          </div>
          <div className="i5-stat">
            <div className="i5-stat-num">$1,750</div>
            <div className="i5-stat-lbl">remaining</div>
          </div>
        </div>
        <div className="i5-bar"><div className="i5-bar-fill" style={{ width: "65%" }} /></div>
        <div className="i5-section">DISPATCHES</div>
        <div className="i5-dispatch">
          <span className="i5-dispatch-when">Today</span>
          <span className="i5-dispatch-text">Skipped takeaway — <b>$12</b></span>
        </div>
        <div className="i5-dispatch">
          <span className="i5-dispatch-when">Mon</span>
          <span className="i5-dispatch-text">Refund received — <b>$28</b></span>
        </div>
        <div className="i5-dispatch">
          <span className="i5-dispatch-when">Sun</span>
          <span className="i5-dispatch-text">Underspent on groceries — <b>$8</b></span>
        </div>
        <div className="i5-cta">Compose a win →</div>
        <NavBar variant="ed" />
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 06 — GLASS LAYER
   Glassmorphism on a gradient mesh.
   ============================================================================ */
function Iteration06() {
  return (
    <Phone bg="#000">
      <div className="i6-bg">
        <div className="i6-blob i6-blob-1" />
        <div className="i6-blob i6-blob-2" />
        <div className="i6-blob i6-blob-3" />
        <div className="i6">
          <div className="i6-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
          <div className="i6-greet">
            <div className="i6-hi">Hi, Hamza</div>
            <div className="i6-sub">Let's keep moving forward</div>
          </div>
          <div className="i6-glass i6-glass-hero">
            <div className="i6-eye">PRIMARY GOAL</div>
            <div className="i6-goal-em">🏠</div>
            <div className="i6-goal-name">Home Deposit</div>
            <div className="i6-big">$3,250 <span className="i6-big-sub">/ $5,000</span></div>
            <div className="i6-ring">
              <div className="i6-ring-track">
                <div className="i6-ring-fill" style={{ width: "65%" }} />
              </div>
              <div className="i6-ring-pct">65%</div>
            </div>
          </div>
          <div className="i6-row">
            <div className="i6-glass i6-glass-sm">
              <div className="i6-sm-em">🔥</div>
              <div className="i6-sm-num">12</div>
              <div className="i6-sm-lbl">streak</div>
            </div>
            <div className="i6-glass i6-glass-sm">
              <div className="i6-sm-em">⏳</div>
              <div className="i6-sm-num">Aug</div>
              <div className="i6-sm-lbl">'27 ETA</div>
            </div>
            <div className="i6-glass i6-glass-sm">
              <div className="i6-sm-em">⚡</div>
              <div className="i6-sm-num">+23%</div>
              <div className="i6-sm-lbl">pace</div>
            </div>
          </div>
          <div className="i6-glass i6-glass-list">
            <div className="i6-list-eye">RECENT</div>
            <div className="i6-list-row"><span>🍕</span><span>Skipped takeaway</span><b>+$12</b></div>
            <div className="i6-list-row"><span>💳</span><span>Got a refund</span><b>+$28</b></div>
            <div className="i6-list-row"><span>🛍️</span><span>Didn't buy something</span><b>+$45</b></div>
          </div>
          <NavBar variant="glass" />
        </div>
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 07 — BRUTALIST MONO
   Hard edges, monospace, ASCII bars.
   ============================================================================ */
function Iteration07() {
  return (
    <Phone bg="#FFFFFF">
      <div className="i7">
        <div className="i7-sb"><span>09:41</span><span>—</span><span>BAT 91%</span></div>
        <div className="i7-head">
          <div className="i7-brand">PAYOFF/v0.1</div>
          <div className="i7-dot">●</div>
        </div>
        <div className="i7-line">{"=".repeat(38)}</div>
        <div className="i7-block">
          <div className="i7-kv"><span>USER</span><span>hamza@payoff</span></div>
          <div className="i7-kv"><span>GOAL</span><span>HOME_DEPOSIT</span></div>
          <div className="i7-kv"><span>TARGET</span><span>$5,000.00</span></div>
          <div className="i7-kv"><span>SAVED</span><span>$3,250.00</span></div>
          <div className="i7-kv"><span>DELTA</span><span>$1,750.00</span></div>
          <div className="i7-kv"><span>ETA</span><span>2027-08-15</span></div>
        </div>
        <div className="i7-line">{"-".repeat(38)}</div>
        <div className="i7-progress">
          <div className="i7-prog-row">
            <span>[</span>
            <span className="i7-prog-fill">{"█".repeat(13)}</span>
            <span className="i7-prog-empty">{"░".repeat(7)}</span>
            <span>]  65%</span>
          </div>
        </div>
        <div className="i7-line">{"-".repeat(38)}</div>
        <div className="i7-block">
          <div className="i7-kv"><span>STREAK</span><span>12_WEEKS</span></div>
          <div className="i7-kv"><span>STATUS</span><span>● ACTIVE</span></div>
          <div className="i7-kv"><span>FREEZES</span><span>2</span></div>
        </div>
        <div className="i7-line">{"=".repeat(38)}</div>
        <div className="i7-section">&gt; LOG.TAIL --n=3</div>
        <div className="i7-log">2026.05.12 09:14 +12.00 takeaway</div>
        <div className="i7-log">2026.05.11 19:02 +28.00 refund</div>
        <div className="i7-log">2026.05.10 12:48 +45.00 shopping</div>
        <div className="i7-line">{"=".repeat(38)}</div>
        <div className="i7-actions">
          <div className="i7-btn">[ + ADD WIN  ]</div>
          <div className="i7-btn i7-btn-ghost">[ VIEW LOG  ]</div>
        </div>
        <NavBar variant="mono" />
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 08 — NEON CYBER
   Pitch black with neon glows.
   ============================================================================ */
function Iteration08() {
  return (
    <Phone bg="#040409">
      <div className="i8">
        <div className="i8-grid" />
        <div className="i8-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
        <div className="i8-head">
          <div className="i8-brand">P/A/Y/O/F/F</div>
          <div className="i8-id">ID · 0001</div>
        </div>
        <div className="i8-stack">
          <div className="i8-eye">// PRIMARY OBJECTIVE</div>
          <div className="i8-name">HOME DEPOSIT</div>
        </div>
        <div className="i8-amount-row">
          <div className="i8-amount">$3,250</div>
          <div className="i8-of">/ $5,000</div>
        </div>
        <div className="i8-bar">
          <div className="i8-bar-fill" style={{ width: "65%" }} />
          <div className="i8-bar-ticks">
            {[0,25,50,75,100].map(t => (
              <div key={t} className={`i8-tick ${t<=65?"on":""}`} style={{ left: `${t}%` }} />
            ))}
          </div>
        </div>
        <div className="i8-bar-labels">
          <span>0</span><span>25</span><span>50</span><span className="i8-here">YOU · 65</span><span>100</span>
        </div>
        <div className="i8-stats">
          <div className="i8-stat">
            <div className="i8-stat-num">12</div>
            <div className="i8-stat-lbl">STREAK</div>
          </div>
          <div className="i8-stat i8-stat-orange">
            <div className="i8-stat-num">+23%</div>
            <div className="i8-stat-lbl">PACE</div>
          </div>
          <div className="i8-stat">
            <div className="i8-stat-num">Aug<span>'27</span></div>
            <div className="i8-stat-lbl">ETA</div>
          </div>
        </div>
        <div className="i8-section">&gt;&gt; FEED</div>
        <div className="i8-feed-row">
          <span className="i8-feed-time">+09:14</span>
          <span className="i8-feed-lbl">SKIPPED TAKEAWAY</span>
          <span className="i8-feed-amt">+$12</span>
        </div>
        <div className="i8-feed-row">
          <span className="i8-feed-time">-1d</span>
          <span className="i8-feed-lbl">REFUND CAPTURED</span>
          <span className="i8-feed-amt">+$28</span>
        </div>
        <div className="i8-feed-row">
          <span className="i8-feed-time">-2d</span>
          <span className="i8-feed-lbl">PURCHASE SUPPRESSED</span>
          <span className="i8-feed-amt">+$45</span>
        </div>
        <div className="i8-cta">＋ LOG WIN</div>
        <NavBar variant="neon" />
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 09 — PAPER STATEMENT
   Off-white, serif, financial-journal feel.
   ============================================================================ */
function Iteration09() {
  return (
    <Phone bg="#F5F0E6">
      <div className="i9">
        <div className="i9-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
        <div className="i9-mast">
          <div className="i9-mast-rule" />
          <div className="i9-mast-name">PAYOFF</div>
          <div className="i9-mast-sub">PERSONAL STATEMENT · ESTABLISHED 2026</div>
          <div className="i9-mast-rule" />
        </div>
        <h2 className="i9-title">Statement of Progress</h2>
        <div className="i9-meta">
          Account holder: <b>Hamza Abid</b> · Period: May 2026 · Goal: <i>Home Deposit</i>
        </div>
        <div className="i9-ledger">
          <div className="i9-l-head">
            <span>Item</span><span>Amount</span>
          </div>
          <div className="i9-l-row">
            <span>Target</span><span>$5,000.00</span>
          </div>
          <div className="i9-l-row">
            <span>Accumulated to date</span><span>$3,250.00</span>
          </div>
          <div className="i9-l-row">
            <span>Outstanding</span><span>$1,750.00</span>
          </div>
          <div className="i9-l-row i9-l-total">
            <span>Completion</span><span>65%</span>
          </div>
        </div>
        <div className="i9-bar"><div className="i9-bar-fill" style={{ width: "65%" }} /></div>
        <div className="i9-note">
          <i>"At your current pace of <b>$145/week</b>, you will arrive at your goal on or before <b>15 August 2027</b>."</i>
        </div>
        <div className="i9-section">Recent Entries</div>
        <div className="i9-entries">
          <div className="i9-entry">
            <span className="i9-e-date">12 MAY</span>
            <span className="i9-e-lbl">Skipped takeaway</span>
            <span className="i9-e-amt">+$12.00</span>
          </div>
          <div className="i9-entry">
            <span className="i9-e-date">11 MAY</span>
            <span className="i9-e-lbl">Refund — Argos return</span>
            <span className="i9-e-amt">+$28.00</span>
          </div>
          <div className="i9-entry">
            <span className="i9-e-date">10 MAY</span>
            <span className="i9-e-lbl">Underspent — groceries</span>
            <span className="i9-e-amt">+$8.00</span>
          </div>
        </div>
        <div className="i9-cta">Record a new entry</div>
        <NavBar variant="paper" />
      </div>
    </Phone>
  );
}

/* ============================================================================
   ITERATION 10 — COACH MODE
   Conversational chat-style UI.
   ============================================================================ */
function Iteration10() {
  return (
    <Phone bg="#0F1117">
      <div className="i10">
        <div className="i10-sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
        <div className="i10-head">
          <div className="i10-coach">
            <div className="i10-coach-av">P</div>
            <div>
              <div className="i10-coach-name">Payoff Coach</div>
              <div className="i10-coach-status">● online · keeping you accountable</div>
            </div>
          </div>
          <div className="i10-menu">⋯</div>
        </div>
        <div className="i10-day">— Today —</div>
        <div className="i10-msg i10-msg-them">
          Morning Hamza. You're <b>$1,750</b> away from your home deposit. Want to log a quick win?
        </div>
        <div className="i10-msg i10-msg-them i10-msg-card">
          <div className="i10-card-em">🏠</div>
          <div className="i10-card-info">
            <div className="i10-card-lbl">Home Deposit</div>
            <div className="i10-card-meta">$3,250 of $5,000 · 65%</div>
            <div className="i10-card-bar"><div className="i10-card-fill" style={{ width: "65%" }} /></div>
          </div>
        </div>
        <div className="i10-msg i10-msg-me">
          Yeah — skipped takeaway last night.
        </div>
        <div className="i10-msg i10-msg-them">
          Nice. Logging <b>+$12</b> toward Home Deposit. That's <b>2.4 days closer</b>. 🔥 Streak is now <b>12 weeks</b>.
        </div>
        <div className="i10-replies">
          <div className="i10-reply">🍕 +$12 takeaway</div>
          <div className="i10-reply">💳 +$28 refund</div>
          <div className="i10-reply">🛍️ +$45 shopping</div>
          <div className="i10-reply">＋ custom</div>
        </div>
        <div className="i10-input">
          <input className="i10-input-field" placeholder="Type a win or ask the coach…" />
          <div className="i10-send">↑</div>
        </div>
      </div>
    </Phone>
  );
}

/* ============================================================================
   Shared NavBar (varies per iteration)
   ============================================================================ */
function NavBar({ variant }) {
  const items = [
    { em: "🎯", lb: "Goals" },
    { em: "📈", lb: "Progress", on: true },
    { em: "🏆", lb: "Wins" },
    { em: "⚙️", lb: "Settings" },
  ];
  return (
    <div className={`nav nav-${variant}`}>
      {items.map((it, i) => (
        <div key={i} className={`nav-item ${it.on ? "on" : ""}`}>
          <div className="nav-em">{it.em}</div>
          <div className="nav-lb">{it.lb}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   STYLES
   ============================================================================ */
const CSS = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
body,html,#root{background:#0B0B10}
.gallery{
  min-height:100vh;
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(124,92,230,0.22), transparent 60%),
    radial-gradient(1000px 500px at 90% 10%, rgba(234,88,12,0.18), transparent 60%),
    linear-gradient(180deg,#0B0B10 0%,#0B0B10 100%);
  color:#fff;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter","Segoe UI",sans-serif;
  padding:0 0 80px;
}

/* ── Header ── */
.g-header{padding:32px 32px 0;max-width:1280px;margin:0 auto}
.g-header-inner{display:flex;align-items:center;justify-content:space-between;padding-bottom:48px;border-bottom:1px solid rgba(255,255,255,0.08)}
.g-brand{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;letter-spacing:-0.2px}
.g-brand-mark{font-size:22px;color:#A78BFA}
.g-brand-name{color:#fff}
.g-brand-sep{color:#52525B}
.g-brand-sub{color:#A1A1AA;font-weight:600}
.g-meta{display:flex;gap:8px}
.g-pill{font-size:11px;font-weight:700;color:#A78BFA;background:rgba(124,92,230,0.14);border:1px solid rgba(124,92,230,0.3);padding:5px 10px;border-radius:99px;letter-spacing:0.5px}
.g-pill-ghost{color:#A1A1AA;background:transparent;border-color:rgba(255,255,255,0.12)}
.g-hero{padding:60px 0 40px;max-width:780px}
.g-h1{font-size:64px;font-weight:900;letter-spacing:-2.5px;line-height:0.98;color:#fff;background:linear-gradient(135deg,#fff 0%,#A78BFA 60%,#EA580C 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.g-sub{font-size:17px;line-height:1.55;color:#A1A1AA;margin-top:24px;font-weight:500;max-width:620px}

/* ── Index pills ── */
.g-index{
  position:sticky;top:0;z-index:100;
  background:rgba(11,11,16,0.75);
  backdrop-filter:saturate(160%) blur(14px);
  -webkit-backdrop-filter:saturate(160%) blur(14px);
  border-top:1px solid rgba(255,255,255,0.06);
  border-bottom:1px solid rgba(255,255,255,0.06);
  padding:14px 32px;
  margin:24px 0 0;
  display:flex;gap:8px;overflow-x:auto;
  scrollbar-width:none;
}
.g-index::-webkit-scrollbar{display:none}
.g-index-pill{
  flex-shrink:0;display:inline-flex;align-items:center;gap:8px;
  background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
  color:#E4E4E7;padding:8px 14px;border-radius:99px;
  font-size:12px;font-weight:600;cursor:pointer;transition:all .2s ease;
}
.g-index-pill:hover{background:rgba(255,255,255,0.08);border-color:rgba(167,139,250,0.4)}
.g-index-pill.on{background:rgba(124,92,230,0.18);border-color:#7C5CE6;color:#fff}
.g-index-num{font-variant-numeric:tabular-nums;color:#A78BFA;font-weight:800;font-size:11px}
.g-index-nm{letter-spacing:-0.2px}

/* ── Sections ── */
.g-section{max-width:1280px;margin:0 auto;padding:80px 32px 0}
.g-section-head{display:flex;align-items:flex-start;gap:24px;margin-bottom:36px}
.g-num{
  flex-shrink:0;width:64px;height:64px;border-radius:16px;
  background:linear-gradient(135deg,rgba(167,139,250,0.2),rgba(234,88,12,0.15));
  border:1px solid rgba(255,255,255,0.1);
  display:flex;align-items:center;justify-content:center;
  font-size:24px;font-weight:900;color:#fff;letter-spacing:-1px;
  font-variant-numeric:tabular-nums;
}
.g-section-text{flex:1;min-width:0}
.g-section-name{font-size:34px;font-weight:800;letter-spacing:-1px;color:#fff;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.g-section-tag{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#A78BFA;background:rgba(124,92,230,0.12);border:1px solid rgba(124,92,230,0.28);padding:5px 10px;border-radius:99px}
.g-section-desc{font-size:15px;color:#A1A1AA;line-height:1.55;margin-top:8px;max-width:680px;font-weight:500}

.g-stage{
  background:
    radial-gradient(600px 300px at 50% 0%, rgba(124,92,230,0.12), transparent 70%),
    linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01));
  border:1px solid rgba(255,255,255,0.06);
  border-radius:28px;
  padding:60px 20px;
  display:flex;justify-content:center;align-items:center;
}
.g-stage-frame{display:flex;justify-content:center}

.g-footer{max-width:1280px;margin:80px auto 0;padding:40px 32px;color:#71717A;font-size:13px;text-align:center;border-top:1px solid rgba(255,255,255,0.06)}

/* ── Phone frame (shared) ── */
.phone{
  position:relative;width:390px;height:844px;
  background:#0a0a0a;border-radius:48px;
  box-shadow:
    0 0 0 12px #111 inset,
    0 40px 80px -20px rgba(0,0,0,0.6),
    0 0 0 1px rgba(255,255,255,0.05);
  flex-shrink:0;
}
.phone-light{
  box-shadow:
    0 0 0 12px #fafafa inset,
    0 40px 80px -20px rgba(0,0,0,0.25),
    0 0 0 1px rgba(0,0,0,0.05);
  background:#fff;
}
.phone-notch{
  position:absolute;top:8px;left:50%;transform:translateX(-50%);
  width:120px;height:32px;background:#000;border-radius:99px;z-index:5;
}
.phone-screen{
  position:absolute;inset:11px;border-radius:38px;overflow:hidden;
  color:#1a1a2e;
}

/* Shared nav bar variants ------------------------------------------------ */
.nav{position:absolute;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(4,1fr);padding:8px 0 16px;border-top:1px solid rgba(0,0,0,0.06)}
.nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;color:#9CA3AF;font-size:10px;font-weight:600}
.nav-item.on{color:#7C5CE6}
.nav-em{font-size:20px;line-height:1}
.nav-lb{font-size:10px;font-weight:600}

/* dark */
.nav-dark{background:rgba(10,10,10,0.92);border-top-color:rgba(255,255,255,0.06)}
.nav-dark .nav-item{color:#71717A}
.nav-dark .nav-item.on{color:#A78BFA}

/* cream */
.nav-cream{background:rgba(255,248,240,0.96);border-top-color:rgba(0,0,0,0.05)}
.nav-cream .nav-item.on{color:#7C3AED}

/* ios */
.nav-ios{background:rgba(242,242,247,0.96);backdrop-filter:blur(10px)}
.nav-ios .nav-item.on{color:#0A84FF}

/* duo (orange accent) */
.nav-duo{background:#fff;border-top-color:#FEE7CF}
.nav-duo .nav-item.on{color:#EA580C}

/* editorial */
.nav-ed{background:#FBFAF7;border-top:1px solid #111;font-family:Georgia,"Iowan Old Style",serif}
.nav-ed .nav-item{color:#111;text-transform:uppercase;letter-spacing:1px;font-size:9px}
.nav-ed .nav-item.on{color:#7C3AED}
.nav-ed .nav-em{font-size:14px}

/* glass */
.nav-glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border-top-color:rgba(255,255,255,0.12)}
.nav-glass .nav-item{color:rgba(255,255,255,0.6)}
.nav-glass .nav-item.on{color:#fff}

/* mono */
.nav-mono{background:#fff;border-top:2px solid #111;font-family:"JetBrains Mono","SF Mono",Menlo,monospace}
.nav-mono .nav-item{color:#111;font-size:9px;letter-spacing:0;text-transform:uppercase}
.nav-mono .nav-item.on{background:#111;color:#fff;margin:-8px 0 -16px;padding:8px 0 16px}
.nav-mono .nav-em{font-size:14px;filter:saturate(0)}

/* neon */
.nav-neon{background:rgba(4,4,9,0.92);border-top:1px solid rgba(167,139,250,0.3)}
.nav-neon .nav-item{color:#52525B;letter-spacing:1.5px;text-transform:uppercase;font-size:9px}
.nav-neon .nav-item.on{color:#A78BFA;text-shadow:0 0 12px rgba(167,139,250,0.8)}
.nav-neon .nav-em{filter:hue-rotate(220deg) saturate(2)}

/* paper */
.nav-paper{background:#F5F0E6;border-top:1px solid #1F1B14;font-family:Georgia,serif}
.nav-paper .nav-item{color:#3C3528;font-size:9px;text-transform:uppercase;letter-spacing:1.2px}
.nav-paper .nav-item.on{color:#7C3AED}
.nav-paper .nav-em{font-size:12px}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 01 — ONYX PULSE
   ════════════════════════════════════════════════════════════════════ */
.i1{height:100%;overflow-y:auto;padding:50px 22px 96px;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif;background:radial-gradient(800px 400px at 50% -10%, rgba(124,92,230,0.25), transparent 60%),#0A0A0A}
.i1-sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#fff;padding:0 4px 18px}
.i1-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.i1-greet{}
.i1-hi{font-size:24px;font-weight:800;letter-spacing:-0.6px;color:#fff}
.i1-sub{font-size:13px;color:#A1A1AA;margin-top:2px;font-weight:500}
.i1-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#6D28D9,#EA580C);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.i1-ring-wrap{position:relative;display:flex;justify-content:center;margin:8px 0 6px}
.i1-ring-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
.i1-ring-pct{font-size:54px;font-weight:900;letter-spacing:-2px;color:#fff;line-height:1}
.i1-ring-pct span{font-size:26px;color:#A78BFA;margin-left:2px;font-weight:700}
.i1-ring-lbl{font-size:11px;color:#A1A1AA;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;margin-top:4px}
.i1-amount{text-align:center;margin:6px 0 16px}
.i1-amt-big{font-size:36px;font-weight:800;letter-spacing:-1.2px;color:#fff;line-height:1}
.i1-amt-big span{color:#52525B;font-weight:600}
.i1-amt-sub{font-size:12px;color:#A1A1AA;margin-top:6px;font-weight:500}
.i1-row{display:flex;gap:8px;margin-bottom:14px;justify-content:center}
.i1-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:99px;font-size:12px;font-weight:700;letter-spacing:-0.1px}
.i1-chip-purple{background:rgba(124,92,230,0.16);color:#A78BFA;border:1px solid rgba(124,92,230,0.3)}
.i1-chip-orange{background:rgba(234,88,12,0.16);color:#FB923C;border:1px solid rgba(234,88,12,0.3)}
.i1-cta{background:linear-gradient(135deg,#7C5CE6,#9B7FE9);color:#fff;border-radius:14px;padding:14px;text-align:center;font-weight:800;font-size:15px;margin-bottom:18px;box-shadow:0 10px 30px -10px rgba(124,92,230,0.6)}
.i1-section{font-size:10px;letter-spacing:1.6px;color:#71717A;font-weight:700;margin:0 4px 10px}
.i1-win{display:flex;align-items:center;gap:12px;background:#1C1C1E;border:1px solid rgba(255,255,255,0.04);border-radius:14px;padding:12px;margin-bottom:8px}
.i1-win-em{width:32px;height:32px;border-radius:10px;background:rgba(124,92,230,0.18);display:flex;align-items:center;justify-content:center;font-size:16px}
.i1-win-lbl{flex:1;font-size:14px;font-weight:600;color:#fff}
.i1-win-amt{font-size:14px;font-weight:800;color:#FB923C}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 02 — CREAM PASTEL
   ════════════════════════════════════════════════════════════════════ */
.i2{height:100%;overflow-y:auto;padding:50px 20px 96px;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif;color:#3A2E25;background:#FFF8F0}
.i2-sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#3A2E25;padding:0 4px 12px}
.i2-greet{margin:8px 4px 18px}
.i2-hello{font-size:13px;font-weight:600;color:#9B6B4A;letter-spacing:0.4px}
.i2-title{font-size:36px;font-weight:800;letter-spacing:-1.2px;color:#1F1612;line-height:1.05;margin-top:8px}
.i2-card{background:#fff;border-radius:22px;padding:18px;margin-bottom:14px;box-shadow:0 10px 30px -18px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.04)}
.i2-card-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.i2-card-em{width:50px;height:50px;border-radius:16px;background:linear-gradient(135deg,#FCE7D7,#F1ECFB);display:flex;align-items:center;justify-content:center;font-size:24px}
.i2-card-lbl{font-size:16px;font-weight:800;color:#1F1612;letter-spacing:-0.3px}
.i2-card-meta{font-size:11px;color:#9B6B4A;margin-top:2px;font-weight:600}
.i2-card-pct{margin-left:auto;font-size:26px;font-weight:900;color:#7C3AED;letter-spacing:-1px}
.i2-bar{height:10px;background:#FCE7D7;border-radius:99px;overflow:hidden;margin-bottom:14px}
.i2-bar-fill{height:100%;background:linear-gradient(90deg,#C4B5FD,#7C3AED 60%,#EA580C);border-radius:99px}
.i2-card-bottom{display:flex;justify-content:space-between;font-size:13px;color:#6B5544;font-weight:500}
.i2-card-bottom span{color:#1F1612;font-weight:800}
.i2-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.i2-mini{background:#fff;border-radius:18px;padding:14px;text-align:center;box-shadow:0 8px 20px -12px rgba(155,107,74,0.3),0 0 0 1px rgba(0,0,0,0.04)}
.i2-mini-peach{background:linear-gradient(135deg,#FFEDD5,#FED7AA)}
.i2-mini-em{font-size:22px;margin-bottom:4px}
.i2-mini-num{font-size:26px;font-weight:900;color:#1F1612;letter-spacing:-0.8px;line-height:1}
.i2-mini-lbl{font-size:11px;color:#9B6B4A;font-weight:600;margin-top:3px;letter-spacing:0.3px}
.i2-section{font-size:11px;letter-spacing:1.4px;color:#9B6B4A;font-weight:700;margin:14px 4px 8px;text-transform:uppercase}
.i2-list{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 20px -12px rgba(155,107,74,0.3),0 0 0 1px rgba(0,0,0,0.04)}
.i2-row{display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid #FCE7D7}
.i2-row:last-child{border-bottom:none}
.i2-row-em{width:30px;height:30px;border-radius:10px;background:#FFF1E4;display:flex;align-items:center;justify-content:center;font-size:14px}
.i2-row-lbl{flex:1;font-size:14px;font-weight:600;color:#1F1612}
.i2-row-amt{font-size:14px;font-weight:800;color:#EA580C}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 03 — BENTO GRID
   ════════════════════════════════════════════════════════════════════ */
.i3{height:100%;overflow-y:auto;padding:50px 16px 96px;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif;background:#F2F2F7;color:#000}
.i3-sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#000;padding:0 4px 12px}
.i3-head{display:flex;justify-content:space-between;align-items:flex-end;margin:6px 4px 14px}
.i3-eye{font-size:10px;letter-spacing:1.6px;color:#8E8E93;font-weight:700}
.i3-title{font-size:34px;font-weight:900;letter-spacing:-1.2px;color:#000;line-height:1;margin-top:4px}
.i3-search{width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:15px}
.i3-bento{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(0,auto);gap:10px}
.i3-tile{border-radius:22px;padding:14px}
.i3-tile-lg{grid-column:1/-1;padding:18px}
.i3-tile-sm{grid-column:span 1;text-align:left}
.i3-tile-md{grid-column:span 1}
.i3-tile-wide{grid-column:1/-1}
.i3-tile-white{background:#fff;color:#000}
.i3-tile-black{background:#0A0A0A;color:#fff}
.i3-tile-purple{background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff}
.i3-tile-orange{background:linear-gradient(135deg,#EA580C,#C2410C);color:#fff}
.i3-tile-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.i3-tile-em{width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-size:14px}
.i3-tile-white .i3-tile-em{background:#F2F2F7}
.i3-tile-mini{font-size:11px;font-weight:700;letter-spacing:0.4px;opacity:.85}
.i3-tile-big{font-size:42px;font-weight:900;letter-spacing:-2px;line-height:1;margin-top:6px}
.i3-tile-sub{font-size:12px;opacity:.75;margin-top:6px;font-weight:500}
.i3-tile-bar{height:6px;background:rgba(255,255,255,0.22);border-radius:99px;margin-top:14px;overflow:hidden}
.i3-tile-fill{height:100%;background:#fff;border-radius:99px}
.i3-tile-em-big{font-size:34px;line-height:1}
.i3-tile-num{font-size:38px;font-weight:900;letter-spacing:-1.5px;line-height:1;margin-top:4px}
.i3-tile-lbl{font-size:11px;font-weight:700;opacity:.85;margin-top:4px;letter-spacing:0.4px;text-transform:uppercase}
.i3-tile-stat{display:flex;align-items:baseline;gap:8px;margin-top:6px}
.i3-tile-stat-num{font-size:24px;font-weight:900;letter-spacing:-1px;line-height:1}
.i3-tile-stat-delta{font-size:11px;font-weight:800;color:#10B981}
.i3-mini-row{display:flex;justify-content:space-between;font-size:13px;font-weight:600;padding:6px 0;border-bottom:1px solid #F2F2F7}
.i3-mini-row:last-child{border-bottom:none}
.i3-mini-row b{color:#7C3AED}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 04 — STREAK HERO
   ════════════════════════════════════════════════════════════════════ */
.i4{height:100%;overflow-y:auto;padding:50px 20px 96px;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif;background:linear-gradient(180deg,#FFFBEB 0%,#FED7AA 80%);color:#7C2D12;text-align:center}
.i4-sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#7C2D12;padding:0 4px 18px;text-align:left}
.i4-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.i4-coin{width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;color:#EA580C;font-size:16px;box-shadow:0 4px 12px rgba(234,88,12,0.3)}
.i4-streak-pill{background:#fff;border-radius:99px;padding:6px 14px;font-size:14px;font-weight:900;color:#EA580C;box-shadow:0 4px 12px rgba(234,88,12,0.2)}
.i4-heart{background:#fff;border-radius:99px;padding:6px 12px;font-size:13px;font-weight:800;color:#1D4ED8;box-shadow:0 4px 12px rgba(29,78,216,0.15)}
.i4-flame{font-size:140px;line-height:1;margin:4px 0 -6px;filter:drop-shadow(0 14px 30px rgba(234,88,12,0.5))}
.i4-flame-num{font-size:84px;font-weight:900;letter-spacing:-3px;color:#fff;-webkit-text-stroke:3px #C2410C;line-height:1}
.i4-flame-lbl{font-size:14px;font-weight:800;color:#7C2D12;margin-top:6px;letter-spacing:-0.2px}
.i4-days{display:flex;justify-content:center;gap:6px;margin:18px 0 22px}
.i4-day{width:34px;height:34px;border-radius:10px;background:#FFEDD5;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:#9A3412;border:2px solid transparent}
.i4-day.on{background:#EA580C;color:#fff;box-shadow:0 4px 8px rgba(234,88,12,0.4)}
.i4-day.today{outline:3px solid #7C2D12;outline-offset:2px}
.i4-quest{background:#fff;border-radius:20px;padding:16px;box-shadow:0 12px 30px -12px rgba(124,45,18,0.3);text-align:left;margin-bottom:14px}
.i4-quest-top{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.i4-quest-em{font-size:24px}
.i4-quest-lbl{font-size:11px;color:#9A3412;font-weight:700;letter-spacing:0.8px;text-transform:uppercase}
.i4-quest-name{font-size:15px;font-weight:800;color:#1F1612;margin-top:2px;letter-spacing:-0.2px}
.i4-quest-bar{height:10px;background:#FED7AA;border-radius:99px;overflow:hidden}
.i4-quest-fill{height:100%;background:linear-gradient(90deg,#EA580C,#F59E0B);border-radius:99px}
.i4-quest-meta{font-size:11px;color:#9A3412;font-weight:600;margin-top:6px}
.i4-cta{background:#7C2D12;color:#fff;border-radius:14px;padding:14px;font-weight:800;font-size:15px;margin-bottom:12px;box-shadow:0 6px 0 #3E1709}
.i4-goal{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.7);border-radius:16px;padding:12px;backdrop-filter:blur(8px)}
.i4-goal-em{font-size:28px}
.i4-goal-info{flex:1;text-align:left}
.i4-goal-lbl{font-size:14px;font-weight:800;color:#1F1612}
.i4-goal-meta{font-size:11px;color:#9A3412;margin-top:2px;font-weight:600}
.i4-goal-pct{font-size:22px;font-weight:900;color:#EA580C;letter-spacing:-0.6px}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 05 — EDITORIAL
   ════════════════════════════════════════════════════════════════════ */
.i5{height:100%;overflow-y:auto;padding:46px 22px 96px;font-family:Georgia,"Iowan Old Style","Times New Roman",serif;background:#FBFAF7;color:#111}
.i5-sb{display:flex;justify-content:space-between;font-size:12px;font-weight:600;color:#111;padding:0 4px 12px;font-family:-apple-system,sans-serif}
.i5-masthead{display:flex;align-items:center;gap:10px;margin:6px 0 4px}
.i5-rule{flex:1;height:1px;background:#111}
.i5-mast-name{font-size:14px;font-weight:900;letter-spacing:6px;color:#111}
.i5-date{font-size:9px;font-weight:700;letter-spacing:2px;color:#5A5A5A;text-align:center;font-family:-apple-system,sans-serif;margin-bottom:18px}
.i5-headline{font-size:54px;line-height:0.95;letter-spacing:-2.5px;color:#111;font-weight:700;margin:4px 0 16px}
.i5-headline i{font-style:italic;color:#7C3AED}
.i5-deck{font-size:15px;line-height:1.55;color:#3F3F46;margin-bottom:22px}
.i5-deck b{color:#111;font-weight:800}
.i5-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #111;border-bottom:1px solid #111;padding:14px 0;margin-bottom:14px}
.i5-stat{text-align:center;padding:0 6px;border-right:1px solid #E4E4E7}
.i5-stat:last-child{border-right:none}
.i5-stat-num{font-size:30px;font-weight:800;letter-spacing:-1.4px;color:#111;line-height:1}
.i5-stat-num span{font-size:16px;color:#7C3AED;margin-left:1px;font-style:italic}
.i5-stat-lbl{font-size:10px;font-weight:600;color:#5A5A5A;letter-spacing:1.2px;text-transform:uppercase;margin-top:5px;font-family:-apple-system,sans-serif}
.i5-bar{height:3px;background:#E4E4E7;margin:0 0 22px}
.i5-bar-fill{height:100%;background:#7C3AED}
.i5-section{font-size:10px;letter-spacing:2px;color:#5A5A5A;font-weight:700;font-family:-apple-system,sans-serif;text-transform:uppercase;margin:0 0 10px;border-bottom:1px solid #E4E4E7;padding-bottom:6px}
.i5-dispatch{display:flex;gap:14px;padding:10px 0;border-bottom:1px dashed #E4E4E7;align-items:baseline}
.i5-dispatch-when{font-size:10px;font-weight:700;letter-spacing:1.4px;color:#7C3AED;width:46px;text-transform:uppercase;font-family:-apple-system,sans-serif}
.i5-dispatch-text{font-size:14px;color:#111;line-height:1.4;flex:1}
.i5-dispatch-text b{color:#7C3AED;font-weight:800;font-style:italic}
.i5-cta{margin-top:18px;display:inline-block;padding:12px 22px;border:1.5px solid #111;color:#111;font-size:13px;font-weight:700;letter-spacing:0.4px;border-radius:99px;font-family:-apple-system,sans-serif}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 06 — GLASS LAYER
   ════════════════════════════════════════════════════════════════════ */
.i6-bg{height:100%;position:relative;overflow:hidden}
.i6-blob{position:absolute;border-radius:50%;filter:blur(60px);opacity:.9}
.i6-blob-1{width:340px;height:340px;background:#6D28D9;top:-80px;left:-80px}
.i6-blob-2{width:300px;height:300px;background:#EA580C;top:30%;right:-100px}
.i6-blob-3{width:260px;height:260px;background:#3B82F6;bottom:-60px;left:-60px}
.i6{position:relative;height:100%;overflow-y:auto;padding:50px 20px 96px;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif;z-index:1}
.i6-sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#fff;padding:0 4px 18px}
.i6-greet{margin:0 4px 14px}
.i6-hi{font-size:28px;font-weight:800;letter-spacing:-0.8px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,0.3)}
.i6-sub{font-size:13px;color:rgba(255,255,255,0.8);margin-top:2px;font-weight:500}
.i6-glass{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);border-radius:22px;padding:18px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 16px 40px -16px rgba(0,0,0,0.5)}
.i6-glass-hero{margin-bottom:12px;text-align:center;position:relative;overflow:hidden}
.i6-eye{font-size:10px;letter-spacing:1.6px;color:rgba(255,255,255,0.7);font-weight:700;text-transform:uppercase}
.i6-goal-em{font-size:32px;margin:8px 0 4px}
.i6-goal-name{font-size:14px;font-weight:700;color:#fff;letter-spacing:-0.2px;margin-bottom:6px}
.i6-big{font-size:38px;font-weight:900;letter-spacing:-1.5px;color:#fff;line-height:1}
.i6-big-sub{font-size:18px;color:rgba(255,255,255,0.55);font-weight:600;margin-left:4px}
.i6-ring{margin-top:14px;display:flex;align-items:center;gap:12px}
.i6-ring-track{flex:1;height:8px;background:rgba(255,255,255,0.18);border-radius:99px;overflow:hidden}
.i6-ring-fill{height:100%;background:linear-gradient(90deg,#fff,#FBBF24);border-radius:99px;box-shadow:0 0 12px rgba(255,255,255,0.5)}
.i6-ring-pct{font-size:16px;font-weight:900;color:#fff;letter-spacing:-0.4px}
.i6-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.i6-glass-sm{padding:12px 8px;text-align:center}
.i6-sm-em{font-size:18px}
.i6-sm-num{font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.4px;margin-top:2px;line-height:1.1}
.i6-sm-lbl{font-size:10px;color:rgba(255,255,255,0.7);font-weight:600;margin-top:2px;letter-spacing:0.4px;text-transform:uppercase}
.i6-glass-list{padding:14px}
.i6-list-eye{font-size:10px;letter-spacing:1.6px;color:rgba(255,255,255,0.65);font-weight:700;text-transform:uppercase;margin-bottom:8px}
.i6-list-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:13px;color:#fff;font-weight:600}
.i6-list-row:last-child{border-bottom:none}
.i6-list-row b{margin-left:auto;color:#FBBF24;font-weight:800}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 07 — BRUTALIST MONO
   ════════════════════════════════════════════════════════════════════ */
.i7{height:100%;overflow-y:auto;padding:46px 16px 96px;font-family:"JetBrains Mono","SF Mono",Menlo,Consolas,monospace;background:#fff;color:#111;font-size:13px;line-height:1.55}
.i7-sb{display:flex;justify-content:space-between;font-size:11px;font-weight:700;padding:0 2px 12px;letter-spacing:0.4px}
.i7-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.i7-brand{font-size:14px;font-weight:800;letter-spacing:0;background:#111;color:#fff;padding:3px 8px}
.i7-dot{color:#10B981;font-size:14px}
.i7-line{font-size:11px;letter-spacing:0;color:#111;overflow:hidden;white-space:nowrap;margin:4px 0}
.i7-block{padding:6px 0}
.i7-kv{display:flex;justify-content:space-between;font-size:13px;padding:3px 0}
.i7-kv span:first-child{color:#5A5A5A}
.i7-kv span:last-child{color:#111;font-weight:700}
.i7-progress{padding:8px 0}
.i7-prog-row{font-size:12px;letter-spacing:0;white-space:nowrap}
.i7-prog-fill{color:#7C3AED;font-weight:900}
.i7-prog-empty{color:#D4D4D8}
.i7-section{font-size:12px;font-weight:800;letter-spacing:0;color:#7C3AED;margin:4px 0 6px}
.i7-log{font-size:12px;color:#3F3F46;letter-spacing:0;padding:1px 0}
.i7-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
.i7-btn{background:#111;color:#fff;text-align:center;padding:12px 6px;font-weight:800;font-size:12px;letter-spacing:0.4px;border-radius:0}
.i7-btn-ghost{background:#fff;color:#111;border:1.5px solid #111}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 08 — NEON CYBER
   ════════════════════════════════════════════════════════════════════ */
.i8{height:100%;position:relative;overflow-y:auto;padding:50px 20px 96px;font-family:"JetBrains Mono","SF Mono",Menlo,Consolas,monospace;background:#040409;color:#E4E4E7;font-size:13px}
.i8-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(167,139,250,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.06) 1px,transparent 1px);background-size:24px 24px;pointer-events:none;mask-image:radial-gradient(ellipse at 50% 30%, #000 30%, transparent 80%);-webkit-mask-image:radial-gradient(ellipse at 50% 30%, #000 30%, transparent 80%)}
.i8-sb,.i8-head,.i8-stack,.i8-amount-row,.i8-bar,.i8-bar-labels,.i8-stats,.i8-section,.i8-feed-row,.i8-cta{position:relative;z-index:1}
.i8-sb{display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:#E4E4E7;padding:0 4px 12px;letter-spacing:0.6px}
.i8-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.i8-brand{font-size:14px;font-weight:900;letter-spacing:3px;color:#A78BFA;text-shadow:0 0 12px rgba(167,139,250,0.6)}
.i8-id{font-size:10px;color:#52525B;letter-spacing:1.5px}
.i8-stack{margin-bottom:10px}
.i8-eye{font-size:10px;color:#A78BFA;letter-spacing:2px;font-weight:700}
.i8-name{font-size:24px;font-weight:900;letter-spacing:-0.5px;color:#fff;margin-top:4px;text-shadow:0 0 18px rgba(167,139,250,0.4);font-family:-apple-system,sans-serif}
.i8-amount-row{display:flex;align-items:baseline;gap:8px;margin-bottom:14px;font-family:-apple-system,sans-serif}
.i8-amount{font-size:54px;font-weight:900;letter-spacing:-2.5px;color:#fff;text-shadow:0 0 24px rgba(167,139,250,0.5);line-height:1}
.i8-of{font-size:18px;color:#71717A;font-weight:600}
.i8-bar{height:4px;background:rgba(167,139,250,0.18);border-radius:0;overflow:visible;position:relative;margin:8px 0 0}
.i8-bar-fill{height:100%;background:linear-gradient(90deg,#A78BFA,#EA580C);box-shadow:0 0 12px rgba(167,139,250,0.8)}
.i8-bar-ticks{position:absolute;inset:0;pointer-events:none}
.i8-tick{position:absolute;top:-3px;width:2px;height:10px;background:#52525B}
.i8-tick.on{background:#A78BFA;box-shadow:0 0 8px #A78BFA}
.i8-bar-labels{display:flex;justify-content:space-between;font-size:10px;color:#52525B;margin-top:14px;letter-spacing:1px;font-weight:700}
.i8-here{color:#EA580C;text-shadow:0 0 10px rgba(234,88,12,0.6)}
.i8-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:22px 0 16px}
.i8-stat{border:1px solid rgba(167,139,250,0.3);padding:12px 8px;text-align:center;background:rgba(167,139,250,0.04)}
.i8-stat-orange{border-color:rgba(234,88,12,0.4);background:rgba(234,88,12,0.06)}
.i8-stat-num{font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.4px;font-family:-apple-system,sans-serif;line-height:1}
.i8-stat-num span{font-size:11px;color:#71717A;margin-left:1px}
.i8-stat-lbl{font-size:9px;color:#71717A;font-weight:700;letter-spacing:1.4px;margin-top:5px}
.i8-section{font-size:10px;color:#A78BFA;letter-spacing:2px;font-weight:700;margin:0 0 8px}
.i8-feed-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed rgba(167,139,250,0.18);font-size:11px}
.i8-feed-time{color:#A78BFA;font-weight:700;width:42px;letter-spacing:0.6px}
.i8-feed-lbl{flex:1;color:#E4E4E7;letter-spacing:0.4px;font-weight:600}
.i8-feed-amt{color:#EA580C;font-weight:900;text-shadow:0 0 8px rgba(234,88,12,0.4)}
.i8-cta{margin-top:18px;background:#A78BFA;color:#000;text-align:center;padding:13px;font-weight:900;letter-spacing:2px;font-size:13px;box-shadow:0 0 24px rgba(167,139,250,0.5)}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 09 — PAPER STATEMENT
   ════════════════════════════════════════════════════════════════════ */
.i9{height:100%;overflow-y:auto;padding:46px 22px 96px;font-family:Georgia,"Iowan Old Style","Times New Roman",serif;background:#F5F0E6;color:#1F1B14;
  background-image:
    radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1px);
  background-size:3px 3px;
}
.i9-sb{display:flex;justify-content:space-between;font-size:12px;font-weight:600;color:#1F1B14;padding:0 4px 12px;font-family:-apple-system,sans-serif}
.i9-mast{margin:6px 0 14px;text-align:center}
.i9-mast-rule{height:2px;background:#1F1B14;margin:6px 0}
.i9-mast-name{font-size:18px;font-weight:900;letter-spacing:8px;color:#1F1B14;padding:6px 0}
.i9-mast-sub{font-size:9px;letter-spacing:2.4px;color:#6B5544;font-family:-apple-system,sans-serif;font-weight:700;margin-bottom:6px}
.i9-title{font-size:28px;font-style:italic;color:#1F1B14;text-align:center;letter-spacing:-0.4px;margin-bottom:6px;font-weight:400}
.i9-meta{font-size:11px;color:#5C4D38;text-align:center;font-family:-apple-system,sans-serif;letter-spacing:0.2px;margin-bottom:18px}
.i9-meta b{color:#1F1B14}
.i9-ledger{border-top:2px double #1F1B14;border-bottom:2px double #1F1B14;padding:8px 0;margin-bottom:14px}
.i9-l-head{display:flex;justify-content:space-between;font-size:10px;color:#6B5544;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;padding:4px 8px;font-family:-apple-system,sans-serif;border-bottom:1px solid #B8A988}
.i9-l-row{display:flex;justify-content:space-between;padding:7px 8px;font-size:14px;border-bottom:1px dashed #C9BC9A}
.i9-l-row:last-child{border-bottom:none}
.i9-l-row span:last-child{font-weight:700;font-variant-numeric:tabular-nums}
.i9-l-total{background:#EBE0CC;font-weight:800}
.i9-l-total span:first-child{font-style:italic}
.i9-bar{height:6px;background:#EBE0CC;margin:0 0 14px;position:relative}
.i9-bar-fill{height:100%;background:repeating-linear-gradient(45deg,#7C3AED,#7C3AED 4px,#9B59FF 4px,#9B59FF 8px)}
.i9-note{background:#fff;border-left:3px solid #7C3AED;padding:12px 14px;font-size:13px;line-height:1.55;color:#3C3528;margin-bottom:18px;font-style:italic;box-shadow:0 4px 12px rgba(0,0,0,0.04)}
.i9-note b{color:#1F1B14;font-style:normal}
.i9-section{font-size:11px;color:#6B5544;letter-spacing:2px;font-weight:700;text-transform:uppercase;font-family:-apple-system,sans-serif;margin-bottom:6px;border-bottom:1px solid #C9BC9A;padding-bottom:4px}
.i9-entries{margin-bottom:14px}
.i9-entry{display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px dashed #C9BC9A;font-size:14px}
.i9-e-date{font-size:10px;letter-spacing:1.4px;color:#7C3AED;font-weight:800;width:54px;font-family:-apple-system,sans-serif}
.i9-e-lbl{flex:1;color:#1F1B14;font-style:italic}
.i9-e-amt{font-weight:800;color:#1F1B14;font-variant-numeric:tabular-nums}
.i9-cta{display:inline-block;border:1.5px solid #1F1B14;color:#1F1B14;padding:11px 22px;border-radius:0;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;font-family:-apple-system,sans-serif}

/* ════════════════════════════════════════════════════════════════════
   ITERATION 10 — COACH MODE
   ════════════════════════════════════════════════════════════════════ */
.i10{height:100%;display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif;background:#0F1117;color:#fff;padding:46px 14px 0}
.i10-sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#fff;padding:0 6px 8px}
.i10-head{display:flex;align-items:center;gap:12px;padding:8px 6px 12px;border-bottom:1px solid rgba(255,255,255,0.06);margin:0 -8px 8px}
.i10-coach{display:flex;align-items:center;gap:10px;flex:1}
.i10-coach-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#7C5CE6,#EA580C);display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:16px;box-shadow:0 0 0 2px rgba(124,92,230,0.3)}
.i10-coach-name{font-size:14px;font-weight:800;color:#fff;letter-spacing:-0.2px}
.i10-coach-status{font-size:11px;color:#10B981;font-weight:600;margin-top:1px}
.i10-menu{color:#71717A;font-size:18px;padding:0 8px;cursor:pointer}
.i10-day{text-align:center;font-size:10px;color:#71717A;letter-spacing:1.4px;font-weight:700;margin:4px 0 10px}
.i10-msg{max-width:78%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.45;margin-bottom:6px;font-weight:500}
.i10-msg b{font-weight:800}
.i10-msg-them{background:#1C1F26;color:#fff;border-bottom-left-radius:4px;align-self:flex-start;margin-right:auto}
.i10-msg-me{background:linear-gradient(135deg,#7C5CE6,#9B7FE9);color:#fff;border-bottom-right-radius:4px;align-self:flex-end;margin-left:auto}
.i10-msg-card{padding:0;background:#1C1F26;border:1px solid rgba(255,255,255,0.05);max-width:88%;border-radius:18px;border-bottom-left-radius:4px;overflow:hidden;display:flex;align-items:center;gap:12px;padding:12px 14px}
.i10-card-em{font-size:30px}
.i10-card-info{flex:1;min-width:0}
.i10-card-lbl{font-size:14px;font-weight:800;color:#fff;letter-spacing:-0.2px}
.i10-card-meta{font-size:11px;color:#A1A1AA;margin:2px 0 6px;font-weight:600}
.i10-card-bar{height:5px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden}
.i10-card-fill{height:100%;background:linear-gradient(90deg,#7C5CE6,#EA580C);border-radius:99px}
.i10-replies{display:flex;flex-wrap:wrap;gap:6px;margin:14px 6px 8px;justify-content:flex-end}
.i10-reply{background:rgba(124,92,230,0.12);border:1px solid rgba(124,92,230,0.3);color:#C4B5FD;padding:7px 12px;border-radius:99px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s ease}
.i10-reply:hover{background:rgba(124,92,230,0.22)}
.i10-input{margin-top:auto;display:flex;align-items:center;gap:8px;background:#1C1F26;border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:6px 6px 6px 16px;margin-bottom:16px}
.i10-input-field{flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:14px;font-family:inherit;padding:8px 0}
.i10-input-field::placeholder{color:#52525B}
.i10-send{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7C5CE6,#9B7FE9);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;cursor:pointer;box-shadow:0 4px 12px rgba(124,92,230,0.4)}

/* ────────── Responsive ────────── */
@media (max-width: 768px){
  .g-header{padding:24px 18px 0}
  .g-h1{font-size:38px;letter-spacing:-1.5px}
  .g-section{padding:50px 18px 0}
  .g-section-name{font-size:24px}
  .g-num{width:48px;height:48px;font-size:18px}
  .g-stage{padding:30px 8px}
  .phone{transform:scale(0.78);transform-origin:top center;margin-bottom:-180px}
}
`;
