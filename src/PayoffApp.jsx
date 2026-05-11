import { useState, useEffect } from "react";

const GOALS = {
  deposit:  { id: "deposit",  label: "Home Deposit",         emoji: "🏠", target: 25000, startSaved: 8500, targetDate: "Aug 2027" },
  mortgage: { id: "mortgage", label: "Mortgage Overpayment", emoji: "💸", target: 12000, startSaved: 3200, targetDate: "Dec 2026" },
  rent:     { id: "rent",     label: "Rent Pot",             emoji: "🏘️", target: 1450,  startSaved: 420,  targetDate: "Next month" },
};

const WIN_TYPES = [
  { id: "takeaway",   emoji: "🍕", label: "Skipped takeaway",     suggested: 12 },
  { id: "shopping",   emoji: "🛍️", label: "Didn't buy something", suggested: 25 },
  { id: "underspent", emoji: "💰", label: "Spent less",           suggested: 10 },
  { id: "refund",     emoji: "💳", label: "Got a refund",         suggested: 20 },
  { id: "other",      emoji: "✨", label: "Other win",            suggested: 5  },
];

const MILESTONES = {
  1:  "Started",
  3:  "Building momentum",
  6:  "Locked in",
  12: "Unstoppable",
  24: "Legend",
};

const DAYS_PER_POUND = 1 / 5;
const toDays = (amt) => Math.round(amt * DAYS_PER_POUND * 10) / 10;
const MS_DAY = 86400000;

function getStreakData(wins, freezes, breakTs) {
  const now = new Date();
  if (wins.length === 0 && breakTs === null)
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
    freezes > 0        ? "frozen" : "broken";

  const flameSize = streak >= 6 ? 3 : streak >= 3 ? 2 : 1;

  return { streak, status, daysSinceLast, streakMilestone: MILESTONES[streak] ?? null, flameSize };
}

