import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { METR_POINTS, METR_HISTORICAL, METR_META } from '../data/metr';
import { labColor, fmtMinutes, fmtDate } from '../lib/utils';
import { SectionHead } from './Observatory';

const ALL = [...METR_HISTORICAL, ...METR_POINTS].sort((a, b) => a.date.localeCompare(b.date));
const FIT_START = Date.UTC(2019, 2, 1);
const FIT_END = Date.UTC(2027, 5, 1);

export default function MetrHorizon() {
  const [log, setLog] = useState(true);
  const [showFit, setShowFit] = useState(true);
  const [showExtrap, setShowExtrap] = useState(false);

  const w = 940;
  const h = 380;
  const padL = 62;
  const padR = 26;
  const padT = 20;
  const padB = 40;

  const lsq = (pts: typeof ALL) => {
    const xs = pts.map((p) => (Date.parse(p.date) - FIT_START) / 86400000);
    const ys = pts.map((p) => Math.log10(p.minutes));
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - mx) * (ys[i] - my);
      den += (xs[i] - mx) ** 2;
    }
    const b = num / den;
    const a = my - b * mx;
    return { a, b, doublingDays: Math.log10(2) / b, n };
  };

  /* 两条拟合：全区间（2019–2026）与 2023 年后。差异本身就是信息。 */
  const fit = useMemo(() => lsq(ALL.filter((p) => p.reliable)), []);
  const fitRecent = useMemo(
    () => lsq(ALL.filter((p) => p.reliable && p.date >= '2023-01-01')),
    [],
  );

  const domain: [number, number] = log ? [0.01, 40000] : [0, 1200];
  const X = (iso: string) => padL + ((Date.parse(iso) - FIT_START) / (FIT_END - FIT_START)) * (w - padL - padR);
  const Xd = (ms: number) => padL + ((ms - FIT_START) / (FIT_END - FIT_START)) * (w - padL - padR);
  const Y = (min: number) => {
    const v = log ? Math.log10(Math.max(min, domain[0])) : min;
    const lo = log ? Math.log10(domain[0]) : domain[0];
    const hi = log ? Math.log10(domain[1]) : domain[1];
    return h - padB - ((v - lo) / (hi - lo)) * (h - padT - padB);
  };
  const fitAt = (ms: number, f = fit) => {
    const d = (ms - FIT_START) / 86400000;
    return Math.pow(10, f.a + f.b * d);
  };

  const yTicks = log ? [0.01, 0.1, 1, 10, 100, 1000, 10000] : [0, 200, 400, 600, 800, 1000];
  const yearTicks = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

  const linePath = (f: typeof fit, from: number, to: number) => {
    const seg: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const ms = from + (i / 200) * (to - from);
      const v = fitAt(ms, f);
      if (v > domain[1]) break;
      if (v < domain[0]) continue;
      seg.push(`${seg.length ? 'L' : 'M'}${Xd(ms).toFixed(1)},${Y(v).toFixed(1)}`);
    }
    return seg.join(' ');
  };

  const fitPath = linePath(fit, FIT_START, Date.UTC(2026, 10, 3));
  const fitRecentPath = linePath(fitRecent, Date.UTC(2023, 0, 1), Date.UTC(2026, 10, 3));

  const extrapPath = linePath(fitRecent, Date.UTC(2026, 10, 3), FIT_END);

  const nowX = Xd(Date.UTC(2026, 10, 3));
  const unreliableY = Y(METR_META.unreliableAboveMinutes);

  return (
    <section id="metr" className="relative z-10 border-b border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 04 · AUTONOMOUS TASK HORIZON"
          title="自主任务时长曲线"
          desc="唯一由独立第三方（METR）在受控条件下测量的能力轴：模型在人类专家需要 X 时间的任务上达到 50% 成功率。这是过去两年最有意义的单一指标——也是 2026 年触到测量工具上限的那个指标。"
          accent="#34D399"
        />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            {[
              [true, '对数刻度'],
              [false, '线性刻度'],
            ].map(([v, label]) => (
              <button
                key={String(v)}
                onClick={() => setLog(v as boolean)}
                className={`px-3 py-1.5 font-mono text-[10.5px] transition ${
                  log === v ? 'bg-emerald-400/15 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {label as string}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFit(!showFit)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[10.5px] transition ${
              showFit ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-white/10 text-slate-500'
            }`}
          >
            指数拟合线
          </button>
          <button
            onClick={() => setShowExtrap(!showExtrap)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[10.5px] transition ${
              showExtrap ? 'border-red-400/40 bg-red-400/10 text-red-300' : 'border-white/10 text-slate-500'
            }`}
          >
            ⚠ 未来外推（演示用）
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-slate-500">
            <span>
              全区间拟合（2019–2026, n={fit.n}）≈{' '}
              <b className="text-slate-300">{fit.doublingDays.toFixed(0)} 天</b>
            </span>
            <span className="text-slate-700">|</span>
            <span>
              2023 年后拟合（n={fitRecent.n}）≈{' '}
              <b className="text-emerald-400">{fitRecent.doublingDays.toFixed(0)} 天</b>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-600">METR 公布 {METR_META.doublingDaysPost2023} 天</span>
          </div>
        </div>

        <div className="panel mt-3 overflow-hidden p-2 sm:p-4">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
            <defs>
              <linearGradient id="metrFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 不可靠区间 */}
            <rect
              x={padL}
              y={padT}
              width={w - padL - padR}
              height={Math.max(0, unreliableY - padT)}
              fill="rgba(248,113,113,0.055)"
            />
            <line
              x1={padL}
              y1={unreliableY}
              x2={w - padR}
              y2={unreliableY}
              stroke="#F87171"
              strokeWidth={1}
              strokeDasharray="5 4"
              opacity={0.6}
            />
            <text x={w - padR - 4} y={unreliableY - 5} fill="#F87171" fontSize={9} fontFamily="monospace" textAnchor="end" opacity={0.9}>
              METR 声明：&gt;16 小时区间测量不可靠（噪声过大 · 样本稀少 · 评分者一致性下降）
            </text>

            {/* 今日线 */}
            <line x1={nowX} y1={padT} x2={nowX} y2={h - padB} stroke="rgba(45,212,191,0.5)" strokeWidth={1.2} />
            <text x={nowX + 4} y={padT + 11} fill="#2DD4BF" fontSize={9} fontFamily="monospace">
              2026-11-03 今日
            </text>

            {/* 网格 */}
            {yearTicks.map((yr) => (
              <g key={yr}>
                <line x1={Xd(Date.UTC(yr, 0, 1))} y1={padT} x2={Xd(Date.UTC(yr, 0, 1))} y2={h - padB} stroke="rgba(148,163,184,0.08)" strokeWidth={0.8} />
                <text x={Xd(Date.UTC(yr, 0, 1))} y={h - padB + 16} fill="rgba(148,163,184,0.5)" fontSize={9} fontFamily="monospace" textAnchor="middle">
                  {yr}
                </text>
              </g>
            ))}
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={padL} y1={Y(v)} x2={w - padR} y2={Y(v)} stroke="rgba(148,163,184,0.07)" strokeWidth={0.8} />
                <text x={padL - 7} y={Y(v) + 3} fill="rgba(148,163,184,0.5)" fontSize={9} fontFamily="monospace" textAnchor="end">
                  {v >= 60 ? `${v / 60}h` : `${v}m`}
                </text>
              </g>
            ))}

            {showFit && (
              <>
                <path d={fitPath} fill="none" stroke="#34D399" strokeWidth={1.3} strokeDasharray="4 3" opacity={0.42} />
                <path d={fitRecentPath} fill="none" stroke="#34D399" strokeWidth={1.8} strokeDasharray="6 3" opacity={0.85} />
                <text x={Xd(Date.UTC(2021, 5, 1))} y={Y(Math.max(Math.min(fitAt(Date.UTC(2021, 5, 1)), domain[1]), domain[0])) - 8} fill="#34D399" fontSize={8.5} fontFamily="monospace" textAnchor="middle" opacity={0.75}>
                  全区间拟合 ~{fit.doublingDays.toFixed(0)}d
                </text>
                <text x={Xd(Date.UTC(2024, 5, 1))} y={Y(Math.max(Math.min(fitAt(Date.UTC(2024, 5, 1), fitRecent), domain[1]), domain[0])) - 8} fill="#34D399" fontSize={8.5} fontFamily="monospace" textAnchor="middle">
                  2023 后拟合 ~{fitRecent.doublingDays.toFixed(0)}d
                </text>
              </>
            )}
            {showExtrap && (
              <>
                <path d={extrapPath} fill="none" stroke="#F87171" strokeWidth={1.6} strokeDasharray="6 4" opacity={0.85} />
                <text x={Xd(Date.UTC(2027, 3, 1))} y={Y(Math.min(fitAt(Date.UTC(2027, 3, 1), fitRecent), domain[1])) - 10} fill="#F87171" fontSize={9.5} fontFamily="monospace" textAnchor="middle">
                  按 2023 后斜率外推至 2027-04：{fmtMinutes(fitAt(Date.UTC(2027, 3, 1), fitRecent))}
                </text>
              </>
            )}

            {/* 数据点 */}
            {ALL.map((p, i) => {
              const c = labColor(p.lab);
              const x = X(p.date);
              const y = Y(p.minutes);
              const prev = ALL[i - 1];
              return (
                <g key={p.model + p.date}>
                  {prev && (
                    <line x1={X(prev.date)} y1={Y(prev.minutes)} x2={x} y2={y} stroke={c} strokeWidth={1.6} opacity={0.5} />
                  )}
                  <circle cx={x} cy={y} r={11} fill={c} opacity={0.09} />
                  <circle
                    cx={x}
                    cy={y}
                    r={p.reliable ? 5 : 5}
                    fill={p.reliable ? c : '#0A0E1A'}
                    stroke={c}
                    strokeWidth={2}
                    strokeDasharray={p.reliable ? undefined : '2.5 2'}
                  />
                  <text x={x} y={y - 13} fill="rgba(226,232,240,0.9)" fontSize={9.5} fontFamily="monospace" textAnchor="middle" fontWeight={600}>
                    {fmtMinutes(p.minutes)}
                  </text>
                  <text x={x} y={y + 22} fill="rgba(100,116,139,0.95)" fontSize={7.5} fontFamily="monospace" textAnchor="middle">
                    {p.model.length > 22 ? p.model.slice(0, 21) + '…' : p.model}
                  </text>
                </g>
              );
            })}

            <text x={padL} y={h - 6} fill="rgba(100,116,139,0.7)" fontSize={8.5} fontFamily="monospace">
              实心点 = METR 声明的可靠区间 · 虚线空心点 = 超出可靠区间（含 2026 年被广泛引用的 12–14.5 小时）
            </text>
          </svg>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="panel p-4">
            <div className="font-mono text-[10px] tracking-widest text-emerald-400">为什么这张图必须带警告</div>
            <ul className="mt-3 space-y-2.5">
              {METR_META.notes.map((n, i) => (
                <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/60" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-4">
            <div className="font-mono text-[10px] tracking-widest text-slate-500">刻度选择本身就是修辞</div>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-slate-400">
              点上面的「线性刻度」看看。同一批数据在对数轴上是一条漂亮的直线，在线性轴上是一根几乎贴地、
              末端突然抬起的曲棍球杆。<b className="text-slate-200">两种画法都没有撒谎，但它们讲述的是完全不同的故事。</b>
              几乎所有关于「AI 能力指数增长」的传播图都使用对数轴——这不是错误，但读者应当知道自己看到的是什么。
            </p>
            <div className="mt-3 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="font-mono text-[10px] text-slate-500">数据表</div>
              <div className="mt-2 space-y-1">
                {ALL.filter((p) => p.date >= '2025-01-01').map((p) => (
                  <div key={p.model + p.date} className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: labColor(p.lab) }} />
                    <span className="w-[86px] shrink-0 text-slate-600">{fmtDate(p.date)}</span>
                    <span className="min-w-0 flex-1 truncate text-slate-400">{p.model}</span>
                    <span className="shrink-0 text-slate-200">{fmtMinutes(p.minutes)}</span>
                    <span className={`w-[52px] shrink-0 text-right ${p.reliable ? 'text-emerald-500' : 'text-red-400'}`}>
                      {p.reliable ? '可靠' : '存疑'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-[11px] leading-relaxed text-slate-500">
              <Info size={13} className="mt-0.5 shrink-0 text-slate-600" />
              <span>
                2025-03 之前的锚点（GPT-2 → o1-preview）为 METR 论文回溯拟合值，用于展示完整曲线形态，
                并非当时的实测发布记录。
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
