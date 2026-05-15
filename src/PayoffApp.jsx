import { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";
import { loadUserState, saveUserState, subscribeUserState } from "./firebase.js";

/* ────────────────────────────────────────────────────────────────────────────
   STATIC CONFIG
   ──────────────────────────────────────────────────────────────────────────── */

const GOALS = {
  deposit:  { id: "deposit",  label: "Home Deposit",         emoji: "🏠", target: 25000, startSaved: 8500, targetDate: "Aug 2027" },
  mortgage: { id: "mortgage", label: "Mortgage Overpayment", emoji: "💸", target: 12000, startSaved: 3200, targetDate: "Dec 2026" },
  rent:     { id: "rent",     label: "Rent Pot",             emoji: "🔑", target: 1450,  startSaved: 420,  targetDate: "Next month" },
};

const WIN_TYPES = [
  { id: "takeaway",   emoji: "🍕", label: "Skipped takeaway",     suggested: 12 },
  { id: "shopping",   emoji: "🛍️", label: "Didn't buy something", suggested: 25 },
  { id: "underspent", emoji: "💰", label: "Spent less",           suggested: 10 },
  { id: "refund",     emoji: "💳", label: "Got a refund",         suggested: 20 },
  { id: "other",      emoji: "✨", label: "Other win",            suggested: 5  },
];

const MILESTONES = {
  1: "Started", 3: "Building momentum", 6: "Locked in", 12: "Unstoppable", 24: "Legend",
};

const DAYS_PER_POUND = 1 / 5;
const toDays = (amt) => Math.round(amt * DAYS_PER_POUND * 10) / 10;
const MS_DAY = 86400000;

/* ────────────────────────────────────────────────────────────────────────────
   STREAK MATH
   ──────────────────────────────────────────────────────────────────────────── */

function getStreakData(wins, freezes, breakTs) {
  const now = new Date();
  if (wins.length === 0 && !breakTs)
    return { streak: 0, status: "broken", daysSinceLast: 999, streakMilestone: null, flameSize: 1 };

  const lastWinDate = wins.length > 0 ? wins[0].date : null;
  const daysSinceLast = lastWinDate ? (now.getTime() - lastWinDate.getTime()) / MS_DAY : 999;

  if (breakTs && daysSinceLast > 7) {
    const hoursSinceBreak = (now.getTime() - breakTs) / 3600000;
    if (hoursSinceBreak < 48)
      return { streak: 0, status: "recovery", daysSinceLast, streakMilestone: null, flameSize: 1 };
  }

  let streak = 0;
  let windowEnd = now.getTime();
  for (let i = 0; i < 52; i++) {
    const windowStart = windowEnd - 7 * MS_DAY;
    const hasWin = wins.some(w => w.date.getTime() >= windowStart && w.date.getTime() < windowEnd);
    if (hasWin) { streak++; windowEnd = windowStart; } else break;
  }

  const status =
    daysSinceLast <= 5 ? "active" :
    daysSinceLast <= 6 ? "at_risk" :
    daysSinceLast <= 7 ? "critical" :
    freezes > 0        ? "frozen"  : "broken";

  const flameSize = streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
  return { streak, status, daysSinceLast, streakMilestone: MILESTONES[streak] ?? null, flameSize };
}

function streakNudge(status, daysSinceLast, amount = 10) {
  const daysLeft = Math.max(0, Math.ceil(7 - daysSinceLast));
  const sub = `Add £${amount} → keep streak + move ${toDays(amount)} days sooner`;
  switch (status) {
    case "active":
      return { icon: "🔥", title: "Streak strong — keep it going", sub };
    case "at_risk":
      return { icon: "⚠️", title: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left to save your streak`, sub };
    case "critical":
      return { icon: "🚨", title: "Last day — don't break the chain", sub };
    case "broken":
      return { icon: "💔", title: "Rebuild your streak", sub: "Log a small win to start again today." };
    case "frozen":
      return { icon: "❄️", title: "Streak saved — life happens", sub: "Add a win to thaw the freeze." };
    case "recovery":
      return { icon: "⚡", title: "Comeback window open", sub: "Log a win now to recover." };
    default:
      return { icon: "✨", title: "Keep going", sub };
  }
}

function flameEmoji(_, status) {
  if (status === "broken") return "💤";
  if (status === "frozen") return "❄️";
  return "🔥";
}

function groupByDate(items) {
  const today = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const t0 = startOfDay(today);
  const labelFor = (d) => {
    const diff = Math.floor((t0 - startOfDay(d)) / MS_DAY);
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7)   return `${diff} days ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  const map = new Map();
  for (const w of items) {
    const key = labelFor(w.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(w);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function PageHeader({ goal, onSwitch }) {
  return (
    <div className="ph">
      <div className="ph-brand">Payoff</div>
      {goal && (
        <button className="ph-pill" onClick={onSwitch}>
          <span className="ph-pill-em">{goal.emoji}</span>
          <span className="ph-pill-lbl">{goal.label}</span>
          <span className="ph-pill-switch">Switch</span>
        </button>
      )}
    </div>
  );
}

function seedWins(goalId) {
  const now = Date.now();
  return [
    { id: `w-${goalId}-1`, typeId: "takeaway",   emoji: "🍕", label: "Skipped takeaway", amount: 12, days: toDays(12), date: new Date(now - 1 * MS_DAY) },
    { id: `w-${goalId}-2`, typeId: "underspent", emoji: "💰", label: "Spent less",       amount: 8,  days: toDays(8),  date: new Date(now - 3 * MS_DAY) },
    { id: `w-${goalId}-3`, typeId: "refund",     emoji: "💳", label: "Got a refund",     amount: 15, days: toDays(15), date: new Date(now - 8 * MS_DAY) },
  ];
}

/* ────────────────────────────────────────────────────────────────────────────
   APP
   ──────────────────────────────────────────────────────────────────────────── */

export default function PayoffApp() {
  const { user, signOut } = useAuth();

  const [tab, setTab]                       = useState("progress");
  const [loaded, setLoaded]                 = useState(false);
  const [goalId, setGoalId]                 = useState(null);
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);
  const goal = goalId ? GOALS[goalId] : null;

  const [saved, setSaved]       = useState(0);
  const [wins, setWins]         = useState([]);
  const [freezes, setFreezes]   = useState(1);
  const [breakTs, setBreakTs]   = useState(null);

  const [flamePulse, setFlamePulse] = useState(false);
  const [milestone, setMilestone]   = useState(null);

  const [winStep, setWinStep]     = useState(0);
  const [winType, setWinType]     = useState(null);
  const [winAmount, setWinAmount] = useState(null);

  const hydratedRef = useRef(false);

  /* ── Load persistent state on auth ── */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    hydratedRef.current = false;

    (async () => {
      try {
        const state = await loadUserState(user.uid);
        if (cancelled) return;
        if (state) {
          setGoalId(state.goalId ?? null);
          setSaved(state.saved ?? 0);
          setWins(state.wins ?? []);
          setFreezes(state.freezes ?? 1);
          setBreakTs(state.breakTs ?? null);
        }
      } catch (e) {
        console.warn("[Payoff] Could not load user state — starting fresh.", e);
      } finally {
        if (!cancelled) {
          hydratedRef.current = true;
          setTimeout(() => setLoaded(true), 80);
        }
      }
    })();

    let unsub = () => {};
    try {
      unsub = subscribeUserState(user.uid, (state) => {
        if (!state || !hydratedRef.current) return;
        setGoalId(state.goalId ?? null);
        setSaved(state.saved ?? 0);
        setWins(state.wins ?? []);
        setFreezes(state.freezes ?? 1);
        setBreakTs(state.breakTs ?? null);
      });
    } catch (e) {
      console.warn("[Payoff] Live sync unavailable.", e);
    }
    return () => { cancelled = true; unsub && unsub(); };
  }, [user]);

  /* ── Persist whenever state changes ── */
  useEffect(() => {
    if (!user || !hydratedRef.current) return;
    saveUserState(user.uid, { goalId, saved, wins, freezes, breakTs })
      .catch((e) => console.warn("[Payoff] Could not save state.", e));
  }, [user, goalId, saved, wins, freezes, breakTs]);

  const totalDaysClosed = wins.reduce((s, w) => s + w.days, 0);
  const pct = goal ? Math.min((saved / goal.target) * 100, 100) : 0;
  const remaining = goal ? Math.max(goal.target - saved, 0) : 0;
  const winDays = winAmount ? toDays(winAmount) : 0;

  const { streak, status, daysSinceLast, streakMilestone, flameSize } = getStreakData(wins, freezes, breakTs);
  const nudge = streakNudge(status, daysSinceLast, winAmount ?? 10);
  const daysLabel = (d) => `+${d} day${d === 1 ? "" : "s"} closer to your home`;
  const grouped = groupByDate(wins);

  const chooseGoal = (id) => {
    if (goalId !== id) {
      const g = GOALS[id];
      setSaved(g.startSaved);
      setWins(seedWins(id));
      setFreezes(1);
      setBreakTs(null);
    }
    setGoalId(id);
    setGoalPickerOpen(false);
    setTab("progress");
  };

  const openWin  = () => { setWinType(null); setWinAmount(null); setWinStep(1); };
  const closeWin = () => setWinStep(0);
  const pickType = (t) => { setWinType(t); setWinAmount(t.suggested); setWinStep(2); };
  const goResult = () => setWinStep(3);

  const finishWin = () => {
    if (!winType || !winAmount) return;
    const days = toDays(winAmount);
    const newWin = {
      id: `w${Date.now()}`,
      typeId: winType.id,
      emoji: winType.emoji,
      label: winType.label,
      amount: winAmount,
      days,
      date: new Date(),
    };
    const newWins = [newWin, ...wins];
    setSaved(p => p + winAmount);
    setWins(newWins);
    setBreakTs(null);

    const { streak: ns } = getStreakData(newWins, freezes, null);
    if (MILESTONES[ns] && MILESTONES[ns] !== streakMilestone) {
      setMilestone(MILESTONES[ns]);
      setTimeout(() => setMilestone(null), 3000);
    }
    setFlamePulse(true);
    setTimeout(() => setFlamePulse(false), 600);
    if (ns > 0 && ns % 3 === 0 && freezes < 2) setFreezes(f => f + 1);
    setWinStep(0);
  };

  const d = (delay) => ({
    className: `fu ${loaded ? "in" : ""}`,
    style: { transitionDelay: `${delay}s` },
  });

  /* ──────────────────────────────── RENDER ──────────────────────────────── */

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <div className="phone">
          <div className="notch" />
          <div className="screen">
            {milestone && (
              <div className="milestone-overlay">
                <div className="milestone-inner">
                  <div className="milestone-fire">{flameEmoji(flameSize, status)}</div>
                  <div className="milestone-weeks">{streak} week{streak === 1 ? "" : "s"}</div>
                  <div className="milestone-name">{milestone}</div>
                </div>
              </div>
            )}

            {/* ════════════════ ONBOARDING ════════════════ */}
            {!goal && (
              <div className="page onboard">
                <div className="sb"><span>9:41</span><span>•••</span><span>⚡ 91%</span></div>

                <div className="ob-brand" {...d(0)}>
                  <span className="ob-brand-em">🏡</span>
                  <span className="ob-brand-name">Payoff</span>
                </div>
                <div className="ob-slogan" {...d(0.08)}>
                  The fitness app for your home goals
                </div>

                <div className="ob-choose-wrap" {...d(0.16)}>
                  <div className="ob-choose">Choose a goal</div>
                </div>

                <div className="ob-cards">
                  {Object.keys(GOALS).map((id, i) => {
                    const g = GOALS[id];
                    return (
                      <button key={id} className="ob-card" {...d(0.24 + i * 0.08)} onClick={() => chooseGoal(id)}>
                        <div className="ob-card-em">{g.emoji}</div>
                        <div className="ob-card-body">
                          <div className="ob-card-lbl">{g.label}</div>
                          <div className="ob-card-meta">Target £{g.target.toLocaleString()} · {g.targetDate}</div>
                        </div>
                        <div className="ob-card-arr">→</div>
                      </button>
                    );
                  })}
                </div>

                <div className="ob-foot" {...d(0.6)}>
                  Signed in as <b>{user?.email}</b> · <button className="ob-out" onClick={signOut}>Sign out</button>
                </div>

                <div className="bottom-pad" />
              </div>
            )}

            {/* ════════════════ PROGRESS ════════════════ */}
            {goal && tab === "progress" && (
              <div className="page">
                <div className="sb"><span>9:41</span><span>•••</span><span>⚡ 91%</span></div>
                <PageHeader goal={goal} onSwitch={() => setGoalPickerOpen(true)} />

                {/* HERO — big BLACK numbers, immediate impact */}
                <div className="hero" {...d(0.04)}>
                  <div className="hero-eye">PROGRESS</div>
                  <div className="hero-saved">£{saved.toLocaleString()} <span className="hero-saved-sub">saved</span></div>
                  <div className="hero-days">{daysLabel(totalDaysClosed)}</div>

                  {/* Thick timeline with arrow tip */}
                  <div className="tl">
                    <div className="tl-track">
                      <div className="tl-fill" style={{ width: `${pct}%` }} />
                      <div className="tl-arrow" style={{ left: `${pct}%` }}>→</div>
                    </div>
                    <div className="tl-labels">
                      <span className="tl-label-l">£0</span>
                      <span className="tl-label-r">{goal.targetDate}</span>
                    </div>
                    <div className="tl-foot">
                      <span><b>£{remaining.toLocaleString()}</b> to go · target <b>£{goal.target.toLocaleString()}</b></span>
                    </div>
                  </div>

                  {/* Subtle streak row (less visual weight per client) */}
                  <div className={`hero-streak-row ${flamePulse ? "pulse" : ""}`}>
                    <span className="hsr-flame">{flameEmoji(flameSize, status)}</span>
                    <span className="hsr-num">{streak > 0 ? `${streak} week${streak === 1 ? "" : "s"}` : "Build streak"}</span>
                    <span className="hsr-state">{streakMilestone ?? nudge.title}</span>
                    {freezes > 0 && status !== "broken" && (
                      <span className="hsr-freeze">❄️ ×{freezes}</span>
                    )}
                  </div>
                </div>

                {/* Centered Add-a-win CTA */}
                <div className="addwin-wrap" {...d(0.1)}>
                  <button className="addwin-cta" onClick={openWin}>
                    <span className="addwin-plus">＋</span>
                    <span>Add a win</span>
                  </button>
                  <div className="addwin-hint">{nudge.sub}</div>
                </div>

                <div className="section-head" {...d(0.16)}>Recent wins</div>
                {wins.length === 0 && (
                  <div className="empty" {...d(0.18)}>
                    <div className="empty-em">🏁</div>
                    <div className="empty-t">No wins yet</div>
                    <div className="empty-s">Log your first win to start moving forward.</div>
                  </div>
                )}
                <div className="rw-list">
                  {wins.slice(0, 3).map((w, i) => (
                    <div className="rw" key={w.id} {...d(0.18 + i * 0.03)}>
                      <div className="rw-em">{w.emoji}</div>
                      <div className="rw-info">
                        <div className="rw-lbl">{w.label}</div>
                        <div className="rw-sub">£{w.amount}</div>
                      </div>
                      <div className="rw-days">{daysLabel(w.days)}</div>
                    </div>
                  ))}
                </div>

                {wins.length > 3 && (
                  <>
                    <div className="section-head" style={{ marginTop: 18 }}>All activity</div>
                    {grouped.map((group, gi) => (
                      <div key={group.label} {...d(0.24 + gi * 0.02)}>
                        <div className="day-label">{group.label}</div>
                        <div className="rw-compact-wrap">
                          {group.items.map(w => (
                            <div className="rw-compact" key={w.id}>
                              <span className="rw-compact-em">{w.emoji}</span>
                              <span className="rw-compact-lbl">{w.label}</span>
                              <span className="rw-compact-amt">£{w.amount}</span>
                              <span className="rw-compact-days">{daysLabel(w.days)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <div className="bottom-pad" />
              </div>
            )}

            {/* ════════════════ GOALS ════════════════ */}
            {goal && tab === "goals" && (
              <div className="page">
                <div className="sb"><span>9:41</span><span>•••</span><span>⚡ 91%</span></div>
                <PageHeader goal={goal} onSwitch={() => setGoalPickerOpen(true)} />

                <div className="gs" {...d(0.06)}>
                  <div className="gs-eye">YOUR ACTIVE GOAL</div>
                  <div className="gs-main">
                    <div className="gs-em">{goal.emoji}</div>
                    <div className="gs-info">
                      <div className="gs-lbl">{goal.label}</div>
                      <div className="gs-meta">Target £{goal.target.toLocaleString()} · {goal.targetDate}</div>
                    </div>
                  </div>
                  <div className="gs-grid">
                    <div className="gs-cell">
                      <div className="gs-cell-num">£{saved.toLocaleString()}</div>
                      <div className="gs-cell-lbl">saved</div>
                    </div>
                    <div className="gs-cell">
                      <div className="gs-cell-num">+{totalDaysClosed.toFixed(1)}</div>
                      <div className="gs-cell-lbl">days closer</div>
                    </div>
                  </div>
                  <button className="gs-btn" onClick={() => setGoalPickerOpen(true)}>Switch goal</button>
                </div>

                <div className="grid-2" {...d(0.12)}>
                  <div className="mini">
                    <div className="mini-em">🔥</div>
                    <div className="mini-num">{streak}</div>
                    <div className="mini-lbl">week streak</div>
                  </div>
                  <div className="mini mini-peach">
                    <div className="mini-em">🏆</div>
                    <div className="mini-num">{wins.length}</div>
                    <div className="mini-lbl">total wins</div>
                  </div>
                </div>

                <div className="section-head" {...d(0.16)}>Stats</div>
                <div className="prof" {...d(0.18)}>
                  <div className="prof-row"><span>Progress</span><span className="prof-r">{pct.toFixed(1)}%</span></div>
                  <div className="prof-row"><span>Target</span><span className="prof-r">£{goal.target.toLocaleString()}</span></div>
                  <div className="prof-row"><span>Target date</span><span className="prof-r">{goal.targetDate}</span></div>
                  <div className="prof-row"><span>Freezes</span><span className="prof-r">{freezes}</span></div>
                </div>

                <div className="section-head" {...d(0.24)}>Account</div>
                <div className="prof" {...d(0.26)}>
                  <div className="prof-row"><span>Signed in as</span><span className="prof-r">{user?.email}</span></div>
                  <button className="prof-row prof-row-btn" onClick={signOut}>
                    <span>Sign out</span><span className="prof-r">→</span>
                  </button>
                </div>

                <div className="bottom-pad" />
              </div>
            )}

            {/* ════════════════ CONNECT ════════════════ */}
            {goal && tab === "connect" && (
              <div className="page">
                <div className="sb"><span>9:41</span><span>•••</span><span>⚡ 91%</span></div>
                <PageHeader goal={goal} onSwitch={() => setGoalPickerOpen(true)} />

                <div className="cn-hero" {...d(0.06)}>
                  <div className="cn-hero-eye">COMING SOON</div>
                  <div className="cn-hero-big">Link your bank.<br />Wins find themselves.</div>
                  <div className="cn-hero-sub">Payoff spots round-ups, cashback, and unspent money — and lets you redirect it with one tap.</div>
                </div>

                <div className="section-head" {...d(0.1)}>How it works</div>
                {[
                  { n: "1", lbl: "Connect your accounts", sub: "Link any UK bank or loyalty card to spot extra money." },
                  { n: "2", lbl: "We find unused money",  sub: "Round-ups, cashback, underspend — automatically." },
                  { n: "3", lbl: "One tap to direct it",  sub: `Approve and watch your "${goal.label}" goal move closer.` },
                ].map((s, i) => (
                  <div className="cn-step" key={s.n} {...d(0.12 + i * 0.03)}>
                    <div className="cn-step-num">{s.n}</div>
                    <div className="cn-step-info">
                      <div className="cn-step-lbl">{s.lbl}</div>
                      <div className="cn-step-sub">{s.sub}</div>
                    </div>
                  </div>
                ))}

                <div className="section-head" {...d(0.22)}>Banks</div>
                {[
                  { em: "🏦", name: "Monzo" },
                  { em: "🏦", name: "Starling" },
                  { em: "🏦", name: "Barclays" },
                  { em: "🏦", name: "HSBC" },
                ].map((b, i) => (
                  <div className="cn-bank" key={b.name} {...d(0.24 + i * 0.02)}>
                    <div className="cn-bank-em">{b.em}</div>
                    <div className="cn-bank-info">
                      <div className="cn-bank-lbl">{b.name}</div>
                      <div className="cn-bank-sub">Open Banking · Read-only</div>
                    </div>
                    <div className="cn-bank-cta">Connect</div>
                  </div>
                ))}

                <div className="cn-trust" {...d(0.38)}>🔒 Bank-level encryption · FCA regulated · Read-only access</div>
                <div className="bottom-pad" />
              </div>
            )}

            {/* ════════════════ GOAL PICKER SHEET ════════════════ */}
            {goalPickerOpen && (
              <div className="sheet-backdrop" onClick={() => setGoalPickerOpen(false)}>
                <div className="sheet" onClick={e => e.stopPropagation()}>
                  <div className="sheet-handle" />
                  <div className="sheet-title">Switch goal</div>
                  <div className="sheet-sub">Pick the one you're racing toward</div>
                  <div className="ob-cards" style={{ marginTop: 14 }}>
                    {Object.keys(GOALS).map(id => {
                      const g = GOALS[id];
                      const isCurrent = id === goalId;
                      return (
                        <button key={id} className={`ob-card ${isCurrent ? "current" : ""}`} onClick={() => chooseGoal(id)}>
                          <div className="ob-card-em">{g.emoji}</div>
                          <div className="ob-card-body">
                            <div className="ob-card-lbl">{g.label}</div>
                            <div className="ob-card-meta">Target £{g.target.toLocaleString()} · {g.targetDate}</div>
                          </div>
                          <div className="ob-card-arr">{isCurrent ? "✓" : "→"}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════ ADD A WIN SHEET ════════════════ */}
            {winStep > 0 && (
              <div className="sheet-backdrop" onClick={closeWin}>
                <div className="sheet" onClick={e => e.stopPropagation()}>
                  <div className="sheet-handle" />

                  {winStep === 1 && (
                    <>
                      <div className="sheet-title">Add a win</div>
                      <div className="sheet-sub">Pick what you did</div>
                      <div className="aw-grid">
                        {WIN_TYPES.map(t => (
                          <button key={t.id} className="aw-tile" onClick={() => pickType(t)}>
                            <div className="aw-tile-em">{t.emoji}</div>
                            <div className="aw-tile-lbl">{t.label}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {winStep === 2 && winType && (
                    <>
                      <div className="sheet-title">How much?</div>
                      <div className="sheet-sub">{winType.emoji} {winType.label}</div>
                      <div className="aw-chips">
                        {[5, 10, 20, 30, 50].map(v => (
                          <button key={v} className={`aw-chip ${winAmount === v ? "sel" : ""}`} onClick={() => setWinAmount(v)}>£{v}</button>
                        ))}
                      </div>
                      <input
                        className="aw-input"
                        type="number"
                        placeholder="Enter your own"
                        value={winAmount && ![5, 10, 20, 30, 50].includes(winAmount) ? winAmount : ""}
                        onChange={e => setWinAmount(parseFloat(e.target.value) || null)}
                      />
                      <div className="aw-preview">
                        Direct £{winAmount || 0} → <b>{daysLabel(winDays)}</b>
                        <div className="aw-preview-sub">+ keeps your {streak} week streak alive</div>
                      </div>
                      <button className="aw-cta" disabled={!winAmount} onClick={goResult}>Continue →</button>
                    </>
                  )}

                  {winStep === 3 && goal && (
                    <div className="aw-impact">
                      <div className="aw-impact-eye">YOU JUST MOVED FORWARD ON</div>
                      <div className="aw-impact-goal">
                        <span className="aw-impact-goal-em">{goal.emoji}</span>
                        <span className="aw-impact-goal-lbl">{goal.label}</span>
                      </div>
                      <div className="aw-impact-big">{daysLabel(winDays)}</div>
                      <div className="aw-impact-streak">
                        {flameEmoji(flameSize, "active")} {streak + 1} week streak
                        {streakMilestone && <span className="aw-milestone-tag"> · {streakMilestone}</span>}
                      </div>
                      <div className="aw-impact-sub">From £{winAmount} · {winType?.label}</div>
                      <button className="aw-cta" onClick={finishWin}>Done</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════════ TABS ════════════════ */}
            {goal && (
              <div className="tabs">
                <div className={`tab ${tab === "goals" ? "on" : ""}`} onClick={() => setTab("goals")}>
                  <div className="tab-i">🎯</div><div className="tab-l">Goals</div>
                </div>
                <div className={`tab ${tab === "progress" ? "on" : ""}`} onClick={() => setTab("progress")}>
                  <div className="tab-i">📈</div><div className="tab-l">Progress</div>
                </div>
                <div className={`tab ${tab === "connect" ? "on" : ""}`} onClick={() => setTab("connect")}>
                  <div className="tab-i">🔗</div><div className="tab-l">Connect</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   STYLES — Cream Pastel (Design 2)
   ════════════════════════════════════════════════════════════════════════════ */

const CSS = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif}

.shell{
  min-height:100vh;
  background:linear-gradient(180deg,#FFF8F0 0%,#FCE7D7 100%);
  display:flex;align-items:center;justify-content:center;padding:24px;
}
.phone{
  position:relative;width:390px;height:844px;background:#fff;border-radius:48px;
  box-shadow:0 30px 80px rgba(155,107,74,0.25),0 0 0 12px #111 inset;
}
.notch{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:120px;height:32px;background:#000;border-radius:99px;z-index:5}
.screen{position:absolute;inset:11px;border-radius:38px;overflow:hidden;background:#FFF8F0;color:#1F1612}

.page{height:100%;overflow-y:auto;padding:50px 18px 0}
.bottom-pad{height:130px}
.sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#3A2E25;padding:0 4px 8px}

.fu{opacity:0;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease}
.fu.in{opacity:1;transform:none}

/* ── Milestone overlay ── */
.milestone-overlay{position:absolute;inset:0;background:rgba(124,58,237,0.92);z-index:50;display:flex;align-items:center;justify-content:center;animation:milestonePop .5s ease}
@keyframes milestonePop{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
.milestone-inner{text-align:center;color:#fff}
.milestone-fire{font-size:64px;margin-bottom:12px}
.milestone-weeks{font-size:48px;font-weight:900;letter-spacing:-2px;line-height:1}
.milestone-name{font-size:22px;font-weight:700;color:#FED7AA;margin-top:8px}

/* ── Page header (Payoff + goal switcher pill) ── */
.ph{display:flex;flex-direction:column;align-items:center;gap:10px;padding:2px 0 14px}
.ph-brand{font-size:24px;font-weight:900;letter-spacing:-1px;color:#1F1612;line-height:1}
.ph-pill{
  display:inline-flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #FCE7D7;
  border-radius:99px;padding:5px 6px 5px 12px;cursor:pointer;
  box-shadow:0 6px 18px -10px rgba(155,107,74,0.4);
  transition:transform .12s ease,border-color .2s ease;
}
.ph-pill:active{transform:scale(0.97);border-color:#7C3AED}
.ph-pill-em{font-size:15px}
.ph-pill-lbl{font-size:13px;font-weight:800;color:#1F1612;letter-spacing:-0.2px}
.ph-pill-switch{
  background:linear-gradient(135deg,#7C3AED,#EA580C);color:#fff;border:none;border-radius:99px;
  padding:4px 10px;font-size:11px;font-weight:800;cursor:pointer;
}

/* ════════════════════════════ ONBOARDING ════════════════════════════ */
.onboard{padding-top:0}
.ob-brand{display:flex;align-items:center;justify-content:center;gap:12px;padding:62px 20px 0}
.ob-brand-em{font-size:42px;line-height:1}
.ob-brand-name{font-size:50px;font-weight:900;letter-spacing:-2.5px;color:#1F1612;line-height:1}
.ob-slogan{text-align:center;font-size:15px;font-weight:600;color:#9B6B4A;margin-top:14px;padding:0 30px;letter-spacing:0.1px}
.ob-choose-wrap{display:flex;justify-content:center;margin-top:34px;margin-bottom:6px}
.ob-choose{
  background:#fff;border:1.5px solid #FCE7D7;border-radius:14px;padding:11px 28px;
  font-size:13px;font-weight:800;color:#9B6B4A;letter-spacing:0.3px;
  box-shadow:0 8px 22px -14px rgba(155,107,74,0.4);
}
.ob-cards{display:flex;flex-direction:column;gap:12px;margin-top:24px;padding:0 2px}
.ob-card{
  display:flex;align-items:center;gap:14px;background:#fff;border:1.5px solid #FCE7D7;
  border-radius:20px;padding:14px;cursor:pointer;width:100%;text-align:left;
  box-shadow:0 10px 28px -18px rgba(155,107,74,0.45),0 0 0 1px rgba(0,0,0,0.02);
  transition:transform .12s ease,border-color .2s ease;
}
.ob-card:active{transform:scale(0.98);border-color:#7C3AED}
.ob-card.current{border-color:#7C3AED;background:#F1ECFB}
.ob-card-em{
  font-size:28px;flex-shrink:0;width:54px;height:54px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#FCE7D7,#F1ECFB);border-radius:16px;
}
.ob-card-body{flex:1;min-width:0}
.ob-card-lbl{font-size:16px;font-weight:800;color:#1F1612;letter-spacing:-0.3px}
.ob-card-meta{font-size:12px;color:#9B6B4A;margin-top:4px;font-weight:600}
.ob-card-arr{font-size:20px;color:#7C3AED;font-weight:700;margin-left:auto;flex-shrink:0}

.ob-foot{margin-top:22px;text-align:center;font-size:12px;color:#9B6B4A;font-weight:500}
.ob-foot b{color:#1F1612;font-weight:700}
.ob-out{background:none;border:none;color:#7C3AED;font-weight:800;cursor:pointer;padding:0;font-size:12px}

/* ════════════════════════════ PROGRESS HERO ════════════════════════════ */
.hero{
  background:#fff;border-radius:24px;padding:20px 18px 18px;margin-bottom:14px;
  box-shadow:0 14px 36px -22px rgba(155,107,74,0.5),0 0 0 1px rgba(0,0,0,0.03);
}
.hero-eye{font-size:11px;letter-spacing:1.6px;color:#9B6B4A;font-weight:700;margin-bottom:8px}

/* BIG BLACK BOLD — the headline of the page (per client) */
.hero-saved{
  font-size:40px;font-weight:900;letter-spacing:-1.5px;color:#1F1612;line-height:1;
}
.hero-saved-sub{font-size:18px;font-weight:700;color:#9B6B4A;letter-spacing:-0.4px;margin-left:6px}
.hero-days{
  font-size:24px;font-weight:900;letter-spacing:-0.7px;color:#1F1612;
  margin-top:6px;line-height:1.15;
}

/* Thick visible progress timeline with arrow tip */
.tl{margin-top:18px}
.tl-track{
  position:relative;height:14px;background:#FCE7D7;border-radius:99px;overflow:visible;
}
.tl-fill{
  height:100%;background:linear-gradient(90deg,#C4B5FD,#7C3AED 55%,#EA580C);
  border-radius:99px;transition:width .6s ease;box-shadow:0 4px 10px -4px rgba(124,58,237,0.5);
}
.tl-arrow{
  position:absolute;top:50%;transform:translate(-2px,-50%);
  color:#EA580C;font-weight:900;font-size:22px;line-height:1;
  text-shadow:0 1px 0 #fff;transition:left .6s ease;pointer-events:none;
}
.tl-labels{display:flex;justify-content:space-between;margin-top:8px;font-size:11px;font-weight:700}
.tl-label-l{color:#9B6B4A}
.tl-label-r{color:#EA580C}
.tl-foot{margin-top:4px;font-size:12px;color:#6B5544;font-weight:500}
.tl-foot b{color:#1F1612;font-weight:800}

/* Subtle streak row (less prominent per client) */
.hero-streak-row{
  display:flex;align-items:center;gap:8px;margin-top:14px;padding:8px 12px;
  background:#FFF1E4;border-radius:12px;font-size:12px;
}
.hsr-flame{font-size:16px;transition:transform .3s}
.pulse .hsr-flame{animation:flamePulse .6s ease}
@keyframes flamePulse{0%{transform:scale(1)}40%{transform:scale(1.5)}100%{transform:scale(1)}}
.hsr-num{font-weight:800;color:#1F1612}
.hsr-state{flex:1;color:#9B6B4A;font-weight:600;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hsr-freeze{font-size:11px;font-weight:800;color:#1D4ED8;background:#EFF6FF;border-radius:99px;padding:2px 8px}

/* Centered Add-a-win (per client: "middle") */
.addwin-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 22px}
.addwin-cta{
  display:inline-flex;align-items:center;gap:10px;
  background:linear-gradient(135deg,#7C3AED,#EA580C);color:#fff;border:none;
  border-radius:99px;padding:15px 32px;font-size:16px;font-weight:900;cursor:pointer;
  letter-spacing:-0.3px;box-shadow:0 14px 28px -10px rgba(124,58,237,0.55);
  transition:transform .12s ease;
}
.addwin-cta:active{transform:scale(0.97)}
.addwin-plus{font-size:22px;line-height:1;font-weight:400}
.addwin-hint{font-size:11px;color:#9B6B4A;font-weight:600;text-align:center;max-width:280px}

/* Section heads */
.section-head{font-size:11px;letter-spacing:1.4px;color:#9B6B4A;font-weight:800;margin:8px 4px 10px;text-transform:uppercase}
.day-label{font-size:10px;letter-spacing:1.3px;color:#9B6B4A;font-weight:700;margin:14px 4px 6px;text-transform:uppercase}

/* Recent wins — cream cards */
.rw-list{display:flex;flex-direction:column;gap:8px}
.rw{
  display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;padding:12px;
  box-shadow:0 8px 22px -16px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.03);
}
.rw-em{
  width:38px;height:38px;border-radius:12px;background:#FFF1E4;
  display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;
}
.rw-info{flex:1;min-width:0}
.rw-lbl{font-size:14px;font-weight:700;color:#1F1612}
.rw-sub{font-size:11px;color:#9B6B4A;margin-top:2px;font-weight:600}
.rw-days{font-size:12px;font-weight:800;color:#7C3AED;white-space:nowrap;text-align:right;min-width:90px}

.rw-compact-wrap{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 22px -16px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.03)}
.rw-compact{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid #FCE7D7}
.rw-compact:last-child{border-bottom:none}
.rw-compact-em{font-size:15px;flex-shrink:0;width:22px;text-align:center}
.rw-compact-lbl{flex:1;font-size:13px;font-weight:600;color:#1F1612;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rw-compact-amt{font-size:12px;color:#9B6B4A;font-weight:600;flex-shrink:0;margin-right:4px}
.rw-compact-days{font-size:11px;font-weight:800;color:#7C3AED;flex-shrink:0;white-space:nowrap}

.empty{text-align:center;padding:32px 20px;background:#fff;border:1.5px dashed #FCE7D7;border-radius:18px}
.empty-em{font-size:32px;margin-bottom:8px}
.empty-t{font-size:15px;font-weight:800;color:#1F1612;margin-bottom:4px}
.empty-s{font-size:12px;color:#9B6B4A;line-height:1.4;font-weight:500}

/* ════════════════════════════ GOALS PAGE ════════════════════════════ */
.gs{
  background:#fff;border-radius:22px;padding:18px;margin-bottom:14px;
  box-shadow:0 14px 36px -22px rgba(155,107,74,0.5),0 0 0 1px rgba(0,0,0,0.03);
}
.gs-eye{font-size:11px;letter-spacing:1.6px;color:#9B6B4A;font-weight:800;margin-bottom:12px}
.gs-main{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.gs-em{
  font-size:32px;width:60px;height:60px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#FCE7D7,#F1ECFB);border-radius:18px;flex-shrink:0;
}
.gs-info{flex:1;min-width:0}
.gs-lbl{font-size:20px;font-weight:900;color:#1F1612;letter-spacing:-0.5px;line-height:1.15}
.gs-meta{font-size:12px;color:#9B6B4A;margin-top:4px;font-weight:600}
.gs-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.gs-cell{background:#FFF1E4;border-radius:14px;padding:12px;text-align:center}
.gs-cell-num{font-size:22px;font-weight:900;color:#1F1612;letter-spacing:-0.6px;line-height:1}
.gs-cell-lbl{font-size:11px;color:#9B6B4A;margin-top:3px;font-weight:700;letter-spacing:0.3px}
.gs-btn{
  width:100%;background:linear-gradient(135deg,#7C3AED,#EA580C);color:#fff;border:none;border-radius:12px;
  padding:12px;font-size:14px;font-weight:800;cursor:pointer;transition:transform .12s ease;
}
.gs-btn:active{transform:scale(0.98)}

.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px}
.mini{
  background:#fff;border-radius:18px;padding:14px;text-align:center;
  box-shadow:0 8px 22px -16px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.03);
}
.mini-peach{background:linear-gradient(135deg,#FFEDD5,#FED7AA)}
.mini-em{font-size:22px;margin-bottom:4px}
.mini-num{font-size:26px;font-weight:900;color:#1F1612;letter-spacing:-0.8px;line-height:1}
.mini-lbl{font-size:11px;color:#9B6B4A;font-weight:700;margin-top:3px;letter-spacing:0.3px}

.prof{
  background:#fff;border-radius:16px;overflow:hidden;
  box-shadow:0 8px 22px -16px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.03);
}
.prof-row{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;font-size:13px;color:#1F1612;font-weight:700;border-bottom:1px solid #FCE7D7;background:none;border-left:none;border-right:none;border-top:none;width:100%;text-align:left;cursor:default}
.prof-row:last-child{border-bottom:none}
.prof-r{color:#9B6B4A;font-weight:600}
.prof-row-btn{cursor:pointer}
.prof-row-btn:hover{background:#FFF1E4}
.prof-row-btn .prof-r{color:#7C3AED;font-weight:800}

/* ════════════════════════════ CONNECT PAGE ════════════════════════════ */
.cn-hero{
  background:linear-gradient(135deg,#F1ECFB 0%,#FFF1E4 100%);
  border-radius:20px;padding:18px;margin-bottom:14px;
  box-shadow:0 10px 28px -18px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.03);
}
.cn-hero-eye{font-size:10px;letter-spacing:1.6px;color:#7C3AED;font-weight:800}
.cn-hero-big{font-size:24px;font-weight:900;letter-spacing:-0.6px;color:#1F1612;margin:8px 0 10px;line-height:1.2}
.cn-hero-sub{font-size:13px;color:#6B5544;line-height:1.5;font-weight:500}
.cn-step{display:flex;align-items:flex-start;gap:14px;background:#fff;border-radius:14px;padding:14px;margin-bottom:8px;box-shadow:0 6px 18px -14px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.03)}
.cn-step-num{flex-shrink:0;width:32px;height:32px;border-radius:99px;background:linear-gradient(135deg,#7C3AED,#EA580C);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800}
.cn-step-info{flex:1;min-width:0}
.cn-step-lbl{font-size:14px;font-weight:800;color:#1F1612;margin-bottom:3px}
.cn-step-sub{font-size:12px;color:#6B5544;line-height:1.45;font-weight:500}
.cn-bank{display:flex;align-items:center;gap:12px;background:#fff;border-radius:14px;padding:12px;margin-bottom:8px;box-shadow:0 6px 18px -14px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.03)}
.cn-bank-em{width:36px;height:36px;border-radius:10px;background:#FFF1E4;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.cn-bank-info{flex:1;min-width:0}
.cn-bank-lbl{font-size:14px;font-weight:800;color:#1F1612}
.cn-bank-sub{font-size:11px;color:#9B6B4A;margin-top:2px;font-weight:600}
.cn-bank-cta{font-size:12px;font-weight:800;color:#7C3AED;background:#F1ECFB;padding:6px 12px;border-radius:99px}
.cn-trust{font-size:11px;color:#9B6B4A;text-align:center;margin-top:14px;padding:0 12px;line-height:1.5;font-weight:600}

/* ════════════════════════════ SHEETS ════════════════════════════ */
.sheet-backdrop{position:absolute;inset:0;background:rgba(31,22,18,0.45);backdrop-filter:blur(6px);z-index:30;display:flex;align-items:flex-end;animation:fadein .25s ease}
@keyframes fadein{from{opacity:0}to{opacity:1}}
.sheet{
  width:100%;background:#FFF8F0;border-radius:28px 28px 0 0;padding:14px 20px 24px;
  max-height:90%;overflow-y:auto;animation:slideup .3s cubic-bezier(.2,.8,.2,1);
}
@keyframes slideup{from{transform:translateY(100%)}to{transform:translateY(0)}}
.sheet-handle{width:36px;height:4px;background:#FCE7D7;border-radius:99px;margin:2px auto 14px}
.sheet-title{font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#1F1612;text-align:center}
.sheet-sub{font-size:13px;color:#9B6B4A;text-align:center;margin-top:4px;margin-bottom:18px;font-weight:600}

.aw-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.aw-tile{background:#fff;border:1.5px solid #FCE7D7;border-radius:16px;padding:18px 12px;text-align:center;cursor:pointer;transition:transform .12s ease,border-color .2s ease}
.aw-tile:active{transform:scale(0.96);border-color:#7C3AED}
.aw-tile:nth-child(5){grid-column:1/-1}
.aw-tile-em{font-size:28px;margin-bottom:6px}
.aw-tile-lbl{font-size:13px;font-weight:700;color:#1F1612}

.aw-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px}
.aw-chip{background:#fff;border:1.5px solid #FCE7D7;border-radius:99px;padding:10px 18px;font-size:14px;font-weight:800;color:#9B6B4A;cursor:pointer;transition:border-color .2s ease,background .2s ease,color .2s ease}
.aw-chip.sel{border-color:#7C3AED;background:#F1ECFB;color:#7C3AED}
.aw-input{width:100%;background:#fff;border:1.5px solid #FCE7D7;border-radius:14px;padding:14px;font-size:15px;font-weight:600;color:#1F1612;margin-bottom:14px;outline:none;transition:border-color .2s ease}
.aw-input:focus{border-color:#7C3AED}
.aw-preview{background:linear-gradient(135deg,#F1ECFB,#FFF1E4);border-radius:14px;padding:14px;font-size:14px;font-weight:700;color:#1F1612;text-align:center;margin-bottom:14px;line-height:1.4}
.aw-preview-sub{font-size:12px;color:#7C3AED;margin-top:4px;font-weight:700}
.aw-cta{width:100%;background:linear-gradient(135deg,#7C3AED,#EA580C);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:900;cursor:pointer;letter-spacing:-0.2px;transition:transform .12s ease}
.aw-cta:active{transform:scale(0.98)}
.aw-cta:disabled{opacity:.4;cursor:not-allowed}

.aw-impact{display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px 12px 12px;animation:popin .5s cubic-bezier(.2,.8,.2,1)}
@keyframes popin{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
.aw-impact-eye{font-size:11px;letter-spacing:1.8px;color:#7C3AED;font-weight:800}
.aw-impact-big{font-size:32px;font-weight:900;letter-spacing:-1px;color:#1F1612;margin:10px 0 6px;line-height:1.1}
.aw-impact-streak{font-size:17px;font-weight:900;color:#EA580C;margin-bottom:8px}
.aw-milestone-tag{font-size:13px;color:#7C3AED}
.aw-impact-sub{font-size:14px;color:#6B5544;font-weight:600;margin-bottom:24px}
.aw-impact .aw-cta{align-self:stretch;margin-top:8px}
.aw-impact-goal{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #FCE7D7;border-radius:99px;padding:6px 14px 6px 6px;margin:8px 0}
.aw-impact-goal-em{font-size:20px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#F1ECFB;border-radius:99px}
.aw-impact-goal-lbl{font-size:14px;font-weight:900;color:#7C3AED;letter-spacing:-0.2px}

/* ════════════════════════════ TABS ════════════════════════════ */
.tabs{
  position:absolute;bottom:0;left:0;right:0;background:rgba(255,248,240,0.94);backdrop-filter:blur(10px);
  border-top:1px solid #FCE7D7;display:grid;grid-template-columns:1fr 1fr 1fr;padding:6px 0 14px;z-index:20;
}
.tab{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px;cursor:pointer;color:#9B6B4A;transition:color .2s ease}
.tab.on{color:#7C3AED}
.tab-i{font-size:20px;filter:grayscale(0.6);transition:filter .2s}
.tab.on .tab-i{filter:none}
.tab-l{font-size:10px;font-weight:800;letter-spacing:0.2px}

/* ── Responsive (mobile full screen) ── */
@media (max-width:430px){
  .shell{padding:0}
  .phone{width:100vw;height:100vh;border-radius:0;box-shadow:none}
  .notch{display:none}
  .screen{inset:0;border-radius:0;padding-top:0}
  .page{padding-top:38px}
}
`;
