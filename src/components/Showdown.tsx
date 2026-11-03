import { useMemo, useState } from 'react';
import { Swords, ArrowRight } from 'lucide-react';
import { MODELS } from '../data/models';
import { LAB_BY_ID } from '../data/labs';
import type { ModelEntry } from '../data/types';
import {
  fmtDate,
  fmtParams,
  fmtCtx,
  fmtMinutes,
  labColor,
  LICENSE_META,
  toMs,
} from '../lib/utils';
import { SectionHead } from './Observatory';

const ROWS: {
  k: string;
  label: string;
  get: (m: ModelEntry) => string;
  num?: (m: ModelEntry) => number | null;
  better?: 'high' | 'low';
  hint?: string;
}[] = [
  { k: 'date', label: '发布日期', get: (m) => fmtDate(m.date), num: (m) => toMs(m.date), better: 'high' },
  { k: 'lic', label: '许可', get: (m) => LICENSE_META[m.license].label },
  { k: 'params', label: '参数量', get: fmtParams, hint: 'MoE：激活参数决定 API 单价，总参数决定部署门槛' },
  { k: 'ctx', label: '上下文窗口', get: (m) => fmtCtx(m.context), num: (m) => m.context ?? null, better: 'high', hint: '窗口长度 ≠ 有效利用率' },
  {
    k: 'price',
    label: 'API 列表价 $/1M',
    get: (m) => (m.priceIn !== undefined ? `$${m.priceIn} / $${m.priceOut}` : '—'),
    num: (m) => m.priceIn ?? null,
    better: 'low',
  },
  {
    k: 'sweV',
    label: 'SWE-bench Verified',
    get: (m) => (m.benchmarks?.swebenchVerified ? `${m.benchmarks.swebenchVerified.v}%` : '无数据'),
    num: (m) => m.benchmarks?.swebenchVerified?.v ?? null,
    better: 'high',
    hint: '已接近饱和（85%+）· 高度依赖 agent 脚手架',
  },
  {
    k: 'sweP',
    label: 'SWE-bench Pro',
    get: (m) => (m.benchmarks?.swebenchPro ? `${m.benchmarks.swebenchPro.v}%` : '无数据'),
    num: (m) => m.benchmarks?.swebenchPro?.v ?? null,
    better: 'high',
    hint: '目前编码能力最有区分度的公开基准',
  },
  {
    k: 'arc2',
    label: 'ARC-AGI-2',
    get: (m) => (m.benchmarks?.arcagi2 ? `${m.benchmarks.arcagi2.v}%` : '无数据'),
    num: (m) => m.benchmarks?.arcagi2?.v ?? null,
    better: 'high',
    hint: '2026-09 已被自报至 95%，正失去区分度',
  },
  {
    k: 'arc3',
    label: 'ARC-AGI-3',
    get: (m) => (m.benchmarks?.arcagi3 ? `${m.benchmarks.arcagi3.v}%` : '无数据'),
    num: (m) => m.benchmarks?.arcagi3?.v ?? null,
    better: 'high',
    hint: '交互式基准 · 人类基线 ~99% · 最难被针对性训练',
  },
  {
    k: 'hle',
    label: "Humanity's Last Exam",
    get: (m) =>
      m.benchmarks?.hle
        ? `${m.benchmarks.hle.v}%${m.benchmarks.hle.note?.includes('tools') ? ' ⚙' : ''}`
        : '无数据',
    num: (m) => m.benchmarks?.hle?.v ?? null,
    better: 'high',
    hint: '⚙ = 含工具脚手架。含工具与纯文本可相差 15–25 个百分点，不可直接比较',
  },
  {
    k: 'metr',
    label: 'METR 自主任务时长',
    get: (m) => (m.benchmarks?.metrHorizon ? fmtMinutes(m.benchmarks.metrHorizon.v) : '无独立测量'),
    num: (m) => m.benchmarks?.metrHorizon?.v ?? null,
    better: 'high',
    hint: '唯一独立第三方测量的能力轴 · >16 小时区间不可靠',
  },
  {
    k: 'arena',
    label: 'LMArena Elo',
    get: (m) => (m.benchmarks?.lmarena ? String(m.benchmarks.lmarena.v) : '无数据'),
    num: (m) => m.benchmarks?.lmarena?.v ?? null,
    better: 'high',
    hint: '测「让人满意」而非「正确」· 偏向长回答、Markdown 排版与自信语气',
  },
];

