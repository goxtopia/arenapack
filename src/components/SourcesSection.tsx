import { SOURCES, SOURCE_KIND_META } from '../data/sources';
import { MODELS } from '../data/models';
import { SectionHead } from './Observatory';

export default function SourcesSection() {
  const counts = {
    primary: SOURCES.filter((s) => s.kind === 'primary').length,
    'third-party': SOURCES.filter((s) => s.kind === 'third-party').length,
    critique: SOURCES.filter((s) => s.kind === 'critique').length,
    tracker: SOURCES.filter((s) => s.kind === 'tracker').length,
  };

  return (
    <section id="sources" className="relative z-10 py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 10 · SOURCES & METHODOLOGY"
          title="引用与方法"
          desc="这个页面的一切结论都应可被推翻。下面是它的依据，以及它在哪些地方必然不够好。"
          accent="#94A3B8"
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="panel overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.07] px-5 py-3">
              <span className="font-mono text-[10px] tracking-widest text-slate-500">
                {SOURCES.length} 项来源
              </span>
              {Object.entries(SOURCE_KIND_META).map(([k, v]) => (
                <span key={k} className="font-mono text-[10px]" style={{ color: v.color }}>
                  ● {v.label} {counts[k as keyof typeof counts]}
                </span>
              ))}
            </div>
            <div className="divide-y divide-white/[0.05]">
              {SOURCES.map((s) => {
                const meta = SOURCE_KIND_META[s.kind];
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-start gap-3 px-5 py-2.5 transition hover:bg-white/[0.035]"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] leading-snug text-slate-300 group-hover:text-white">
                        {s.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-600">
                        {s.publisher} · {s.date} ·{' '}
                        <span style={{ color: meta.color }}>{meta.label}</span>
                      </span>
                    </span>
                    <span className="mt-1 shrink-0 font-mono text-[11px] text-slate-700 transition group-hover:text-teal-400">
                      ↗
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="panel p-4">
              <div className="font-mono text-[10px] tracking-widest text-teal-400">方法论</div>
              <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-slate-400">
                {[
                  '数据截止 2026-11-03。此后发生的发布不在本页面范围内。',
                  '发布日期以官方发布说明 / 云平台文档为准，与维基百科及技术媒体交叉核对；不一致时以官方为准并在档案里注明。',
                  '价格为发布时的官方 API 列表价（$/1M tokens），不含批量折扣、prompt 缓存命中折扣、预置容量与订阅折算。',
                  '每一项基准都标注来源：厂商公布（技术报告 / 发布材料）或独立实测（METR、LMArena、学术复现）。',
                  'harness 差异被逐条标注：含工具 / 纯文本、Verified / Pro、beta 上下文、自报未复现。不同 harness 的数字不作横向比较。',
                  '参数量区分「总参数」与「激活参数」；MoE 模型的部署门槛由总参数决定，API 单价由激活参数决定。',
                  '「行业影响权重」是编者判断，用于视觉尺寸，不是能力度量，也不来自厂商声称。',
                ].map((x, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-400/60" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel border-amber-400/20 p-4">
              <div className="font-mono text-[10px] tracking-widest text-amber-400">
                本页面的已知局限（诚实声明）
              </div>
              <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-amber-100/70">
                {[
                  '部分 2026 年的规格、定价与基准来自二手汇编，其一致性无法完全保证。若你发现某条与官方发布材料冲突，请以官方为准。',
                  '基准数字在收录时未逐条重新运行复现——这是任何非实验室性质的汇编都无法做到的。',
                  '「受限发放」档位（Mythos、Carbon、Astra Critical tier、DeepSeek Cyber）的能力描述完全来自厂商，本页面因此不为它们列出第三方基准。',
                  '选择收录哪些条目本身就是编辑判断。未被收录的模型不代表不重要。',
                  '页面结构偏向「叙事」——五幕、账本、对决。叙事必然压缩现实。全量年表模块是对这种压缩的补偿，但它同样不完整。',
                ].map((x, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400/60" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-4">
              <div className="font-mono text-[10px] tracking-widest text-slate-500">数字概览</div>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {[
                  ['652', '天覆盖区间'],
                  [String(MODELS.length), '收录条目'],
                  ['11', '实验室 / 机构'],
                  ['1', '从未发布的模型'],
                  ['5', '受限发放档位'],
                  ['11', '陈列的基准标本'],
                ].map(([n, l]) => (
                  <div key={l} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                    <div className="num font-mono text-[19px] font-black text-slate-100">{n}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mx-auto mt-10 max-w-[1600px] px-4 lg:px-8">
        <div className="hairline" />
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 pb-10">
          <div>
            <div className="font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-400">
              LATENT<span className="text-teal-400">·</span>EPOCH
            </div>
            <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-slate-600">
              语言模型进化实证观测站 · 2025.01.20 — 2026.11.03 · 无厂商赞助 · 无联盟链接 ·
              所有结论均可依据上方来源独立核查或推翻。
            </p>
          </div>
          <a
            href="#top"
            className="rounded-lg border border-white/10 px-3.5 py-2 font-mono text-[10.5px] text-slate-400 transition hover:border-teal-400/40 hover:text-teal-300"
          >
            ↑ 回到顶部
          </a>
        </div>
      </footer>
    </section>
  );
}
