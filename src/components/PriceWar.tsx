import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { MODELS } from '../data/models';
import type { ModelEntry } from '../data/types';
import {
  T0,
  SPAN,
  tNorm,
  toMs,
  fromNorm,
  fmtDate,
  labColor,
  labName,
  clamp,
  fmtMinutes,
} from '../lib/utils';
import { SectionHead } from './Observatory';

type PK = 'swebenchVerified' | 'swebenchPro' | 'hle' | 'arcagi2' | 'metrHorizon';

const PMETA: Record<PK, { label: string; unit: string; domain: [number, number] }> = {
  swebenchVerified: { label: 'SWE-bench Verified', unit: '%', domain: [50, 90] },
  swebenchPro: { label: 'SWE-bench Pro', unit: '%', domain: [35, 85] },
  hle: { label: "Humanity's Last Exam", unit: '%', domain: [15, 65] },
  arcagi2: { label: 'ARC-AGI-2', unit: '%', domain: [0, 100] },
  metrHorizon: { label: 'METR 自主任务时长', unit: '', domain: [40, 1200] },
};

const pval = (m: ModelEntry, k: PK) => {
  const b = m.benchmarks?.[k];
  return b ? b.v : null;
};

const PRICED = MODELS.filter((m) => m.priceIn !== undefined);