const PRESETS: { label: string; ids: [string, string]; why: string }[] = [
  {
    label: '跨 20 个月：同一实验室的首尾',
    ids: ['claude-3.7-sonnet', 'claude-haiku-5.5'],
    why: '2025-02 的旗舰级推理模型 vs 2026-10 的最低档小模型。后者的编码分数更高，价格是前者的 1/30。这是「档位概念失效」最直接的对照。',
  },
  {
    label: '史上最高价 vs 当前旗舰',
    ids: ['gpt-4.5', 'gpt-6.1-terra'],
    why: 'GPT-4.5（$75/$150，2025-02，四个月后退役）vs GPT-6.1 Terra（$1/$5，2026-10）。75 倍价差，而前者在任何困难基准上都没有可比数据——因为它发布时那些基准还不存在或它根本做不到。',
  },
  {
    label: '闭源旗舰 vs MIT 开源',
    ids: ['claude-opus-4.6', 'deepseek-v4-pro'],
    why: '同期（2026-02 / 2026-04）最强闭源 vs 最强 MIT 开源。SWE-bench Verified 差距 1.4 个百分点，而后者权重可下载。这是「前沿能力必须闭源」这一假设在 2026 年被证伪的对照。',
  },
  {
    label: '饱和基准 vs 有效基准',
    ids: ['gemini-3-pro', 'claude-opus-5'],
    why: 'Gemini 3 Pro 在 GPQA/Arena 登顶而 ARC-AGI-2 只有 31.1%；Claude Opus 5 在 ARC-AGI-3（人类 ~99%）上只有 30.2%。同一个行业，两套完全不同的排名。',
  },
  {
    label: '开源的规模与代价',
    ids: ['gpt-oss-120b', 'kimi-k3'],
    why: '两个都叫「开源权重」：gpt-oss-120b 是 Apache-2.0、5.1B 激活、单张消费卡可跑；Kimi K3 是自定义许可、2.8T 总参数、需要数据中心。同一个词，两种现实。',
  },
  {
    label: '从未发布 vs 已受限',
    ids: ['llama-4-behemoth', 'claude-mythos-5'],
    why: '一个被公开承诺却从未出现的 2T 开源模型，与一个确实存在但公众拿不到的受限模型。两种「不存在」，性质完全不同。',
  },
];

