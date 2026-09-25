'use client';

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  simulate, simulateRun, START, MAX_DAYS,
  type ChallengeRules, type DrawdownType, type Outcome, type PathPoint, type Summary, type Trader,
} from '@commentfx/core';

export interface SimFirm {
  slug: string;
  name: string;
  steps: 1 | 2 | 'instant';
  rules: ChallengeRules;
  /** Whether the rules were read at the firm's own pages. */
  readAtOrigin: boolean;
}

/**
 * A thousand attempts per design. Enough that a whole-percent figure is
 * stable to within a point or two, few enough that a phone keeps up with a
 * slider — the three designs are run on every change, and the slowest
 * combination (tiny risk, many trades, no edge) is the one that runs longest.
 */
const RUNS = 1000;
const SIZES = [10_000, 25_000, 50_000, 100_000, 200_000];
const DESIGNS: Array<{ key: DrawdownType; label: string }> = [
  { key: 'static', label: 'Static' },
  { key: 'eod-trailing', label: 'End-of-day trailing' },
  { key: 'intraday-trailing', label: 'Intraday trailing' },
];

/** Status colours, each shown with its label, never alone. Validated on white. */
const OUTCOMES: Array<{ key: Outcome; label: string; color: string }> = [
  { key: 'passed', label: 'Passed', color: '#0E7E55' },
  { key: 'max-loss', label: 'Hit the total loss limit', color: '#D22127' },
  { key: 'daily-loss', label: 'Hit the daily loss limit', color: '#9B6307' },
  { key: 'out-of-time', label: 'Ran out of time', color: '#616C84' },
  { key: 'unfinished', label: 'Still going after a year', color: '#C9CFDA' },
];