export default function PriceWar({ onSelect }: { onSelect: (m: ModelEntry) => void }) {
  const [pk, setPk] = useState<PK>('swebenchVerified');
  const [cut, setCut] = useState(1);
  const meta = PMETA[pk];

  const w = 940;
  const h = 400;
  const padL = 58;
  const padR = 26;
  const padT = 22;
  const padB = 46;

  const pts = useMemo(
    () =>
      MODELS.filter((m) => m.priceIn !== undefined && pval(m, pk) !== null && tNorm(m.date) <= cut),
    [pk, cut],
  );

  // 价格下限（log）：$0.10 → $80
  const PX = (p: number) => {
    const lo = Math.log10(0.08);
    const hi = Math.log10(90);
    return padL + ((Math.log10(p) - lo) / (hi - lo)) * (w - padL - padR);
  };
  const PY = (v: number) => {
    const [a, b] = meta.domain;
    const lv = pk === 'metrHorizon' ? Math.log10(v) : v;
    const la = pk === 'metrHorizon' ? Math.log10(a) : a;
    const lb = pk === 'metrHorizon' ? Math.log10(b) : b;
    return h - padB - ((clamp(lv, la, lb) - la) / (lb - la)) * (h - padT - padB);
  };

  /* Pareto 前沿：同价位下能力最高者 */
  const frontier = useMemo(() => {
    const sorted = [...pts].sort((a, b) => a.priceIn! - b.priceIn!);
    const out: ModelEntry[] = [];
    let best = -Infinity;
    for (const m of sorted) {
      const v = pval(m, pk)!;
      if (v > best) {
        best = v;
        out.push(m);
      }
    }
    return out.sort((a, b) => a.priceIn! - b.priceIn!);
  }, [pts, pk]);

  /* 能力达标线：达到目标能力的最便宜模型（随时间） */
  const target = pk === 'metrHorizon' ? 240 : (meta.domain[0] + meta.domain[1]) / 2;
  const priceIndex = useMemo(() => {
    const rows: { date: string; price: number; model: string; lab: string }[] = [];
    const sorted = MODELS.filter((m) => m.priceIn !== undefined).sort((a, b) => a.date.localeCompare(b.date));
    let best: (typeof sorted)[number] | null = null;
    for (const m of sorted) {
      const v = pval(m, pk);
      if (v !== null && v >= target) {
        if (!best || m.priceIn! < best.priceIn!) best = m;
        rows.push({ date: m.date, price: best.priceIn!, model: best.name, lab: best.lab });
      }
    }
    return rows;
  }, [pk, target]);

  const xTicks = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 75];
  const yTicks =
    pk === 'metrHorizon'
      ? [50, 120, 300, 600, 1000]
      : Array.from({ length: 5 }, (_, i) => meta.domain[0] + ((meta.domain[1] - meta.domain[0]) / 4) * i);

  /* ── Token 账单模拟器 ── */
  const [tasks, setTasks] = useState(60);
  const [inTok, setInTok] = useState(60_000);
  const [outTok, setOutTok] = useState(6_000);
  const [agentMult, setAgentMult] = useState(14);
  const [retry, setRetry] = useState(1.5);
  const [modelId, setModelId] = useState('gpt-6.1-terra');
  const sim = MODELS.find((m) => m.id === modelId) ?? MODELS[0];

  const months = 1;
  const effIn = (tasks * inTok * agentMult * retry * months) / 1e6;
  const effOut = (tasks * outTok * agentMult * retry * months) / 1e6;
  const bill = effIn * (sim.priceIn ?? 0) + effOut * (sim.priceOut ?? 0);

  // 同等能力档位在 2025 年初的价格参照
  const ref2025 = MODELS.find((m) => m.id === 'gpt-4.5')!;
  const bill2025 = effIn * ref2025.priceIn! + effOut * ref2025.priceOut!;
  // 2025 年初「非 Agent」用量参照：agentMult = 1, retry = 1
  const tokensOld = (tasks * inTok * 1 * 1 * months) / 1e6;
  const tokensOldOut = (tasks * outTok * 1 * 1 * months) / 1e6;
  const billOld = tokensOld * ref2025.priceIn! + tokensOldOut * ref2025.priceOut!;

  const candidates = MODELS.filter((m) => m.priceIn !== undefined).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section id="price" className="relative z-10 border-b border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 05 · THE GREAT DEFLATION"
          title="智能价格战与 Jevons 悖论"
          desc="横轴是 API 输入单价（对数，越靠左越便宜），纵轴是能力。把时间游标从左拉到右，你会看到整片点云向左上方移动——同等能力在两年内便宜了约两个数量级。然后往下看账单模拟器。"
          accent="#FBBF24"
        />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {Object.entries(PMETA).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setPk(k as PK)}
              className={`rounded-lg border px-2.5 py-1.5 font-mono text-[10.5px] transition ${
                pk === k
                  ? 'border-amber-400/50 bg-amber-400/12 text-amber-200'
                  : 'border-white/10 text-slate-500 hover:text-slate-300'
              }`}
            >
              {v.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500">时间截面</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.002}
              value={cut}
              onChange={(e) => setCut(Number(e.target.value))}
              className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-400"
            />
            <span className="num w-[86px] font-mono text-[11px] font-semibold text-amber-300">
              {fmtDate(fromNorm(cut))}
            </span>
          </div>
        </div>

        <div className="panel mt-3 overflow-hidden p-2 sm:p-4">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
            {xTicks.map((v) => (
              <g key={v}>
                <line x1={PX(v)} y1={padT} x2={PX(v)} y2={h - padB} stroke="rgba(148,163,184,0.07)" strokeWidth={0.8} />
                <text x={PX(v)} y={h - padB + 16} fill="rgba(148,163,184,0.55)" fontSize={9} fontFamily="monospace" textAnchor="middle">
                  ${v}
                </text>
              </g>
            ))}
            {yTicks.map((v, i) => (
              <g key={i}>
                <line x1={padL} y1={PY(v)} x2={w - padR} y2={PY(v)} stroke="rgba(148,163,184,0.07)" strokeWidth={0.8} />
                <text x={padL - 7} y={PY(v) + 3} fill="rgba(148,163,184,0.55)" fontSize={9} fontFamily="monospace" textAnchor="end">
                  {pk === 'metrHorizon' ? fmtMinutes(v) : `${Math.round(v)}%`}
                </text>
              </g>
            ))}

            {/* Pareto 前沿 */}
            {frontier.length > 1 && (
              <path
                d={frontier
                  .map((m, i) => `${i ? 'L' : 'M'}${PX(m.priceIn!).toFixed(1)},${PY(pval(m, pk)!).toFixed(1)}`)
                  .join(' ')}
                fill="none"
                stroke="rgba(251,191,36,0.55)"
                strokeWidth={1.4}
                strokeDasharray="5 3"
              />
            )}

            {pts.map((m) => {
              const v = pval(m, pk)!;
              const c = labColor(m.lab);
              const isFront = frontier.includes(m);
              const age = clamp((cut - tNorm(m.date)) / 0.12, 0, 1);
              return (
                <g key={m.id} onClick={() => onSelect(m)} className="cursor-pointer" opacity={0.35 + 0.65 * age}>
                  <circle cx={PX(m.priceIn!)} cy={PY(v)} r={12} fill={c} opacity={0.08} />
                  <circle
                    cx={PX(m.priceIn!)}
                    cy={PY(v)}
                    r={isFront ? 5.6 : 4}
                    fill={isFront ? c : '#0A0E1A'}
                    stroke={c}
                    strokeWidth={isFront ? 1 : 1.8}
                  />
                  {(isFront || (m.weight ?? 0) >= 0.9) && (
                    <text
                      x={PX(m.priceIn!) + 9}
                      y={PY(v) + 3}
                      fill="rgba(203,213,225,0.8)"
                      fontSize={8.5}
                      fontFamily="monospace"
                    >
                      {m.name.length > 18 ? m.name.slice(0, 17) + '…' : m.name}
                    </text>
                  )}
                </g>
              );
            })}

            <text x={padL} y={h - 8} fill="rgba(100,116,139,0.75)" fontSize={9} fontFamily="monospace">
              ← 更便宜 · API 输入单价 $/1M（对数轴，发布时列表价，不含缓存与批量折扣）
            </text>
            <text x={w - padR} y={padT - 8} fill="rgba(100,116,139,0.75)" fontSize={9} fontFamily="monospace" textAnchor="end">
              虚线 = Pareto 前沿（同价位下的最高能力） · 实心点位于前沿上
            </text>
          </svg>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-4">
          {[
            {
              k: '$75 → $1',
              l: '旗舰档输入单价',
              d: 'GPT-4.5（2025-02）$75/M → GPT-6.1 Terra（2026-10）$1/M。约 75 倍。',
              c: '#FBBF24',
            },
            {
              k: '$0.10/M',
              l: '最低档价格地板',
              d: 'Gemini 2.5 Flash-Lite（2025-07）首创，GPT-6 Luna 与 Claude Haiku 5.5（2026）跟进。',
              c: '#2DD4BF',
            },
            {
              k: '20–100×',
              l: 'Agent 模式 token 消耗',
              d: '长思维链 + 多轮工具调用 + 失败重试 + 多智能体编排，相对 2025 年初的一次性问答。',
              c: '#F87171',
            },
            {
              k: '≈ 0',
              l: '重度用户净账单变化',
              d: '单价 ÷20 × 用量 ×20 = 账单持平。这就是 Jevons 悖论：效率提升扩大了总消耗。',
              c: '#818CF8',
            },
          ].map((x) => (
            <div key={x.l} className="panel p-3.5">
              <div className="num font-mono text-xl font-black" style={{ color: x.c }}>
                {x.k}
              </div>
              <div className="mt-1 text-[12px] font-semibold text-slate-200">{x.l}</div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{x.d}</p>
            </div>
          ))}
        </div>

        {/* 账单模拟器 */}
        <div className="panel mt-4 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/[0.07] bg-amber-400/[0.05] px-5 py-3">
            <Calculator size={15} className="text-amber-400" />
            <h3 className="text-[14px] font-bold text-slate-100">Token 账单模拟器</h3>
            <span className="font-mono text-[10px] text-slate-500">
              单价 × 用量 = 真相。拖动滑块看你自己的场景。
            </span>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3.5">
              {[
                { l: '每月任务数', v: tasks, set: setTasks, min: 5, max: 2000, step: 5, fmt: (n: number) => `${n}` },
                {
                  l: '单任务基础输入 token',
                  v: inTok,
                  set: setInTok,
                  min: 2000,
                  max: 400000,
                  step: 2000,
                  fmt: (n: number) => `${(n / 1000).toFixed(0)}K`,
                },
                {
                  l: '单任务基础输出 token',
                  v: outTok,
                  set: setOutTok,
                  min: 500,
                  max: 60000,
                  step: 500,
                  fmt: (n: number) => `${(n / 1000).toFixed(1)}K`,
                },
                {
                  l: 'Agent 模式放大倍数（思维链 + 工具轮次 + 多智能体）',
                  v: agentMult,
                  set: setAgentMult,
                  min: 1,
                  max: 100,
                  step: 1,
                  fmt: (n: number) => `${n}×`,
                },
                {
                  l: '失败重试系数',
                  v: retry,
                  set: setRetry,
                  min: 1,
                  max: 4,
                  step: 0.1,
                  fmt: (n: number) => `${n.toFixed(1)}×`,
                },
              ].map((s) => (
                <div key={s.l}>
                  <div className="flex items-baseline justify-between gap-3">
                    <label className="text-[11.5px] text-slate-400">{s.l}</label>
                    <span className="num shrink-0 font-mono text-[12px] font-bold text-amber-300">
                      {s.fmt(s.v)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={s.v}
                    onChange={(e) => s.set(Number(e.target.value))}
                    className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-400"
                  />
                </div>
              ))}

              <div>
                <label className="text-[11.5px] text-slate-400">选择模型</label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/12 bg-[#0A0E1A] px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-amber-400/50"
                >
                  {candidates.map((m) => (
                    <option key={m.id} value={m.id}>
                      {fmtDate(m.date)} · {m.name} — ${m.priceIn}/${m.priceOut} per 1M
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
                <div className="font-mono text-[10px] tracking-widest text-amber-400">
                  当前设置 · 月度账单
                </div>
                <div className="num mt-1.5 font-mono text-4xl font-black text-amber-200">
                  ${bill.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-2 space-y-1 font-mono text-[10.5px] text-amber-200/60">
                  <div>
                    有效输入 {effIn.toLocaleString(undefined, { maximumFractionDigits: 1 })}M tok × $
                    {sim.priceIn}
                  </div>
                  <div>
                    有效输出 {effOut.toLocaleString(undefined, { maximumFractionDigits: 1 })}M tok × $
                    {sim.priceOut}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="font-mono text-[10px] tracking-widest text-slate-500">反事实对照</div>
                <div className="mt-2.5 space-y-2.5">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      A · 同样的用量，用 2025-02 的 GPT-4.5（$75/$150）
                    </div>
                    <div className="num font-mono text-[17px] font-bold text-slate-200">
                      ${bill2025.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      <span className="ml-1.5 text-[10px] font-normal text-emerald-400">
                        单价便宜 {(bill2025 / Math.max(bill, 0.01)).toFixed(0)}×
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.07]" />
                  <div>
                    <div className="text-[11px] text-slate-400">
                      B · 2025 年初的「非 Agent」用量（1× 放大、无重试）+ GPT-4.5 价格
                    </div>
                    <div className="num font-mono text-[17px] font-bold text-slate-200">
                      ${billOld.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.07]" />
                  <div>
                    <div className="text-[11px] text-slate-400">C · 你的实际账单 ÷ B（真实世界净变化）</div>
                    <div
                      className="num font-mono text-[17px] font-bold"
                      style={{ color: bill / Math.max(billOld, 0.01) > 1.15 ? '#F87171' : '#34D399' }}
                    >
                      {(bill / Math.max(billOld, 0.01)).toFixed(2)}×
                      <span className="ml-1.5 text-[10px] font-normal text-slate-500">
                        {bill / Math.max(billOld, 0.01) > 1.15
                          ? '→ 更贵了，但买到的东西多得多'
                          : '→ 确实更便宜'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500">
                <b className="text-slate-400">诚实说明：</b>
                模拟器不含 prompt 缓存命中折扣（生产中通常使有效输入单价再降 50–90%）、批量 API 折扣、
                预置容量、订阅套餐折算，也不含自建 GPU 的资本开支与电力。它是一个量级估算工具，
                不是报价单。<b className="text-slate-400">「A vs C」的对比才是本模块的重点</b>：
                单价的暴跌是真实的，用量的暴涨也是真实的，两者相乘的结果因工作流而异。
              </p>
            </div>
          </div>
        </div>

        {/* 达标价格阶梯 */}
        <div className="panel mt-4 p-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <div className="font-mono text-[10px] tracking-widest text-slate-500">
              「智能价格指数」：达到 {meta.label} ≥ {pk === 'metrHorizon' ? fmtMinutes(target) : `${target}${meta.unit}`} 的最便宜模型
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-x-1 gap-y-2">
            {priceIndex.map((r, i) => {
              const prev = priceIndex[i - 1];
              const maxP = Math.max(...priceIndex.map((x) => x.price));
              const hgt = 12 + (r.price / maxP) * 90;
              return (
                <div key={i} className="group flex flex-col items-center" title={`${fmtDate(r.date)} · ${r.model} · $${r.price}/M`}>
                  <span className="num mb-1 font-mono text-[9px] text-slate-500 opacity-0 transition group-hover:opacity-100">
                    ${r.price}
                  </span>
                  <div
                    className="w-6 rounded-t transition-all group-hover:brightness-125"
                    style={{
                      height: hgt,
                      background: `linear-gradient(180deg, ${labColor(r.lab)}, ${labColor(r.lab)}33)`,
                    }}
                  />
                  <span className="mt-1 w-6 truncate text-center font-mono text-[8px] text-slate-600">
                    {r.date.slice(2, 7)}
                  </span>
                </div>
              );
            })}
            {priceIndex.length === 0 && (
              <div className="py-4 text-[12px] text-slate-500">
                截至 2026-11-03，尚无任何模型在该指标上达到此阈值并有公开定价。
              </div>
            )}
          </div>
          {priceIndex.length > 1 && (
            <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
              从 <b className="text-slate-300">${priceIndex[0].price}/M</b>（
              {fmtDate(priceIndex[0].date)}，{priceIndex[0].model}）到{' '}
              <b className="text-slate-300">${priceIndex[priceIndex.length - 1].price}/M</b>（
              {fmtDate(priceIndex[priceIndex.length - 1].date)}，{priceIndex[priceIndex.length - 1].model}）——
              同一能力门槛的入场价下降了约{' '}
              <b className="text-amber-300">
                {(priceIndex[0].price / Math.max(priceIndex[priceIndex.length - 1].price, 0.001)).toFixed(0)} 倍
              </b>
              。这条线之所以有意义，是因为它固定了能力门槛，只让价格变动。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
