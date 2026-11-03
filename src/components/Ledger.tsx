import { useState } from 'react';
import { Scale, ChevronDown } from 'lucide-react';
import { CRITIQUES, SEVERITY_META } from '../data/critiques';
import { SectionHead } from './Observatory';

export default function Ledger() {
  const [open, setOpen] = useState<string | null>('c1');

  return (
    <section id="ledger" className="relative z-10 border-b border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 07 · THE DISENCHANTMENT LEDGER"
          title="祛魅账本"
          desc="六条对 2025–2026 年行业叙事的系统性核查。每一条的结构是刻意的：流行说法 → 证据 → 反向权重（为什么这个批评本身也可能过头）→ 结论。诚实不是单向的怀疑，而是双向的称重。"
          accent="#F0916B"
        />

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <Scale size={16} className="mt-0.5 shrink-0 text-slate-500" />
          <p className="text-[12px] leading-relaxed text-slate-400">
            这个模块的存在理由：前面六个模块展示的都是<b className="text-slate-200">可测量的进步</b>，
            而任何只展示进步的叙述都是不完整的。但反过来，一个只讲问题的叙述同样是宣传——只是方向相反。
            所以下面每一条都同时列出「证据」与「反向权重」，并明确标出结论的边界。
            <b className="text-slate-200">
              如果你对某一条的结论有异议，请优先检查它的反向权重段落——那通常是分歧真正发生的地方。
            </b>
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          {CRITIQUES.map((c) => {
            const isOpen = open === c.id;
            const sev = SEVERITY_META[c.severity];
            return (
              <article
                key={c.id}
                className="panel overflow-hidden transition-colors"
                style={isOpen ? { borderColor: c.accent + '55' } : undefined}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : c.id)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left"
                  style={isOpen ? { background: `linear-gradient(90deg, ${c.accent}12, transparent 55%)` } : undefined}
                >
                  <span
                    className="num shrink-0 font-mono text-[26px] font-black leading-none"
                    style={{ color: c.accent, opacity: isOpen ? 1 : 0.4 }}
                  >
                    {c.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-bold text-slate-50 sm:text-[17px]">{c.title}</span>
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold"
                        style={{ background: sev.color + '22', color: sev.color }}
                      >
                        {sev.label}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-[12px] italic leading-relaxed text-slate-500">
                      流行说法：{c.claim}
                    </span>
                  </span>
                  <ChevronDown
                    size={17}
                    className={`mt-1 shrink-0 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="grid gap-px border-t border-white/[0.07] bg-white/[0.05] lg:grid-cols-2">
                    <div className="bg-[#0A0E1A] p-5">
                      <div className="font-mono text-[10px] font-semibold tracking-widest" style={{ color: c.accent }}>
                        证据 · WHAT THE RECORD SHOWS
                      </div>
                      <ul className="mt-3 space-y-2.5">
                        {c.evidence.map((e, i) => (
                          <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-300">
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ background: c.accent, boxShadow: `0 0 6px ${c.accent}` }}
                            />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#0A0E1A] p-5">
                      <div className="font-mono text-[10px] font-semibold tracking-widest text-indigo-400">
                        反向权重 · WHY THIS CRITIQUE MAY ALSO OVERREACH
                      </div>
                      <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">{c.counterweight}</p>
                      <div className="mt-4 rounded-lg border-l-2 bg-white/[0.03] p-3.5" style={{ borderColor: c.accent }}>
                        <div className="font-mono text-[9.5px] tracking-widest text-slate-500">结论</div>
                        <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-slate-200">
                          {c.verdict}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
