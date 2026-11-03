import { useEffect } from 'react';
import { X, ShieldAlert, FlaskConical, Building2, Lock, Unlock, Ban } from 'lucide-react';
import type { ModelEntry } from '../data/types';
import { MODEL_BY_ID } from '../data/models';
import { LAB_BY_ID } from '../data/labs';
import {
  fmtDate,
  fmtParams,
  fmtCtx,
  fmtMinutes,
  labColor,
  LICENSE_META,
  KIND_META,
} from '../lib/utils';

const BENCH_LABELS: { k: keyof NonNullable<ModelEntry['benchmarks']>; label: string; unit: string }[] = [
  { k: 'swebenchVerified', label: 'SWE-bench Verified', unit: '%' },
  { k: 'swebenchPro', label: 'SWE-bench Pro', unit: '%' },
  { k: 'arcagi1', label: 'ARC-AGI-1', unit: '%' },
  { k: 'arcagi2', label: 'ARC-AGI-2', unit: '%' },
  { k: 'arcagi3', label: 'ARC-AGI-3', unit: '%' },
  { k: 'hle', label: "Humanity's Last Exam", unit: '%' },
  { k: 'gpqa', label: 'GPQA Diamond', unit: '%' },
  { k: 'osworld', label: 'OSWorld', unit: '%' },
  { k: 'lmarena', label: 'LMArena Elo', unit: '' },
  { k: 'metrHorizon', label: 'METR 自主任务时长', unit: '' },
];

