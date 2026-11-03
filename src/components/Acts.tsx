import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ACTS } from '../data/acts';
import { MODEL_BY_ID } from '../data/models';
import type { ModelEntry } from '../data/types';
import { fmtDate, labColor, labName } from '../lib/utils';
import { SectionHead } from './Observatory';

export default function Acts({ onSelect }: { onSelect: (m: ModelEntry) => void }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.idx);
            setActive(i);
          }
        }
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    );
    refs.current.forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const act = ACTS[active];

  return (
    <section id="acts" className="relative z-10 border-b border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 02 · FIVE-ACT CHRONICLE"
          title="五幕编年"
          desc="652 天不是一串发布日期，它有结构。每一幕包含：发生了什么、以及这件事最容易被讲错的地方。"
          accent={act.accent}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* 粘性索引 */}
          <div className="lg:sticky lg:top-16 lg:h-fit">
            <div className="panel overflow-hidden">
              <div className="relative h-1.5 w-full bg-white/[0.06]">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{
                    width: `${((active + 1) / ACTS.length) * 100}%`,
                    background: `linear-gradient(90deg, #2DD4BF, ${act.accent})`,
                  }}
                />
              </div>
              <div className="space-y-0.5 p-2">
                {ACTS.map((a, i) => (
                  <a
                    key={a.id}
                    href={`#act-${a.index}`}
                    className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition ${
                      i === active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <span
                      className="mt-0.5 font-mono text-[11px] font-bold transition-colors"
                      style={{ color: i === active ? a.accent : '#475569' }}
                    >
                      {String(a.index).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-[12px] font-medium leading-tight transition-colors ${
                          i === active ? 'text-slate-100' : 'text-slate-500'
                        }`}
                      >
                        {a.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[9.5px] text-slate-600">
                        {a.range[0].slice(0, 7).replace('-', '.')} — {a.range[1].slice(0, 7).replace('-', '.')}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="panel mt-3 p-3">
              <div className="font-mono text-[10px] tracking-widest text-slate-500">本幕关键条目</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {act.keyModels.map((id) => {
                  const m = MODEL_BY_ID[id];
                  if (!m) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => onSelect(m)}
                      className="rounded border px-1.5 py-0.5 font-mono text-[9.5px] transition hover:brightness-125"
                      style={{ borderColor: labColor(m.lab) + '44', color: labColor(m.lab) }}
                    >
                      {m.name.length > 22 ? m.name.slice(0, 21) + '…' : m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 幕内容 */}
          <div className="space-y-16">
            {ACTS.map((a, i) => (
              <article
                key={a.id}
                id={`act-${a.index}`}
                data-idx={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="scroll-mt-20"
              >
                <div className="flex items-baseline gap-4">
                  <span
                    className="font-mono text-[64px] font-black leading-none tracking-tighter opacity-25 sm:text-[86px]"
                    style={{ color: a.accent }}
                  >
                    {String(a.index).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="font-mono text-[10px] font-semibold tracking-[0.2em]" style={{ color: a.accent }}>
                      {a.subtitle}
                    </div>
                    <h3 className="mt-1 text-2xl font-bold leading-tight text-slate-50 sm:text-3xl">
                      {a.title}
                    </h3>
                    <div className="mt-1 font-mono text-[10.5px] text-slate-500">
                      {fmtDate(a.range[0])} → {fmtDate(a.range[1])}
                    </div>
                  </div>
                </div>

                <p
                  className="mt-5 border-l-2 pl-4 text-[15px] font-medium leading-relaxed text-slate-200"
                  style={{ borderColor: a.accent }}
                >
                  {a.thesis}
                </p>

                <ol className="mt-6 space-y-3">
                  {a.whatActuallyHappened.map((w, k) => {
                    const dateMatch = w.match(/^(\d{1,2}-\d{1,2})[,，]/) ?? w.match(/^(\d{4}-\d{2}-\d{2})[,，]/);
                    const stamp = dateMatch ? dateMatch[1] : null;
                    const rest = stamp ? w.slice(dateMatch![0].length).trim() : w;
                    return (
                      <li key={k} className="flex gap-3">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: a.accent, boxShadow: `0 0 8px ${a.accent}` }}
                        />
                        <p className="text-[13.5px] leading-relaxed text-slate-400">
                          {stamp && (
                            <span className="mr-2 font-mono text-[11px] font-semibold text-slate-500">
                              {stamp}
                            </span>
                          )}
                          {rest}
                        </p>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-6 flex gap-3 rounded-xl border border-amber-400/20 bg-amber-500/[0.05] p-4">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <div className="font-mono text-[10px] font-semibold tracking-widest text-amber-400">
                      这一幕最容易被讲错的地方
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-100/75">
                      {a.honestCaveat}
                    </p>
                  </div>
                </div>

                {/* 幕内条目速览 */}
                <div className="mt-5 grid gap-1.5 sm:grid-cols-2">
                  {a.keyModels.map((id) => {
                    const m = MODEL_BY_ID[id];
                    if (!m) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => onSelect(m)}
                        className="group flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.015] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.045]"
                      >
                        <span
                          className="h-6 w-0.5 shrink-0 rounded-full"
                          style={{ background: labColor(m.lab) }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium text-slate-200 group-hover:text-white">
                            {m.name}
                          </span>
                          <span className="mt-0.5 block font-mono text-[9.5px] text-slate-600">
                            {labName(m.lab)} · {fmtDate(m.date)}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-slate-700 transition group-hover:text-teal-400">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