export default function Showdown({ onSelect }: { onSelect: (m: ModelEntry) => void }) {
  const [a, setA] = useState('claude-3.7-sonnet');
  const [b, setB] = useState('claude-haiku-5.5');

  const ma = MODELS.find((m) => m.id === a)!;
  const mb = MODELS.find((m) => m.id === b)!;

  const score = useMemo(() => {
    let wa = 0;
    let wb = 0;
    for (const r of ROWS) {
      if (!r.num || !r.better) continue;
      const va = r.num(ma);
      const vb = r.num(mb);
      if (va === null || vb === null) continue;
      if (va === vb) continue;
      const aWins = r.better === 'high' ? va > vb : va < vb;
      if (aWins) wa++;
      else wb++;
    }
    return { wa, wb };
  }, [ma, mb]);

  const opts = [...MODELS].sort((x, y) => x.date.localeCompare(y.date));

  const Select = ({ value, onChange, accent }: { value: string; onChange: (v: string) => void; accent: string }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border bg-[#0A0E1A] px-3 py-2 text-[12px] text-slate-200 outline-none"
      style={{ borderColor: accent + '55' }}
    >
      {opts.map((m) => (
        <option key={m.id} value={m.id}>
          {fmtDate(m.date)} · {LAB_BY_ID[m.lab]?.short} · {m.name}
        </option>
      ))}
    </select>
  );

  const Card = ({ m, accent }: { m: ModelEntry; accent: string }) => {
    const lab = LAB_BY_ID[m.lab];
    return (
      <button
        onClick={() => onSelect(m)}
        className="panel panel-hover w-full p-4 text-left"
        style={{ borderColor: accent + '44' }}
      >
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 7px ${accent}` }} />
          <span style={{ color: accent }}>{lab?.name}</span>
          <span className="text-slate-600">·</span>
          <span className="text-teal-400">{fmtDate(m.date)}</span>
        </div>
        <div className="mt-1.5 text-[17px] font-bold leading-tight text-slate-50">{m.name}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[9.5px]"
            style={{ background: LICENSE_META[m.license].color + '22', color: LICENSE_META[m.license].color }}
          >
            {LICENSE_META[m.license].label}
          </span>
          {m.tags?.slice(0, 2).map((t) => (
            <span key={t} className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-slate-400">{m.note}</p>
        <div className="mt-2 font-mono text-[9.5px] text-slate-600">点击查看完整档案 →</div>
      </button>
    );
  };

  return (
    <section id="showdown" className="relative z-10 border-b border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 08 · CROSS-GENERATION SHOWDOWN"
          title="跨代对决"
          desc="任意两个条目并排比较。胜负计数只统计有公开可比数据的行——缺失数据不计入任何一方，因为「没有数据」不是「输了」。"
          accent="#F87171"
        />

        <div className="mt-5 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setA(p.ids[0]);
                setB(p.ids[1]);
              }}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-slate-400 transition hover:border-red-400/40 hover:bg-red-400/[0.06] hover:text-slate-200"
            >
              {p.label}
            </button>
          ))}
        </div>

        {(() => {
          const p = PRESETS.find((x) => x.ids[0] === a && x.ids[1] === b);
          return p ? (
            <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-[12px] leading-relaxed text-red-100/75">
              <b className="text-red-300">这组对照为什么有意思：</b>
              {p.why}
            </div>
          ) : null;
        })()}

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_64px_1fr]">
          <div className="space-y-2">
            <Select value={a} onChange={setA} accent={labColor(ma.lab)} />
            <Card m={ma} accent={labColor(ma.lab)} />
          </div>

          <div className="flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0A0E1A]">
              <Swords size={16} className="text-slate-500" />
            </div>
          </div>

          <div className="space-y-2">
            <Select value={b} onChange={setB} accent={labColor(mb.lab)} />
            <Card m={mb} accent={labColor(mb.lab)} />
          </div>
        </div>

        <div className="panel mt-4 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3">
            <span className="font-mono text-[10px] tracking-widest text-slate-500">逐项对比</span>
            <span className="ml-auto flex items-center gap-2 font-mono text-[11px]">
              <span className="rounded px-2 py-0.5" style={{ background: labColor(ma.lab) + '22', color: labColor(ma.lab) }}>
                {ma.name.slice(0, 18)} · {score.wa} 胜
              </span>
              <span className="text-slate-600">vs</span>
              <span className="rounded px-2 py-0.5" style={{ background: labColor(mb.lab) + '22', color: labColor(mb.lab) }}>
                {score.wb} 胜 · {mb.name.slice(0, 18)}
              </span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <tbody>
                {ROWS.map((r) => {
                  const va = r.num?.(ma) ?? null;
                  const vb = r.num?.(mb) ?? null;
                  let winA = false;
                  let winB = false;
                  if (r.better && va !== null && vb !== null && va !== vb) {
                    winA = r.better === 'high' ? va > vb : va < vb;
                    winB = !winA;
                  }
                  const maxV = Math.max(va ?? 0, vb ?? 0, 1);
                  return (
                    <tr key={r.k} className="border-b border-white/[0.04] last:border-0">
                      <td className="w-[210px] px-5 py-2.5 align-middle">
                        <div className="text-[12px] text-slate-300">{r.label}</div>
                        {r.hint && <div className="mt-0.5 text-[9.5px] leading-snug text-slate-600">{r.hint}</div>}
                      </td>
                      <td className="px-3 py-2.5 align-middle" style={{ background: winA ? labColor(ma.lab) + '0F' : undefined }}>
                        <div className="flex items-center gap-2">
                          <span
                            className="num font-mono text-[12.5px] font-bold"
                            style={{ color: winA ? labColor(ma.lab) : '#94A3B8' }}
                          >
                            {r.get(ma)}
                          </span>
                          {va !== null && (
                            <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                              <span
                                className="block h-full rounded-full"
                                style={{ width: `${(va / maxV) * 100}%`, background: labColor(ma.lab) }}
                              />
                            </span>
                          )}
                          {r.k !== 'date' && r.k !== 'lic' && r.k !== 'params' && r.k !== 'price' && (
                            <SrcTag m={ma} k={r.k} />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 align-middle" style={{ background: winB ? labColor(mb.lab) + '0F' : undefined }}>
                        <div className="flex items-center gap-2">
                          {r.k !== 'date' && r.k !== 'lic' && r.k !== 'params' && r.k !== 'price' && <SrcTag m={mb} k={r.k} />}
                          {vb !== null && (
                            <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                              <span
                                className="ml-auto block h-full rounded-full"
                                style={{ width: `${(vb / maxV) * 100}%`, background: labColor(mb.lab) }}
                              />
                            </span>
                          )}
                          <span
                            className="num font-mono text-[12.5px] font-bold"
                            style={{ color: winB ? labColor(mb.lab) : '#94A3B8' }}
                          >
                            {r.get(mb)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/[0.07] px-5 py-3 text-[11px] leading-relaxed text-slate-500">
            <b className="text-slate-400">来源标记：</b>
            <span className="ml-1.5 rounded bg-indigo-400/18 px-1.5 py-0.5 font-mono text-[9px] text-indigo-300">独立</span>
            第三方测量
            <span className="mx-1.5 rounded bg-amber-400/15 px-1.5 py-0.5 font-mono text-[9px] text-amber-300">厂商</span>
            发布方自报。
            <b className="text-slate-400">不同来源、不同 harness 的数字之间不应直接比较</b>——
            胜负计数因此只是粗略指示，不是裁决。
          </div>
        </div>
      </div>
    </section>
  );
}

const BMKEY: Record<string, keyof NonNullable<ModelEntry['benchmarks']>> = {
  sweV: 'swebenchVerified',
  sweP: 'swebenchPro',
  arc2: 'arcagi2',
  arc3: 'arcagi3',
  hle: 'hle',
  metr: 'metrHorizon',
  arena: 'lmarena',
};

function SrcTag({ m, k }: { m: ModelEntry; k: string }) {
  const key = BMKEY[k];
  if (!key) return null;
  const met = m.benchmarks?.[key];
  if (!met) return null;
  const ind = met.src === 'independent';
  return (
    <span
      className={`shrink-0 rounded px-1 py-px font-mono text-[8.5px] font-semibold ${
        ind ? 'bg-indigo-400/18 text-indigo-300' : 'bg-amber-400/15 text-amber-300/90'
      }`}
      title={met.note}
    >
      {ind ? '独立' : '厂商'}
    </span>
  );
}