const pct = (n: number, of: number) => `${Math.round((n / of) * 100)}%`;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function ChallengeSimulator({ firms, defaultFirm }: { firms: SimFirm[]; defaultFirm: string }) {
  const id = useId();
  const [firmSlug, setFirmSlug] = useState(defaultFirm);
  const [custom, setCustom] = useState<ChallengeRules>({
    targetPct: 8, dailyPct: 5, maxPct: 10, drawdown: 'static', minDays: 3, timeLimitDays: null,
  });
  const [size, setSize] = useState(100_000);
  const [riskPct, setRiskPct] = useState(1);
  const [winPct, setWinPct] = useState(40);
  const [rewardRisk, setRewardRisk] = useState(1.5);
  const [tradesPerDay, setTradesPerDay] = useState(2);
  const [attempt, setAttempt] = useState(0);

  // A link from a firm's page lands on that firm, and a result can be shared.
  // Read once the page is running: the prerendered page shows the defaults.
  const ready = useRef(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = q.get('firm');
    if (f && firms.some((x) => x.slug === f)) setFirmSlug(f);
    const num = (k: string, lo: number, hi: number, set: (v: number) => void) => {
      const v = Number(q.get(k));
      if (q.has(k) && Number.isFinite(v)) set(clamp(v, lo, hi));
    };
    num('risk', 0.25, 3, setRiskPct);
    num('win', 20, 80, setWinPct);
    num('rr', 0.5, 4, setRewardRisk);
    num('tpd', 1, 10, setTradesPerDay);
    const s = Number(q.get('size'));
    if (SIZES.includes(s)) setSize(s);
    ready.current = true;
  }, [firms]);
  useEffect(() => {
    if (!ready.current) return;
    const q = new URLSearchParams({
      firm: firmSlug, size: String(size), risk: String(riskPct), win: String(winPct),
      rr: String(rewardRisk), tpd: String(tradesPerDay),
    });
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`);
  }, [firmSlug, size, riskPct, winPct, rewardRisk, tradesPerDay]);

  const firm = firms.find((f) => f.slug === firmSlug);
  const rules = firm ? firm.rules : custom;
  const trader: Trader = { riskPct, winRate: winPct / 100, rewardRisk, tradesPerDay };

  // Sliders stay responsive: the simulation catches up with the last value.
  const deferred = useDeferredValue({ rules, trader });
  const key = JSON.stringify(deferred);
  const results = useMemo(() => {
    const byDesign = Object.fromEntries(
      DESIGNS.map((d) => [d.key, simulate({ ...deferred.rules, drawdown: d.key }, deferred.trader, RUNS, 1)]),
    ) as Record<DrawdownType, Summary>;
    return { byDesign, main: byDesign[deferred.rules.drawdown] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const sample = useMemo(
    () => simulateRun(deferred.rules, deferred.trader, 100_000 + attempt, true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, attempt],
  );

  const edge = trader.winRate * rewardRisk - (1 - trader.winRate);
  const money = (units: number) => `$${Math.round((size * units) / 100).toLocaleString('en-US')}`;
  const { main } = results;
  const stale = deferred.rules !== rules || deferred.trader.riskPct !== riskPct;

  return (
    <div className="flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
      <section className="bg-card border-b border-line sm:border sm:rounded-[16px] lg:rounded-[20px] p-4 lg:p-6">
        <h2 className="font-[family-name:var(--font-display)] text-[16px] lg:text-[17px] font-bold tracking-[-0.018em] mb-3 lg:mb-4">
          The challenge
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-[12.5px] text-ink-3" htmlFor={`${id}-firm`}>
            Prop firm
            <select
              id={`${id}-firm`}
              value={firmSlug}
              onChange={(e) => setFirmSlug(e.target.value)}
              className="h-10 rounded-[10px] border border-line bg-card px-3 text-[14px] text-ink font-semibold"
            >
              {firms.map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
              <option value="custom">Custom rules</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[12.5px] text-ink-3" htmlFor={`${id}-size`}>
            Account size
            <select
              id={`${id}-size`}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-10 rounded-[10px] border border-line bg-card px-3 text-[14px] text-ink font-semibold tnum"
            >
              {SIZES.map((s) => <option key={s} value={s}>${s.toLocaleString('en-US')}</option>)}
            </select>
          </label>
        </div>

        {firm ? (
          <>
            <ul className="flex flex-wrap gap-[6px] mt-4" aria-label={`${firm.name} rules`}>
              {[
                `Target ${rules.targetPct}%`,
                `Daily loss ${rules.dailyPct}%`,
                `Max loss ${rules.maxPct}%`,
                DESIGNS.find((d) => d.key === rules.drawdown)!.label,
                rules.minDays ? `Min ${rules.minDays} days` : 'No minimum days',
              ].map((t) => (
                <li key={t} className="rounded-full bg-card-2 border border-line px-[10px] py-[3px] text-[12px] text-ink-2 tnum">{t}</li>
              ))}
            </ul>
            <p className="text-[12px] text-ink-3 leading-[1.7] mt-3">
              {firm.steps === 2 ? `Phase one only — ${firm.name} has a second phase after this. ` : ''}
              {firm.readAtOrigin
                ? `Rules as read at ${firm.name}’s own pages.`
                : `Rules as other sources report them; ${firm.name}’s own pages were not read.`}
            </p>
          </>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {([
              ['targetPct', 'Profit target %', 1, 30],
              ['dailyPct', 'Daily loss limit %', 0.5, 20],
              ['maxPct', 'Max loss %', 1, 30],
              ['minDays', 'Minimum days', 0, 30],
            ] as const).map(([k, label, lo, hi]) => (
              <label key={k} className="flex flex-col gap-1 text-[12.5px] text-ink-3" htmlFor={`${id}-${k}`}>
                {label}
                <input
                  id={`${id}-${k}`}
                  type="number"
                  min={lo}
                  max={hi}
                  step={k === 'minDays' ? 1 : 0.5}
                  value={custom[k]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) setCustom({ ...custom, [k]: clamp(v, lo, hi) });
                  }}
                  className="h-10 rounded-[10px] border border-line bg-card px-3 text-[14px] text-ink font-semibold tnum"
                />
              </label>
            ))}
            <label className="flex flex-col gap-1 text-[12.5px] text-ink-3" htmlFor={`${id}-dd`}>
              Drawdown
              <select
                id={`${id}-dd`}
                value={custom.drawdown}
                onChange={(e) => setCustom({ ...custom, drawdown: e.target.value as DrawdownType })}
                className="h-10 rounded-[10px] border border-line bg-card px-3 text-[14px] text-ink font-semibold"
              >
                {DESIGNS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[12.5px] text-ink-3" htmlFor={`${id}-limit`}>
              Time limit, days
              <input
                id={`${id}-limit`}
                type="number"
                min={0}
                max={MAX_DAYS}
                placeholder="None"
                value={custom.timeLimitDays ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : clamp(Number(e.target.value), 1, MAX_DAYS);
                  setCustom({ ...custom, timeLimitDays: v !== null && Number.isFinite(v) ? v : null });
                }}
                className="h-10 rounded-[10px] border border-line bg-card px-3 text-[14px] text-ink font-semibold tnum"
              />
            </label>
          </div>
        )}
      </section>

      <section className="bg-card border-b border-line sm:border sm:rounded-[16px] lg:rounded-[20px] p-4 lg:p-6">
        <h2 className="font-[family-name:var(--font-display)] text-[16px] lg:text-[17px] font-bold tracking-[-0.018em] mb-3 lg:mb-4">
          How you trade
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          <Slider id={`${id}-risk`} label="Risk per trade" value={riskPct} min={0.25} max={3} step={0.25}
            show={`${riskPct}% · ${money(riskPct)}`} onChange={setRiskPct} />
          <Slider id={`${id}-win`} label="Win rate" value={winPct} min={20} max={80} step={1}
            show={`${winPct}%`} onChange={setWinPct} />
          <Slider id={`${id}-rr`} label="Reward to risk" value={rewardRisk} min={0.5} max={4} step={0.1}
            show={`${rewardRisk.toFixed(1)} : 1`} onChange={setRewardRisk} />
          <Slider id={`${id}-tpd`} label="Trades per day" value={tradesPerDay} min={1} max={10} step={1}
            show={String(tradesPerDay)} onChange={setTradesPerDay} />
        </div>
        <div className="mt-5 pt-4 border-t border-line-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[12.5px] text-ink-3">Your edge per trade, before costs</span>
          <span className={`text-[17px] font-bold tnum ${edge > 0.05 ? 'text-up' : edge < -0.05 ? 'text-down' : 'text-ink'}`}>
            {edge >= 0 ? '+' : '−'}{Math.abs(edge).toFixed(2)}R
          </span>
          <p className="basis-full text-[12.5px] text-ink-2 leading-[1.7] mt-1">
            {edge > 0.05
              ? 'A positive edge: given enough trades, this drifts toward the target, and the rules decide how much bad luck it can survive on the way.'
              : edge < -0.05
                ? 'A negative edge: the longer this trades, the surer the floor. No drawdown rule makes that pass more often than luck allows.'
                : 'No real edge: whether this reaches the target or the floor first is close to a coin toss, weighted by how far away each one is.'}
          </p>
        </div>
      </section>

      <section
        aria-live="polite"
        className={`bg-card border-b border-line sm:border sm:rounded-[16px] lg:rounded-[20px] p-4 lg:p-6 transition-opacity ${stale ? 'opacity-70' : ''}`}
      >
        <h2 className="font-[family-name:var(--font-display)] text-[16px] lg:text-[17px] font-bold tracking-[-0.018em] mb-3 lg:mb-4">
          {firm ? `${RUNS.toLocaleString('en-US')} attempts at ${firm.name}` : `${RUNS.toLocaleString('en-US')} attempts`}
        </h2>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <p className="font-[family-name:var(--font-display)] text-[48px] leading-none font-bold tracking-[-0.04em]">
              {pct(main.counts.passed, main.runs)}
            </p>
            <p className="text-[12.5px] text-ink-3 mt-1">pass</p>
          </div>
          <p className="text-[13px] text-ink-2 leading-[1.6] pb-1">
            {main.medianDaysToPass !== null
              ? <>Half of those that pass have done it by <b className="tnum">day {main.medianDaysToPass}</b>.</>
              : 'None of these attempts passed.'}
          </p>
        </div>

        <OutcomeBar counts={main.counts} runs={main.runs} />

        <h3 className="text-[13px] font-bold mt-6 mb-2">The same trader, the same trades, a different drawdown rule</h3>
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {DESIGNS.map((d) => {
              const s = results.byDesign[d.key];
              const share = s.counts.passed / s.runs;
              const mine = d.key === rules.drawdown;
              return (
                <tr key={d.key} className="border-t border-line-2">
                  <th scope="row" className={`text-left py-[9px] pr-3 ${mine ? 'font-bold' : 'font-medium text-ink-2'}`}>
                    {d.label}{mine ? <span className="sr-only"> (these rules)</span> : null}
                  </th>
                  <td className="py-[9px] w-[45%]">
                    <div className="h-[6px] rounded-full bg-card-3 overflow-hidden" aria-hidden>
                      <div className="h-full rounded-full" style={{ width: `${share * 100}%`, background: mine ? '#2456E8' : '#9AA7C2' }} />
                    </div>
                  </td>
                  <td className="py-[9px] pl-3 text-right font-semibold tnum w-[3.5rem]">{pct(s.counts.passed, s.runs)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="bg-card border-b border-line sm:border sm:rounded-[16px] lg:rounded-[20px] p-4 lg:p-6">
        <div className="flex items-center justify-between gap-2 mb-3 lg:mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-[16px] lg:text-[17px] font-bold tracking-[-0.018em]">
            One attempt, drawn
          </h2>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="text-[13px] font-semibold text-accent hover:text-accent-2"
          >
            Draw another ›
          </button>
        </div>
        <p className="text-[13px] text-ink-2 leading-[1.6] mb-3">{describe(sample.outcome, sample.days, sample.path, money)}</p>
        <AttemptChart path={sample.path} rules={deferred.rules} outcome={sample.outcome} money={money} />
      </section>
    </div>
  );
}

function describe(outcome: Outcome, days: number, path: PathPoint[], money: (u: number) => string) {
  const last = path.at(-1);
  const at = last ? money(last.equity) : '';
  switch (outcome) {
    case 'passed': return `Passed on day ${days}, with the balance at ${at}.`;
    case 'max-loss': return `Ended on day ${days}: the balance fell through the total loss floor at ${at}.`;
    case 'daily-loss': return `Ended on day ${days}: one day’s losses went past the daily limit, at ${at}.`;
    case 'out-of-time': return `Ran out of time on day ${days}, with the balance at ${at}.`;
    default: return `Still trading after ${days} days, with the balance at ${at}.`;
  }
}

function Slider({ id, label, value, min, max, step, show, onChange }: {
  id: string; label: string; value: number; min: number; max: number; step: number; show: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[12.5px] text-ink-3">{label}</label>
        <output htmlFor={id} className="text-[13.5px] font-semibold tnum">{show}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-[#2456E8] h-6"
      />
    </div>
  );
}

/** Where the attempts ended, as one bar, each part labelled beneath it. */
function OutcomeBar({ counts, runs }: { counts: Record<Outcome, number>; runs: number }) {
  const shown = OUTCOMES.filter((o) => counts[o.key] > 0);
  return (
    <div className="mt-5">
      <div className="flex h-[14px] gap-[2px] rounded-[4px] overflow-hidden" aria-hidden>
        {shown.map((o) => (
          <div key={o.key} style={{ width: `${(counts[o.key] / runs) * 100}%`, background: o.color }} />
        ))}
      </div>
      <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-[6px] mt-3">
        {shown.map((o) => (
          <li key={o.key} className="flex items-center gap-2 text-[12.5px] text-ink-2">
            <span aria-hidden className="w-[10px] h-[10px] rounded-[3px] shrink-0" style={{ background: o.color }} />
            {o.label}
            <b className="tnum text-ink">{pct(counts[o.key], runs)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The balance against the floor it must stay above.
 *
 * The floor is drawn as steps, because that is how it moves: flat, then up at
 * a close or a new high. The target is the line to reach. A crosshair reads
 * any point, and the sentence above the chart says how the attempt ended, so
 * nothing here depends on hovering.
 */
function AttemptChart({ path, rules, outcome, money }: {
  path: PathPoint[]; rules: ChallengeRules; outcome: Outcome; money: (u: number) => string;
}) {
  // Axis labels in thousands: "$106,000" does not fit a phone-width margin.
  const short = (units: number) => {
    const d = Number(money(units).replace(/[$,]/g, ''));
    return d >= 1000 ? `$${Math.round(d / 100) / 10}k` : `$${d}`;
  };
  // Narrow enough that its text is still readable at phone width, where it
  // is drawn at about 85% of this size.
  const W = 420, H = 240, L = 50, R = 12, T = 16, B = 26;
  const [hover, setHover] = useState<number | null>(null);
  if (path.length < 2) return null;

  const target = START + rules.targetPct;
  const tMax = Math.max(1, path.at(-1)!.t);
  const lo = Math.min(...path.map((p) => Math.min(p.equity, p.floor)), START - rules.maxPct);
  const hi = Math.max(...path.map((p) => p.equity), target);
  const pad = (hi - lo) * 0.08 || 1;
  const y0 = lo - pad, y1 = hi + pad;
  const x = (t: number) => L + (t / tMax) * (W - L - R);
  const y = (v: number) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  const f = (n: number) => n.toFixed(1);

  const equity = path.map((p) => `${f(x(p.t))},${f(y(p.equity))}`).join(' ');
  let floor = `${f(x(path[0]!.t))},${f(y(path[0]!.floor))}`;
  for (let i = 1; i < path.length; i += 1) {
    floor += ` ${f(x(path[i]!.t))},${f(y(path[i - 1]!.floor))} ${f(x(path[i]!.t))},${f(y(path[i]!.floor))}`;
  }
  const end = path.at(-1)!;
  const ended = outcome === 'max-loss' || outcome === 'daily-loss';
  const ticks = [START - rules.maxPct, START, target];
  const h = hover !== null ? path[hover] : null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - box.left) / box.width) * W;
    const t = ((vx - L) / (W - L - R)) * tMax;
    let best = 0;
    for (let i = 1; i < path.length; i += 1) if (Math.abs(path[i]!.t - t) < Math.abs(path[best]!.t - t)) best = i;
    setHover(best);
  };

  return (
    <figure className="relative max-w-[560px]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="w-full h-auto touch-none"
        role="img"
        aria-label="The balance of one simulated attempt against its loss floor and profit target"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={f(y(v))} y2={f(y(v))} stroke="#E5E8EE" strokeWidth={1} />
            <text x={L - 7} y={f(y(v))} textAnchor="end" dominantBaseline="middle" fontSize={13} fill="#616C84"
              style={{ fontVariantNumeric: 'tabular-nums' }}>{short(v)}</text>
          </g>
        ))}
        <line x1={L} x2={W - R} y1={f(y(target))} y2={f(y(target))} stroke="#0E7E55" strokeWidth={1.5} />
        <text x={L + 4} y={f(y(target) - 6)} fontSize={13} fill="#0E7E55" fontWeight={600}>Target</text>
        <polyline points={floor} fill="none" stroke="#D22127" strokeWidth={2} strokeLinejoin="round" />
        <text x={L + 4} y={f(y(path[0]!.floor) + 16)} fontSize={13} fill="#D22127" fontWeight={600}>Floor</text>
        <polyline points={equity} fill="none" stroke="#2456E8" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <text x={L} y={H - 6} fontSize={13} fill="#616C84">Day 0</text>
        <text x={W - R} y={H - 6} textAnchor="end" fontSize={13} fill="#616C84">Day {Math.ceil(tMax)}</text>
        {ended ? (
          <g>
            <circle cx={f(x(end.t))} cy={f(y(end.equity))} r={7} fill="#FFFFFF" />
            <circle cx={f(x(end.t))} cy={f(y(end.equity))} r={5} fill="#D22127" />
          </g>
        ) : outcome === 'passed' ? (
          <g>
            <circle cx={f(x(end.t))} cy={f(y(end.equity))} r={7} fill="#FFFFFF" />
            <circle cx={f(x(end.t))} cy={f(y(end.equity))} r={5} fill="#0E7E55" />
          </g>
        ) : null}
        {h ? (
          <g>
            <line x1={f(x(h.t))} x2={f(x(h.t))} y1={T} y2={H - B} stroke="#9AA3B5" strokeWidth={1} />
            <circle cx={f(x(h.t))} cy={f(y(h.equity))} r={4.5} fill="#2456E8" stroke="#FFFFFF" strokeWidth={2} />
          </g>
        ) : null}
      </svg>
      {h ? (
        <figcaption
          className="absolute top-0 pointer-events-none rounded-[8px] bg-ink text-white text-[11.5px] leading-[1.5] px-2 py-1 tnum shadow"
          style={{ left: `${(x(h.t) / W) * 100}%`, transform: `translateX(${x(h.t) > W / 2 ? '-105%' : '5%'})` }}
        >
          Day {Math.ceil(h.t) || 0} · balance {money(h.equity)} · floor {money(h.floor)}
        </figcaption>
      ) : null}
    </figure>
  );
}