function SrcBadge({ src }: { src: string }) {
  const ind = src === 'independent';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold ${
        ind ? 'bg-indigo-400/18 text-indigo-300' : 'bg-amber-400/15 text-amber-300'
      }`}
      title={ind ? '来自 METR / LMArena / 学术复现等第三方' : '来自发布方自己的技术报告或发布材料'}
    >
      {ind ? <FlaskConical size={9} /> : <Building2 size={9} />}
      {ind ? '独立实测' : '厂商公布'}
    </span>
  );
}

export default function Dossier({
  model,
  onClose,
  onSelect,
}: {
  model: ModelEntry | null;
  onClose: () => void;
  onSelect: (m: ModelEntry) => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  if (!model) return null;
  const lab = LAB_BY_ID[model.lab];
  const color = labColor(model.lab);
  const lic = LICENSE_META[model.license];
  const kind = KIND_META[model.kind];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col overflow-hidden border-l border-white/10 bg-[#080B15] shadow-2xl"
        style={{ animation: 'fadeUp .32s cubic-bezier(.22,1,.36,1) both' }}
      >
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

        <div className="flex items-start gap-3 border-b border-white/[0.07] px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="inline-flex items-center gap-1.5" style={{ color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                {lab?.name}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-teal-400">{fmtDate(model.date)}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">
                {kind.glyph} {kind.label}
              </span>
            </div>
            <h3 className="mt-1.5 text-xl font-bold leading-tight text-slate-50">{model.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px]"
                style={{ background: lic.color + '1F', color: lic.color }}
              >
                {lic.open ? <Unlock size={10} /> : model.license === 'restricted' ? <Ban size={10} /> : <Lock size={10} />}
                {lic.label}
              </span>
              {model.tags?.map((t) => (
                <span
                  key={t}
                  className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9.5px] text-slate-400"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md border border-white/10 p-1.5 text-slate-500 transition hover:border-white/25 hover:text-slate-200"
          >
            <X size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {model.kind === 'cancelled' && (
            <div className="mb-4 flex gap-2.5 rounded-lg border border-red-400/25 bg-red-500/[0.07] p-3">
              <Ban size={15} className="mt-0.5 shrink-0 text-red-400" />
              <div className="text-[12px] leading-relaxed text-red-200/90">
                <b>该条目从未发布。</b> 它在 2025-04-05 的公开活动上被宣布为「即将推出」，此后没有任何后续。
                收录它是因为「一个被公开承诺却未兑现的模型」本身是这段历史的一部分。
              </div>
            </div>
          )}
          {(model.kind === 'restricted' || model.license === 'restricted') && (
            <div className="mb-4 flex gap-2.5 rounded-lg border border-amber-400/25 bg-amber-500/[0.07] p-3">
              <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amber-400" />
              <div className="text-[12px] leading-relaxed text-amber-200/90">
                <b>受限发放。</b> 公众无法访问该档位。关于其能力的一切描述均来自发布方，
                <b>无法被独立复核</b>——本档案因此不列出任何第三方基准。
              </div>
            </div>
          )}

          <p className="text-[13.5px] leading-relaxed text-slate-300">{model.note}</p>

          {model.detail && (
            <p className="mt-3 border-l-2 pl-3 text-[12.5px] leading-relaxed text-slate-400" style={{ borderColor: color + '66' }}>
              {model.detail}
            </p>
          )}

          {/* 规格 */}
          <div className="mt-5">
            <div className="font-mono text-[10px] tracking-widest text-slate-500">规格</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                ['参数量', fmtParams(model)],
                ['上下文窗口', fmtCtx(model.context)],
                [
                  'API 列表价（$/1M）',
                  model.priceIn !== undefined ? `$${model.priceIn} in / $${model.priceOut} out` : '未公开 / 不适用',
                ],
                ['许可', lic.label],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                  <div className="font-mono text-[9.5px] text-slate-500">{k}</div>
                  <div className="num mt-0.5 text-[12.5px] font-semibold text-slate-200">{v}</div>
                </div>
              ))}
            </div>
            {model.priceIn !== undefined && (
              <div className="mt-2 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-[11px] leading-relaxed text-amber-200/70">
                价格为发布时的官方 API 列表价，不含批量折扣、prompt 缓存命中折扣、预置容量或订阅折算。
                缓存命中在实际生产中通常使有效单价再降 50–90%。
              </div>
            )}
          </div>

          {/* 基准 */}
          <div className="mt-5">
            <div className="font-mono text-[10px] tracking-widest text-slate-500">
              基准成绩 · 逐条标注来源
            </div>
            <div className="mt-2 space-y-1.5">
              {BENCH_LABELS.map(({ k, label, unit }) => {
                const m = model.benchmarks?.[k];
                if (!m) return null;
                const display =
                  k === 'metrHorizon'
                    ? fmtMinutes(m.v)
                    : k === 'lmarena'
                      ? String(m.v)
                      : `${m.v}${unit}`;
                return (
                  <div
                    key={String(k)}
                    className="flex items-start gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-slate-300">{label}</span>
                        <SrcBadge src={m.src} />
                      </div>
                      {m.note && (
                        <div className="mt-0.5 text-[10.5px] leading-snug text-slate-500">
                          harness：{m.note}
                        </div>
                      )}
                    </div>
                    <div className="num shrink-0 font-mono text-[14px] font-bold" style={{ color }}>
                      {display}
                    </div>
                  </div>
                );
              })}
              {!model.benchmarks && (
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-3 text-[11.5px] leading-relaxed text-slate-500">
                  本条目没有可收录的公开基准数据。原因可能是：非模型事件、受限发放、
                  发布方未提供，或第三方尚未测量。<b className="text-slate-400">缺失本身就是数据。</b>
                </div>
              )}
            </div>
          </div>

          {/* 血缘 */}
          {model.lineage && model.lineage.length > 0 && (
            <div className="mt-5">
              <div className="font-mono text-[10px] tracking-widest text-slate-500">上游血缘</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {model.lineage.map((pid) => {
                  const p = MODEL_BY_ID[pid];
                  if (!p) return null;
                  return (
                    <button
                      key={pid}
                      onClick={() => onSelect(p)}
                      className="group flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition"
                      style={{ borderColor: labColor(p.lab) + '40', color: labColor(p.lab) }}
                    >
                      <span className="text-slate-600 group-hover:text-slate-400">↑</span>
                      {p.name}
                      <span className="font-mono text-[9px] text-slate-600">{fmtDate(p.date)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 实验室背景 */}
          {lab && (
            <div className="mt-5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-[12.5px] font-semibold text-slate-200">{lab.name}</span>
                <span className="font-mono text-[10px] text-slate-500">
                  {lab.flag} {lab.country} · {lab.founded} · {lab.stance}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">{lab.note}</p>
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.07] px-5 py-3 font-mono text-[9.5px] leading-relaxed text-slate-600">
          档案编号 {model.id} · 数据来源见页面底部「引用与方法」· 按 Esc 关闭
        </div>
      </aside>
    </>
  );
}