function streakNudge(status, daysSinceLast, amount = 10) {
  const daysLeft = Math.max(0, Math.ceil(7 - daysSinceLast));
  const sub = `Add £${amount} → keep streak + move ${toDays(amount)} days sooner`;
  switch (status) {
    case "active":
      return { icon: "🔥", title: "Streak strong — keep it going",
        sub, color: "#0F766E", bg: "#ECFDF5", border: "#A7F3D0" };
    case "at_risk":
      return { icon: "⚠️", title: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left to save your streak`,
        sub, color: "#92400E", bg: "#FFFBEB", border: "#FCD34D" };
    case "critical":
      return { icon: "🚨", title: "Last day — don't break the chain",
        sub, color: "#9F1239", bg: "#FFF1F2", border: "#FECDD3" };
    case "broken":
      return { icon: "💔", title: "You lost your streak — let's rebuild",
        sub: "Log a small win to start a new streak today.",
        color: "#374151", bg: "#F3F4F6", border: "#E5E7EB" };
    case "frozen":
      return { icon: "❄️", title: "Streak saved — life happens",
        sub: "Your freeze kicked in. Add a win to thaw it.",
        color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" };
    case "recovery":
      return { icon: "⚡", title: "Quick comeback window open",
        sub: "Log a win now to recover your streak.",
        color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
    default:
      return { icon: "✨", title: "Keep going", sub, color: "#374151", bg: "#F3F4F6", border: "#E5E7EB" };
  }
}

function flameEmoji(size, status) {
  if (status === "broken") return "💤";
  if (status === "frozen") return "❄️";
  if (size >= 3) return "🔥";
  if (size >= 2) return "🔥";
  return "🔥";
}

function groupByDate(items) {
  const today = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const t0 = startOfDay(today);
  const labelFor = (d) => {
    const diff = Math.floor((t0 - startOfDay(d)) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
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

export default function PayoffApp() {
  const [tab, setTab] = useState("goals");
  const [loaded, setLoaded] = useState(false);
  const [goalId, setGoalId] = useState(null);
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);
  const goal = goalId ? GOALS[goalId] : null;

  const [saved, setSaved] = useState(0);
  const [wins, setWins] = useState([]);
  const [freezes, setFreezes] = useState(1);
  const [breakTs, setBreakTs] = useState(null);

  const [flamePulse, setFlamePulse] = useState(false);
  const [milestone, setMilestone] = useState(null);

  const [winStep, setWinStep] = useState(0);
  const [winType, setWinType] = useState(null);
  const [winAmount, setWinAmount] = useState(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  const totalDaysClosed = wins.reduce((s, w) => s + w.days, 0);
  const pct = goal ? Math.min((saved / goal.target) * 100, 100) : 0;
  const winDays = winAmount ? toDays(winAmount) : 0;

  const { streak, status, daysSinceLast, streakMilestone, flameSize } = getStreakData(wins, freezes, breakTs);
  const nudge = streakNudge(status, daysSinceLast, winAmount ?? 10);
  const daysLabel = (d) => `+${d} day${d === 1 ? "" : "s"} closer to your home`;
  const grouped = groupByDate(wins);

  const chooseGoal = (id) => {
    if (goalId !== id) {
      const g = GOALS[id];
      const now = Date.now();
      setSaved(g.startSaved);
      setWins([
        { id: `w-${id}-1`, typeId: "takeaway",   emoji: "🍕", label: "Skipped takeaway", amount: 12, days: toDays(12), date: new Date(now - 1 * MS_DAY) },
        { id: `w-${id}-2`, typeId: "underspent", emoji: "💰", label: "Spent less",       amount: 8,  days: toDays(8),  date: new Date(now - 3 * MS_DAY) },
        { id: `w-${id}-3`, typeId: "refund",     emoji: "💳", label: "Got a refund",     amount: 15, days: toDays(15), date: new Date(now - 8 * MS_DAY) },
      ]);
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

  const PageHeader = () => (
    <div className="page-header">
      <div className="page-header-brand">Payoff</div>
      {goal && (
        <div className="page-header-goal">
          <span className="page-header-goal-em">{goal.emoji}</span>
          <span className="page-header-goal-lbl">{goal.label}</span>
          <button className="page-header-switch" onClick={() => setGoalPickerOpen(true)}>Switch</button>
        </div>
      )}
    </div>
  );

  const StreakBar = () => (
    <div className="nudge-bar" style={{ background: nudge.bg, borderColor: nudge.border }}>
      <span className="nudge-icon">{nudge.icon}</span>
      <div style={{ flex: 1 }}>
        <div className="nudge-title" style={{ color: nudge.color }}>{nudge.title}</div>
        <div className="nudge-sub">{nudge.sub}</div>
      </div>
      {freezes > 0 && status !== "broken" && (
        <div className="freeze-badge">❄️ ×{freezes}</div>
      )}
    </div>
  );

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

            {/* ══ ONBOARDING ══ */}
            {!goal && (
              <div className="page onboard">
                <div className="sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
                <div className="ob-brand-block" {...d(0)}>
                  <div className="ob-brand-inline">
                    <span className="ob-hero-logo">🏆</span>
                    <span className="ob-hero-name">Payoff</span>
                  </div>
                </div>
                <div className="ob-slogan-block" {...d(0.1)}>
                  The fitness app for your home goals
                </div>
                <div className="ob-choose-wrap" {...d(0.2)}>
                  <div className="ob-choose-box">Choose a goal</div>
                </div>
                <div className="ob-cards">
                  {Object.keys(GOALS).map((id, i) => {
                    const g = GOALS[id];
                    return (
                      <button key={id} className="ob-card" {...d(0.28 + i * 0.08)} onClick={() => chooseGoal(id)}>
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
                <div className="bottom-pad" />
              </div>
            )}

            {/* ══ PROGRESS ══ */}
            {goal && tab === "progress" && (
              <div className="page">
                <div className="sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
                <PageHeader />
                <div className="hero" {...d(0.06)}>
                  <div className="hero-glow" />
                  <div className="hero-eye">PROGRESS</div>
                  <div className="hero-big">{daysLabel(totalDaysClosed)}</div>
                  <div
                    className={`hero-streak ${flamePulse ? "pulse" : ""}`}
                    style={{
                      color:
                        status === "broken" ? "#9CA3AF" :
                        status === "at_risk" || status === "critical" ? "#E87A4A" :
                        "#7C5CE6",
                    }}
                  >
                    <span className="streak-flame">{flameEmoji(flameSize, status)}</span>
                    <span className="streak-count">
                      {streak > 0 ? `${streak} week${streak === 1 ? "" : "s"} streak` : "Build your streak"}
                    </span>
                    {streak > 0 && streakMilestone && (
                      <span className="streak-milestone-badge">{streakMilestone}</span>
                    )}
                  </div>
                  {/* SINGLE TIMELINE — saved label, track with fill, end date */}
                  <div className="hero-timeline">
                    <div className="hero-tl-left">
                      <div className="hero-tl-dot hero-tl-dot-start" />
                      <span className="hero-tl-label">£{saved.toLocaleString()} saved</span>
                    </div>
                    <div className="hero-tl-track">
                      <div className="hero-tl-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="hero-tl-right">
                      <div className="hero-tl-dot hero-tl-dot-end" />
                      <span className="hero-tl-label">{goal.targetDate}</span>
                    </div>
                  </div>
                </div>

                <StreakBar />

                <button className="cta-primary" {...d(0.1)} onClick={openWin}>＋ Add a win</button>

                <div className="recent-head" {...d(0.14)}>Recent wins</div>
                {wins.length === 0 && (
                  <div className="empty" {...d(0.16)}>
                    <div className="empty-em">🏁</div>
                    <div className="empty-t">No wins yet</div>
                    <div className="empty-s">Log your first win to start moving forward.</div>
                  </div>
                )}
                {wins.slice(0, 3).map((w, i) => (
                  <div className="rw" key={w.id} {...d(0.16 + i * 0.03)}>
                    <div className="rw-em">{w.emoji}</div>
                    <div className="rw-info">
                      <div className="rw-lbl">{w.label}</div>
                      <div className="rw-sub">£{w.amount}</div>
                    </div>
                    <div className="rw-days">{daysLabel(w.days)}</div>
                  </div>
                ))}

                {wins.length > 0 && (
                  <>
                    <div className="recent-head" style={{ marginTop: 20 }}>All activity</div>
                    {grouped.map((group, gi) => (
                      <div key={group.label} {...d(0.22 + gi * 0.02)}>
                        <div className="day-label">{group.label}</div>
                        {group.items.map(w => (
                          <div className="rw-compact" key={w.id}>
                            <span className="rw-compact-em">{w.emoji}</span>
                            <span className="rw-compact-lbl">{w.label}</span>
                            <span className="rw-compact-amt">£{w.amount}</span>
                            <span className="rw-compact-days">{daysLabel(w.days)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                )}
                <div className="bottom-pad" />
              </div>
            )}

            {/* ══ GOALS ══ */}
            {goal && tab === "goals" && (
              <div className="page">
                <div className="sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
                <PageHeader />
                <div className="streak-card" {...d(0.06)}>
                  <div className="streak-card-left">
                    <div className={`streak-card-flame ${flamePulse ? "pulse" : ""}`}>{flameEmoji(flameSize, status)}</div>
                    <div>
                      <div className="streak-card-num">{streak} week{streak === 1 ? "" : "s"}</div>
                      <div className="streak-card-lbl">{streakMilestone ?? "Keep moving forward"}</div>
                    </div>
                  </div>
                  <div className="streak-card-freezes">
                    <div className="freeze-pip">❄️ ×{freezes}</div>
                    <div className="freeze-lbl">freezes</div>
                  </div>
                </div>

                <div className="goal-switcher" {...d(0.1)}>
                  <div className="goal-switcher-eye">YOUR ACTIVE GOAL</div>
                  <div className="goal-switcher-main">
                    <div className="goal-switcher-em">{goal.emoji}</div>
                    <div className="goal-switcher-info">
                      <div className="goal-switcher-lbl">£{saved.toLocaleString()} directed</div>
                      <div className="goal-switcher-impact">→ {daysLabel(totalDaysClosed)}</div>
                      <div className="goal-switcher-sub">{goal.label} · {goal.targetDate}</div>
                    </div>
                  </div>
                  <button className="goal-switcher-btn" onClick={() => setGoalPickerOpen(true)}>Switch goal</button>
                </div>

                <div className="recent-head" {...d(0.14)}>Stats</div>
                <div className="prof-card" {...d(0.16)}>
                  <div className="prof-row"><span>Target</span><span className="prof-r">£{goal.target.toLocaleString()}</span></div>
                  <div className="prof-row"><span>Target date</span><span className="prof-r">{goal.targetDate}</span></div>
                  <div className="prof-row"><span>Total wins</span><span className="prof-r">{wins.length}</span></div>
                  <div className="prof-row"><span>Progress</span><span className="prof-r">{daysLabel(totalDaysClosed)}</span></div>
                </div>
                <div className="bottom-pad" />
              </div>
            )}

            {/* ══ CONNECT ══ */}
            {goal && tab === "connect" && (
              <div className="page">
                <div className="sb"><span>9:41</span><span>•••</span><span>🔋 91%</span></div>
                <PageHeader />
                <div className="cn-hero" {...d(0.06)}>
                  <div className="cn-hero-eye">COMING SOON</div>
                  <div className="cn-hero-big">Link your bank.<br />Wins find themselves.</div>
                  <div className="cn-hero-sub">Payoff spots round-ups, cashback, and unspent money — and lets you redirect it with one tap.</div>
                </div>
                <div className="recent-head" {...d(0.1)}>How it works</div>
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

                <div className="recent-head" {...d(0.22)}>Connect</div>
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

            {/* ══ GOAL PICKER ══ */}
            {goalPickerOpen && (
              <div className="aw-backdrop" onClick={() => setGoalPickerOpen(false)}>
                <div className="aw-sheet" onClick={e => e.stopPropagation()}>
                  <div className="aw-step">
                    <div className="aw-handle" />
                    <div className="aw-title">Switch goal</div>
                    <div className="aw-sub">Pick the one you're racing toward</div>
                    <div className="ob-list">
                      {Object.keys(GOALS).map(id => {
                        const g = GOALS[id];
                        const isCurrent = id === goalId;
                        return (
                          <button key={id} className={`ob-tile ${isCurrent ? "current" : ""}`} onClick={() => chooseGoal(id)}>
                            <div className="ob-tile-em">{g.emoji}</div>
                            <div className="ob-tile-info">
                              <div className="ob-tile-lbl">{g.label}</div>
                              <div className="ob-tile-sub">Target £{g.target.toLocaleString()} · {g.targetDate}</div>
                            </div>
                            <div className="ob-tile-arr">{isCurrent ? "✓" : "→"}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ FAB ══ */}
            {goal && winStep === 0 && (
              <button className="fab" onClick={openWin}>
                <span className="fab-plus">＋</span>
                <span className="fab-txt">Add a win</span>
              </button>
            )}

            {/* ══ ADD A WIN ══ */}
            {winStep > 0 && (
              <div className="aw-backdrop" onClick={closeWin}>
                <div className="aw-sheet" onClick={e => e.stopPropagation()}>
                  {winStep === 1 && (
                    <div className="aw-step">
                      <div className="aw-handle" />
                      <div className="aw-title">Add a win</div>
                      <div className="aw-sub">Pick what you did</div>
                      <div className="aw-grid">
                        {WIN_TYPES.map(t => (
                          <button key={t.id} className="aw-tile" onClick={() => pickType(t)}>
                            <div className="aw-tile-em">{t.emoji}</div>
                            <div className="aw-tile-lbl">{t.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {winStep === 2 && winType && (
                    <div className="aw-step">
                      <div className="aw-handle" />
                      <div className="aw-title">How much?</div>
                      <div className="aw-sub">{winType.emoji} {winType.label}</div>
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
                        Direct £{winAmount || 0} → {daysLabel(winDays)}<br />
                        <span style={{ fontSize: 12, color: "#7C5CE6" }}>+ keeps your {streak} week streak alive</span>
                      </div>
                      <button className="aw-cta" disabled={!winAmount} onClick={goResult}>Continue →</button>
                    </div>
                  )}

                  {winStep === 3 && goal && (
                    <div className="aw-step aw-impact">
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

            {/* ══ TABS ══ */}
            {goal && (
              <div className="tabs tabs-3">
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

const CSS = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif}

.shell{min-height:100vh;background:linear-gradient(180deg,#EEF2F7 0%,#E5EAF2 100%);display:flex;align-items:center;justify-content:center;padding:24px}
.phone{position:relative;width:390px;height:844px;background:#fff;border-radius:48px;box-shadow:0 30px 80px rgba(0,0,0,0.25),0 0 0 12px #111 inset}
.notch{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:120px;height:32px;background:#000;border-radius:99px;z-index:5}
.screen{position:absolute;inset:11px;border-radius:38px;overflow:hidden;background:#FAFAF7;color:#1a1a2e}

.page{height:100%;overflow-y:auto;padding:50px 18px 0}
.bottom-pad{height:120px}
.sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#111;padding:0 4px 8px}

.fu{opacity:0;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease}
.fu.in{opacity:1;transform:none}

.milestone-overlay{position:absolute;inset:0;background:rgba(124,92,230,0.92);z-index:50;display:flex;align-items:center;justify-content:center;animation:milestonePop .5s ease}
@keyframes milestonePop{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
.milestone-inner{text-align:center}
.milestone-fire{font-size:64px;margin-bottom:12px}
.milestone-weeks{font-size:48px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1}
.milestone-name{font-size:22px;font-weight:700;color:#C4B5FD;margin-top:8px}

.page-header{text-align:center;padding:4px 0 14px}
.page-header-brand{font-size:28px;font-weight:900;letter-spacing:-1px;color:#1a1a2e;line-height:1;margin-bottom:8px}
.page-header-goal{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #EFEAE2;border-radius:99px;padding:5px 6px 5px 12px}
.page-header-goal-em{font-size:15px}
.page-header-goal-lbl{font-size:13px;font-weight:700;color:#7C5CE6;letter-spacing:-0.2px}
.page-header-switch{background:#7C5CE6;color:#fff;border:none;border-radius:99px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer}

.onboard{padding-top:0}
.ob-brand-block{text-align:center;padding:52px 20px 0}
.ob-brand-inline{display:inline-flex;align-items:center;gap:12px;justify-content:center}
.ob-hero-logo{font-size:44px;line-height:1}
.ob-hero-name{font-size:52px;font-weight:900;letter-spacing:-2.5px;color:#1a1a2e;line-height:1}
.ob-slogan-block{text-align:center;font-size:19px;font-weight:700;color:#7C5CE6;margin-top:28px;padding:0 20px}
.ob-choose-wrap{display:flex;justify-content:center;align-items:center;margin-top:36px;margin-bottom:4px}
.ob-choose-box{background:#fff;border:1.5px solid #D1D5DB;border-radius:12px;padding:9px 24px;font-size:13px;font-weight:700;color:#374151;letter-spacing:0.3px}
.ob-cards{display:flex;flex-direction:column;gap:14px;margin-top:28px;padding:0 4px}
.ob-card{display:flex;align-items:center;gap:14px;background:#fff;border:2px solid #EFEAE2;border-radius:18px;padding:14px;cursor:pointer;transition:transform .15s ease,border-color .2s ease;width:100%;text-align:left}
.ob-card:active{transform:scale(0.98);border-color:#7C5CE6}
.ob-card-em{font-size:28px;flex-shrink:0;width:52px;height:52px;display:flex;align-items:center;justify-content:center;background:#F5F0E8;border-radius:14px}
.ob-card-body{flex:1;min-width:0}
.ob-card-lbl{font-size:16px;font-weight:800;color:#1a1a2e;letter-spacing:-0.3px}
.ob-card-meta{font-size:12px;color:#888;margin-top:4px}
.ob-card-arr{font-size:20px;color:#7C5CE6;font-weight:700;margin-left:auto;flex-shrink:0}

.hero{position:relative;background:linear-gradient(135deg,#F4F0FF 0%,#FFF6F0 100%);border:1px solid #EAD9F7;border-radius:20px;padding:18px;overflow:hidden;margin-bottom:14px}
.hero-glow{position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:radial-gradient(circle,rgba(232,122,74,0.25),transparent 70%);pointer-events:none}
.hero-eye{font-size:10px;letter-spacing:1.6px;color:#7C5CE6;font-weight:700;position:relative}
.hero-big{font-size:26px;font-weight:800;letter-spacing:-0.6px;color:#1a1a2e;margin:6px 0 8px;position:relative;line-height:1.15}
.hero-streak{display:flex;align-items:center;gap:6px;margin-bottom:12px;position:relative}
.streak-flame{font-size:18px;transition:transform .3s}
.streak-count{font-size:15px;font-weight:800;letter-spacing:-0.3px}
.streak-milestone-badge{font-size:11px;font-weight:700;background:#F1ECFB;color:#7C5CE6;border-radius:99px;padding:3px 8px;margin-left:4px}
.pulse .streak-flame{animation:flamePulse .6s ease}
@keyframes flamePulse{0%{transform:scale(1)}40%{transform:scale(1.5)}100%{transform:scale(1)}}
.hero-bar{height:7px;background:#EDE5FB;border-radius:99px;overflow:hidden}
.hero-fill{height:100%;background:linear-gradient(90deg,#7C5CE6,#9B7FE9);border-radius:99px;transition:width .6s ease}

/* ── TIMELINE ── */
.hero-timeline{display:flex;align-items:center;gap:8px;margin-top:10px}
.hero-tl-left,.hero-tl-right{display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0}
.hero-tl-dot{width:8px;height:8px;border-radius:50%}
.hero-tl-dot-start{background:#7C5CE6}
.hero-tl-dot-end{background:#E87A4A}
.hero-tl-label{font-size:10px;font-weight:700;color:#7C5CE6;white-space:nowrap;letter-spacing:0.2px}
.hero-tl-right .hero-tl-label{color:#E87A4A}
.hero-tl-track{flex:1;height:4px;background:#EDE5FB;border-radius:99px;overflow:hidden;position:relative}
.hero-tl-fill{height:100%;background:linear-gradient(90deg,#7C5CE6,#E87A4A);border-radius:99px;transition:width .6s ease}

.nudge-bar{display:flex;align-items:flex-start;gap:10px;border-width:1.5px;border-style:solid;border-radius:14px;padding:12px 14px;margin-bottom:14px}
.nudge-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.nudge-title{font-size:13px;font-weight:800}
.nudge-sub{font-size:11px;margin-top:2px;color:#666;font-weight:500}
.freeze-badge{font-size:12px;font-weight:700;color:#1D4ED8;background:#EFF6FF;border-radius:99px;padding:4px 10px;align-self:center;flex-shrink:0}

.streak-card{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#FFF7ED 0%,#FEE7CF 100%);border:1.5px solid #FDBA74;border-radius:20px;padding:16px 18px;margin-bottom:14px}
.streak-card-left{display:flex;align-items:center;gap:12px}
.streak-card-flame{font-size:32px}
.streak-card-num{font-size:22px;font-weight:900;color:#1a1a2e;letter-spacing:-0.8px}
.streak-card-lbl{font-size:12px;color:#9A3412;font-weight:600;margin-top:2px}
.streak-card-freezes{text-align:right}
.freeze-pip{font-size:18px;font-weight:800;color:#1D4ED8}
.freeze-lbl{font-size:10px;color:#9CA3AF;margin-top:2px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase}

.cta-primary{width:100%;background:linear-gradient(135deg,#7C5CE6,#9B7FE9);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:-0.2px;transition:transform .15s ease;margin-bottom:6px}
.cta-primary:active{transform:scale(0.98)}

.recent-head{font-size:11px;letter-spacing:1.4px;color:#888;font-weight:700;margin:6px 4px 8px;text-transform:uppercase}
.day-label{font-size:11px;letter-spacing:1.4px;color:#888;font-weight:700;margin:14px 4px 6px;text-transform:uppercase}

/* Full cards for Recent wins */
.rw{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #EFEAE2;border-radius:14px;padding:12px;margin-bottom:8px}
.rw-em{width:36px;height:36px;border-radius:10px;background:#F5F0E8;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.rw-info{flex:1;min-width:0}
.rw-lbl{font-size:14px;font-weight:700;color:#1a1a2e}
.rw-sub{font-size:11px;color:#888;margin-top:2px}
.rw-days{font-size:12px;font-weight:700;color:#7C5CE6;white-space:nowrap;text-align:right;min-width:90px}

/* Compact single-line rows for All activity */
.rw-compact{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid #EFEAE2;background:#fff}
.rw-compact:first-child{border-radius:12px 12px 0 0}
.rw-compact:last-child{border-radius:0 0 12px 12px;border-bottom:none}
.rw-compact:first-child:last-child{border-radius:12px}
.rw-compact-em{font-size:16px;flex-shrink:0;width:24px;text-align:center}
.rw-compact-lbl{flex:1;font-size:13px;font-weight:600;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rw-compact-amt{font-size:12px;color:#888;font-weight:500;flex-shrink:0;margin-right:4px}
.rw-compact-days{font-size:12px;font-weight:700;color:#7C5CE6;flex-shrink:0;white-space:nowrap}

.empty{text-align:center;padding:40px 20px;background:#fff;border:1px dashed #EFEAE2;border-radius:14px}
.empty-em{font-size:32px;margin-bottom:8px}
.empty-t{font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:4px}
.empty-s{font-size:12px;color:#888;line-height:1.4}

.goal-switcher{background:linear-gradient(135deg,#F4F0FF 0%,#FFF6F0 100%);border:1.5px solid #EAD9F7;border-radius:20px;padding:18px;margin-bottom:14px}
.goal-switcher-eye{font-size:10px;letter-spacing:1.6px;color:#7C5CE6;font-weight:700;margin-bottom:10px;text-transform:uppercase}
.goal-switcher-main{display:flex;align-items:center;gap:14px;margin-bottom:18px}
.goal-switcher-em{font-size:36px;width:64px;height:64px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:18px;flex-shrink:0}
.goal-switcher-info{flex:1;min-width:0}
.goal-switcher-lbl{font-size:20px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;line-height:1.15}
.goal-switcher-impact{font-size:14px;font-weight:700;color:#7C5CE6;margin-top:4px}
.goal-switcher-sub{font-size:12px;color:#666;margin-top:4px;font-weight:500}
.goal-switcher-btn{width:100%;background:linear-gradient(135deg,#7C5CE6,#9B7FE9);color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;transition:transform .15s ease}
.goal-switcher-btn:active{transform:scale(0.98)}

.prof-card{background:#fff;border:1px solid #EFEAE2;border-radius:16px;overflow:hidden}
.prof-row{display:flex;justify-content:space-between;padding:14px 16px;font-size:13px;color:#1a1a2e;font-weight:600;border-bottom:1px solid #EFEAE2}
.prof-row:last-child{border-bottom:none}
.prof-r{color:#888;font-weight:500}

.fab{position:absolute;bottom:88px;right:16px;background:linear-gradient(135deg,#7C5CE6,#9B7FE9);color:#fff;border:none;border-radius:99px;padding:12px 18px;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 8px 24px rgba(124,92,230,0.4);transition:transform .15s ease;z-index:10}
.fab:active{transform:scale(0.94)}
.fab-plus{font-size:18px;font-weight:400;line-height:1}

.aw-backdrop{position:absolute;inset:0;background:rgba(15,15,25,0.5);backdrop-filter:blur(6px);z-index:30;display:flex;align-items:flex-end;animation:fadein .25s ease}
@keyframes fadein{from{opacity:0}to{opacity:1}}
.aw-sheet{width:100%;background:#FAFAF7;border-radius:28px 28px 0 0;padding:14px 20px 24px;max-height:90%;overflow-y:auto;animation:slideup .3s cubic-bezier(.2,.8,.2,1)}
@keyframes slideup{from{transform:translateY(100%)}to{transform:translateY(0)}}
.aw-handle{width:36px;height:4px;background:#d8d2c5;border-radius:99px;margin:2px auto 14px}
.aw-step{display:flex;flex-direction:column}
.aw-title{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#1a1a2e;text-align:center}
.aw-sub{font-size:13px;color:#777;text-align:center;margin-top:4px;margin-bottom:18px}
.aw-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.aw-tile{background:#fff;border:1px solid #EFEAE2;border-radius:16px;padding:18px 12px;text-align:center;cursor:pointer;transition:transform .15s ease,border-color .2s ease}
.aw-tile:active{transform:scale(0.96);border-color:#7C5CE6}
.aw-tile:nth-child(5){grid-column:1/-1}
.aw-tile-em{font-size:28px;margin-bottom:6px}
.aw-tile-lbl{font-size:13px;font-weight:600;color:#1a1a2e}
.aw-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px}
.aw-chip{background:#fff;border:1.5px solid #EFEAE2;border-radius:99px;padding:10px 18px;font-size:14px;font-weight:700;color:#374151;cursor:pointer;transition:border-color .2s ease,background .2s ease}
.aw-chip.sel{border-color:#7C5CE6;background:#F1ECFB;color:#7C5CE6}
.aw-input{width:100%;background:#fff;border:1.5px solid #EFEAE2;border-radius:14px;padding:14px;font-size:15px;font-weight:600;color:#1a1a2e;margin-bottom:14px;outline:none;transition:border-color .2s ease}
.aw-input:focus{border-color:#7C5CE6}
.aw-preview{background:linear-gradient(135deg,#F1ECFB,#FFF6EE);border:1px solid #EAD9F7;border-radius:14px;padding:14px;font-size:14px;font-weight:600;color:#1a1a2e;text-align:center;margin-bottom:14px;line-height:1.4}
.aw-cta{background:linear-gradient(135deg,#7C5CE6,#9B7FE9);color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:-0.2px;transition:transform .15s ease}
.aw-cta:active{transform:scale(0.98)}
.aw-cta:disabled{opacity:.4;cursor:not-allowed}
.aw-impact{align-items:center;text-align:center;padding:36px 12px 12px;animation:popin .5s cubic-bezier(.2,.8,.2,1)}
@keyframes popin{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
.aw-impact-eye{font-size:11px;letter-spacing:1.8px;color:#7C5CE6;font-weight:700}
.aw-impact-big{font-size:34px;font-weight:800;letter-spacing:-1px;color:#1a1a2e;margin:10px 0 6px}
.aw-impact-streak{font-size:17px;font-weight:800;color:#E87A4A;margin-bottom:8px}
.aw-milestone-tag{font-size:13px;color:#7C5CE6}
.aw-impact-sub{font-size:14px;color:#444;font-weight:500;margin-bottom:24px}
.aw-impact .aw-cta{align-self:stretch;margin-top:8px}
.aw-impact-goal{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #EAD9F7;border-radius:99px;padding:6px 14px 6px 6px;margin:8px 0}
.aw-impact-goal-em{font-size:20px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#F1ECFB;border-radius:99px}
.aw-impact-goal-lbl{font-size:14px;font-weight:800;color:#7C5CE6;letter-spacing:-0.2px}

.tabs{position:absolute;bottom:0;left:0;right:0;background:rgba(255,255,255,0.94);backdrop-filter:blur(10px);border-top:1px solid #EFEAE2;display:grid;padding:6px 0 14px;z-index:20}
.tabs.tabs-3{grid-template-columns:1fr 1fr 1fr}
.tab{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px;cursor:pointer;color:#888;transition:color .2s ease}
.tab.on{color:#7C5CE6}
.tab-i{font-size:20px;filter:grayscale(0.6);transition:filter .2s}
.tab.on .tab-i{filter:none}
.tab-l{font-size:10px;font-weight:600}

.cn-hero{background:linear-gradient(135deg,#F4F0FF 0%,#FFF6F0 100%);border:1px solid #EAD9F7;border-radius:20px;padding:18px;margin-bottom:14px}
.cn-hero-eye{font-size:10px;letter-spacing:1.6px;color:#7C5CE6;font-weight:700}
.cn-hero-big{font-size:24px;font-weight:800;letter-spacing:-0.6px;color:#1a1a2e;margin:8px 0 10px;line-height:1.2}
.cn-hero-sub{font-size:13px;color:#555;line-height:1.5;font-weight:500}
.cn-step{display:flex;align-items:flex-start;gap:14px;background:#fff;border:1px solid #EFEAE2;border-radius:14px;padding:14px;margin-bottom:8px}
.cn-step-num{flex-shrink:0;width:32px;height:32px;border-radius:99px;background:linear-gradient(135deg,#7C5CE6,#9B7FE9);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800}
.cn-step-info{flex:1;min-width:0}
.cn-step-lbl{font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:3px}
.cn-step-sub{font-size:12px;color:#777;line-height:1.45}
.cn-bank{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #EFEAE2;border-radius:14px;padding:12px;margin-bottom:8px}
.cn-bank-em{width:36px;height:36px;border-radius:10px;background:#F5F0E8;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.cn-bank-info{flex:1;min-width:0}
.cn-bank-lbl{font-size:14px;font-weight:700;color:#1a1a2e}
.cn-bank-sub{font-size:11px;color:#888;margin-top:2px}
.cn-bank-cta{font-size:12px;font-weight:700;color:#7C5CE6;background:#F1ECFB;padding:6px 12px;border-radius:99px}
.cn-trust{font-size:11px;color:#888;text-align:center;margin-top:14px;padding:0 12px;line-height:1.5}

.ob-list{display:flex;flex-direction:column;gap:10px;width:100%}
.ob-tile{display:flex;align-items:center;gap:14px;background:#fff;border:1.5px solid #EFEAE2;border-radius:16px;padding:14px;cursor:pointer;transition:transform .15s ease,border-color .2s ease;text-align:left;width:100%}
.ob-tile:active{transform:scale(0.98);border-color:#7C5CE6}
.ob-tile.current{border-color:#7C5CE6;background:#F1ECFB}
.ob-tile-em{font-size:28px;flex-shrink:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:#F5F0E8;border-radius:12px}
.ob-tile.current .ob-tile-em{background:#fff}
.ob-tile-info{flex:1;min-width:0}
.ob-tile-lbl{font-size:15px;font-weight:700;color:#1a1a2e}
.ob-tile-sub{font-size:11px;color:#888;margin-top:3px}
.ob-tile-arr{font-size:18px;color:#7C5CE6;font-weight:700}
`;
