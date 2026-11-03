import { useState } from 'react';
import type { CSSProperties } from 'react';
import { BENCHMARKS, BENCH_STATUS_META } from '../data/benchmarks';
import { LAB_BY_ID } from '../data/labs';
import type { BenchmarkSeries } from '../data/types';
import { T0, SPAN, toMs, tNorm, fmtDate, labColor } from '../lib/utils';
import { SectionHead } from './Observatory';

const STATUS_ORDER = ['saturated', 'retired', 'contested', 'active'] as const;

function Sparkline({ b, w = 210, hgt = 62 }: { b: BenchmarkSeries; w?: number; hgt?: number }) {
  const meta = BENCH_STATUS_META[b.status];
  const lo = Math.min(...b.points.map((p) => p.v)) * 0.85;
  const hi = Math.max(b.ceiling === 100 ? 100 : b.ceiling, Math.max(...b.points.map((p) => p.v)) * 1.05);
  const X = (d: string) => tNorm(d) * (w - 14) + 7;
  const Y = (v: number) => hgt - 8 - ((v - lo) / (hi - lo)) * (hgt - 18);
  const pts = [...b.points].sort((a, c) => a.date.localeCompare(c.date));
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.date).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${hgt}`} className="h-auto w-full" preserveAspectRatio="none">
      {b.status === 'saturated' && (
        <rect x={0} y={0} width={w} height={Y(88)} fill="rgba(148,163,184,0.07)" />
      )}
      {b.saturatedOn && (
        <>
          <line
            x1={X(b.saturatedOn)}
            y1={0}
            x2={X(b.saturatedOn)}
            y2={hgt}
            stroke="#F87171"
            strokeWidth={0.8}
            strokeDasharray="3 3"
            opacity={0.6}
          />
          <text x={X(b.saturatedOn) + 3} y={9} fill="#F87171" fontSize={7} fontFamily="monospace" opacity={0.85}>
            饱和 {b.saturatedOn}
          </text>
        </>
      )}
      <path d={path} fill="none" stroke={meta.color} strokeWidth={1.6} strokeLinejoin="round" />
      <path
        d={`${path} L${X(pts[pts.length - 1].date)},${hgt} L${X(pts[0].date)},${hgt} Z`}
        fill={meta.color}
        opacity={0.09}
      />
      {pts.map((p) => (
        <circle
          key={p.model + p.date}
          cx={X(p.date)}
          cy={Y(p.v)}
          r={p.src === 'independent' ? 2.4 : 2}
          fill={p.src === 'independent' ? meta.color : '#0A0E1A'}
          stroke={p.src === 'independent' ? '#0A0E1A' : labColor(p.lab)}
          strokeWidth={1.1}
        />
      ))}
    </svg>
  );
}

function BigChart({ b }: { b: BenchmarkSeries }) {
  const w = 900;
  const h = 300;
  const padL = 44;
  const padR = 20;
  const padT = 18;
  const padB = 34;
  const meta = BENCH_STATUS_META[b.status];
  const pts = [...b.points].sort((a, c) => a.date.localeCompare(c.date));
  const lo = b.unit === 'Elo' ? Math.min(...pts.map((p) => p.v)) - 40 : 0;
  const hi = b.unit === 'Elo' ? Math.max(...pts.map((p) => p.v)) + 30 : b.ceiling;
  const X = (d: string) => padL + tNorm(d) * (w - padL - padR);
  const Y = (v: number) => h - padB - ((v - lo) / (hi - lo)) * (h - padT - padB);

  const months = Array.from({ length: 23 }, (_, i) => i).filter((i) => {
    const ms = Date.UTC(2025, i, 1);
    return ms <= T0 + SPAN && new Date(ms).getUTCMonth() % 3 === 0;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
      {months.map((i) => {
        const ms = Date.UTC(2025, i, 1);
        const n = (ms - T0) / SPAN;
        const x = padL + n * (w - padL - padR);
        return (
          <g key={i}>
            <line x1={x} y1={padT} x2={x} y2={h - padB} stroke="rgba(148,163,184,0.09)" strokeWidth={0.8} />
            <text
              x={x}
              y={h - padB + 15}
              fill="rgba(148,163,184,0.55)"
              fontSize={9}
              fontFamily="monospace"
              textAnchor="middle"
            >
              {new Date(ms).getUTCFullYear()}.{String(new Date(ms).getUTCMonth() + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const v = lo + (hi - lo) * f;
        return (
          <g key={f}>
            <line x1={padL} y1={Y(v)} x2={w - padR} y2={Y(v)} stroke="rgba(148,163,184,0.07)" strokeWidth={0.8} />
            <text
              x={padL - 6}
              y={Y(v) + 3}
              fill="rgba(148,163,184,0.5)"
              fontSize={9}
              fontFamily="monospace"
              textAnchor="end"
            >
              {Math.round(v)}
            </text>
          </g>
        );
      })}
      {b.unit === '%' && b.ceiling === 100 && (
        <>
          <rect x={padL} y={Y(100)} width={w - padL - padR} height={Y(88) - Y(100)} fill="rgba(148,163,184,0.06)" />
          <text x={w - padR - 4} y={Y(94) + 3} fill="rgba(148,163,184,0.5)" fontSize={8.5} fontFamily="monospace" textAnchor="end">
            饱和区 88–100
          </text>
        </>
      )}

      <path
        d={pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.date).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ')}
        fill="none"
        stroke={meta.color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {pts.map((p) => {
        const c = labColor(p.lab);
        return (
          <g key={p.model + p.date}>
            <circle cx={X(p.date)} cy={Y(p.v)} r={9} fill={c} opacity={0.1} />
            <circle
              cx={X(p.date)}
              cy={Y(p.v)}
              r={4.4}
              fill={p.src === 'independent' ? c : '#0A0E1A'}
              stroke={c}
              strokeWidth={1.8}
            />
            <text
              x={X(p.date)}
              y={Y(p.v) - 11}
              fill="rgba(226,232,240,0.85)"
              fontSize={9}
              fontFamily="monospace"
              textAnchor="middle"
            >
              {p.v}
            </text>
            <text
              x={X(p.date)}
              y={Y(p.v) + 20}
              fill="rgba(100,116,139,0.9)"
              fontSize={7.5}
              fontFamily="monospace"
              textAnchor="middle"
            >
              {p.model.length > 20 ? p.model.slice(0, 19) + '…' : p.model}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function BenchmarkMuseum() {
  const [open, setOpen] = useState<string | null>('swebench-verified');
  const active = BENCHMARKS.find((b) => b.id === open) ?? null;

  return (
    <section id="benchmarks" className="relative z-10 border-b border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 03 · THE BENCHMARK MUSEUM"
          title="基准博物馆"
          desc="一个基准的死亡方式，就是被厂商自己静默地从发布材料里移除。这里陈列 11 具标本：4 具已饱和或退役，2 具方法论受质疑，5 具仍在有效区分模型。实心点 = 第三方独立测量，空心点 = 厂商自报。"
          accent="#818CF8"
        />

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...BENCHMARKS]
            .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
            .map((b) => {
              const meta = BENCH_STATUS_META[b.status];
              const isOpen = open === b.id;
              const first = b.points[0]?.v ?? 0;
              const last = b.points[b.points.length - 1]?.v ?? 0;
              const delta = last - first;
              return (
                <button
                  key={b.id}
                  onClick={() => setOpen(isOpen ? null : b.id)}
                  className={`panel panel-hover overflow-hidden p-3 text-left transition ${
                    isOpen ? 'ring-1 ring-inset' : ''
                  }`}
                  style={isOpen ? ({ ['--tw-ring-color' as string]: meta.color + '66' } as CSSProperties) : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] font-semibold text-slate-200">{b.name}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className="rounded px-1.5 py-px font-mono text-[9px] font-semibold"
                          style={{ background: meta.color + '22', color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span className="font-mono text-[9px] text-slate-600">
                          {b.points.length} 个数据点
                        </span>
                      </div>
                    </div>
                    <div className="num shrink-0 text-right font-mono">
                      <div className="text-[15px] font-bold" style={{ color: meta.color }}>
                        {last}
                        <span className="text-[9px] opacity-70">{b.unit}</span>
                      </div>
                      <div className={`text-[9.5px] ${delta >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {delta >= 0 ? '+' : ''}
                        {delta.toFixed(1)} 全期
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Sparkline b={b} />
                  </div>
                </button>
              );
            })}
        </div>

        {active && (
          <div className="panel mt-4 overflow-hidden">
            <div
              className="flex flex-wrap items-start gap-3 border-b border-white/[0.07] px-5 py-4"
              style={{ background: `linear-gradient(90deg, ${BENCH_STATUS_META[active.status].color}12, transparent 60%)` }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-50">{active.name}</h3>
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[9.5px] font-semibold"
                    style={{
                      background: BENCH_STATUS_META[active.status].color + '22',
                      color: BENCH_STATUS_META[active.status].color,
                    }}
                  >
                    {BENCH_STATUS_META[active.status].label} · {BENCH_STATUS_META[active.status].desc}
                  </span>
                </div>
                <p className="mt-2 max-w-4xl text-[12.5px] leading-relaxed text-slate-400">{active.story}</p>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="shrink-0 rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] text-slate-500 hover:text-slate-200"
              >
                收起
              </button>
            </div>
            <div className="px-2 py-4 sm:px-4">
              <BigChart b={active} />
            </div>
            <div className="grid gap-px overflow-hidden border-t border-white/[0.07] bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-3">
              {[...active.points]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((p) => (
                  <div key={p.model + p.date} className="bg-[#0A0E1A] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: labColor(p.lab), boxShadow: `0 0 6px ${labColor(p.lab)}` }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-300">{p.model}</span>
                      <span className="num shrink-0 font-mono text-[12px] font-bold text-slate-100">
                        {p.v}
                        {active.unit === '%' ? '%' : ''}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 pl-3.5 font-mono text-[9px] text-slate-600">
                      <span>{fmtDate(p.date)}</span>
                      <span>{LAB_BY_ID[p.lab]?.short ?? p.lab.toUpperCase()}</span>
                      <span
                        className={p.src === 'independent' ? 'text-indigo-400' : 'text-amber-500/80'}
                      >
                        {p.src === 'independent' ? '[独立实测]' : '[厂商公布]'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              t: '已饱和 / 退役',
              c: '#64748B',
              n: BENCHMARKS.filter((b) => b.status === 'saturated' || b.status === 'retired').length,
              d: 'MMLU、GSM8K、HumanEval、ARC-AGI-1、GPQA。前沿模型普遍 >90%，其中 GPQA 已超过该基准的人类专家上限（约 65–81%）。',
            },
            {
              t: '方法论受质疑',
              c: '#FBBF24',
              n: BENCHMARKS.filter((b) => b.status === 'contested').length,
              d: 'SWE-bench Verified（脚手架依赖 + 数据污染）、ARC-AGI-2（单代 +46pt）、LMArena（格式/长度/谄媚偏好 + 私有变体）。',
            },
            {
              t: '仍在有效区分',
              c: '#34D399',
              n: BENCHMARKS.filter((b) => b.status === 'active').length,
              d: 'ARC-AGI-3（最好 ~41% vs 人类 ~99%）、SWE-bench Pro（~78%）、HLE（~61%）、AA-Omniscience（准确率 ~65%，不弃答幻觉率 ~55%）。',
            },
          ].map((x) => (
            <div key={x.t} className="panel p-4">
              <div className="flex items-baseline gap-2">
                <span className="num font-mono text-3xl font-black" style={{ color: x.c }}>
                  {x.n}
                </span>
                <span className="text-[12.5px] font-semibold text-slate-200">{x.t}</span>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
