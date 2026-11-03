import { useMemo, useState } from 'react';
import { Cpu, Download, Lock } from 'lucide-react';
import { MODELS } from '../data/models';
import { LABS } from '../data/labs';
import { T0, SPAN, toMs, fmtDate, labColor, GPUS, vramGB, clamp } from '../lib/utils';
import { SectionHead } from './Observatory';

const BUCKETS = [
  { id: 'MIT', label: 'MIT', color: '#4ADE80', osi: true },
  { id: 'Apache-2.0', label: 'Apache-2.0', color: '#2DD4BF', osi: true },
  { id: 'custom', label: '自定义（权重可下载）', color: '#FB923C', osi: false },
  { id: 'Llama', label: 'Llama 条款', color: '#FBBF24', osi: false },
  { id: 'Gemma', label: 'Gemma 条款', color: '#FDE68A', osi: false },
  { id: 'proprietary', label: '闭源 API', color: '#64748B', osi: false },
  { id: 'restricted', label: '受限发放', color: '#F87171', osi: false },
];

const MONTHS = Array.from({ length: 23 }, (_, i) => {
  const ms = Date.UTC(2025, i, 1);
  return { ms, iso: new Date(ms).toISOString().slice(0, 10), label: new Date(ms).toISOString().slice(0, 7) };
}).filter((m) => m.ms <= T0 + SPAN);

const OPEN_WEIGHT = MODELS.filter(
  (m) => m.paramsTotal && m.license !== 'proprietary' && m.license !== 'restricted' && m.kind !== 'cancelled',
).sort((a, b) => a.date.localeCompare(b.date));

const QUANTS = [
  { id: 'fp16', label: 'FP16 / BF16', bits: 16, note: '原生精度，质量无损' },
  { id: 'fp8', label: 'FP8', bits: 8, note: '轻微质量损失，H100/H200/B200 原生支持' },
  { id: 'int4', label: 'INT4 (GPTQ/AWQ)', bits: 4, note: '可感知质量损失，长上下文与推理任务上更明显' },
  { id: 'int2', label: 'INT2 极限量化', bits: 2, note: '严重退化，仅用于验证能否加载' },
];

export default function OpenClosed() {
  const w = 940;
  const h = 320;
  const padL = 46;
  const padR = 20;
  const padT = 18;
  const padB = 40;

  /* 累计堆叠 */
  const stacked = useMemo(() => {
    return MONTHS.map((mo) => {
      const row: Record<string, number> = {};
      for (const b of BUCKETS) row[b.id] = 0;
      for (const m of MODELS) {
        if (Date.parse(m.date) <= mo.ms + 30 * 86400000) row[m.license] = (row[m.license] ?? 0) + 1;
      }
      let acc = 0;
      const layers = BUCKETS.map((b) => {
        const y0 = acc;
        acc += row[b.id] ?? 0;
        return { id: b.id, y0, y1: acc, v: row[b.id] ?? 0, color: b.color };
      });
      return { ...mo, total: acc, layers };
    });
  }, []);

  const maxTotal = Math.max(...stacked.map((s) => s.total), 1);
  const X = (i: number) => padL + (i / Math.max(stacked.length - 1, 1)) * (w - padL - padR);
  const Y = (v: number) => h - padB - (v / maxTotal) * (h - padT - padB);

  /* 最大可下载权重规模阶梯 */
  const sizeSteps = useMemo(() => {
    let best = 0;
    return OPEN_WEIGHT.map((m) => {
      if ((m.paramsTotal ?? 0) > best) best = m.paramsTotal ?? 0;
      return { ...m, best };
    }).filter((m, i, arr) => i === 0 || m.best !== arr[i - 1].best);
  }, []);

  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  /* 硬件计算器 */
  const [modelId, setModelId] = useState('kimi-k3');
  const [quant, setQuant] = useState('int4');
  const [ctxK, setCtxK] = useState(32);
  const model = MODELS.find((m) => m.id === modelId) ?? OPEN_WEIGHT[0];
  const q = QUANTS.find((x) => x.id === quant)!;
  const need = model.paramsTotal ? vramGB(model.paramsTotal, q.bits, ctxK * 1000) : 0;

  /* 可行配置：消费级卡与统一内存设备最多单机 8 卡；数据中心卡允许多节点 */
  const configs = useMemo(() => {
    const out: {
      gpu: (typeof GPUS)[number];
      count: number;
      vram: number;
      cost: number;
      tier: '单机' | '多节点集群';
    }[] = [];
    for (const g of GPUS) {
      const datacenter = ['a100', 'h100', 'h200', 'b200', 'mi300x'].includes(g.id);
      const counts = g.id === 'mac' ? [1] : datacenter ? [1, 2, 4, 8, 16, 32, 64, 128, 256] : [1, 2, 4, 8];
      for (const n of counts) {
        // 张量/流水并行的互联开销：可用显存 ≈ 0.9^log2(n)
        const eff = n === 1 ? 1 : Math.pow(0.9, Math.log2(n));
        const total = g.vram * n * eff;
        if (total >= need) {
          out.push({
            gpu: g,
            count: n,
            vram: total,
            cost: g.price * n,
            tier: n > 8 ? '多节点集群' : '单机',
          });
          break;
        }
      }
    }
    return out.sort((a, b) => a.cost - b.cost).slice(0, 6);
  }, [need]);

  return (
    <section id="open" className="relative z-10 border-b border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 06 · THE OPEN / CLOSED SPLIT"
          title="开源与闭源的收敛与分岔"
          desc="「开源 vs 闭源」在 2026 年不是二元问题，而是三个独立维度：权重是否可下载、许可是否 OSI 认证、以及在该许可与硬件预算下是否真的跑得起来。这张图只回答第一个维度，剩下的在下面。"
          accent="#4ADE80"
        />

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_300px]">
          <div className="panel overflow-hidden p-2 sm:p-4">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
              {BUCKETS.filter((b) => !hidden[b.id]).map((b) => {
                const top = stacked
                  .map((s, i) => {
                    const l = s.layers.find((x) => x.id === b.id)!;
                    return `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(l.y1).toFixed(1)}`;
                  })
                  .join(' ');
                const bottom = [...stacked]
                  .reverse()
                  .map((s, ri) => {
                    const i = stacked.length - 1 - ri;
                    const l = s.layers.find((x) => x.id === b.id)!;
                    return `L${X(i).toFixed(1)},${Y(l.y0).toFixed(1)}`;
                  })
                  .join(' ');
                return <path key={b.id} d={`${top} ${bottom} Z`} fill={b.color} opacity={0.42} />;
              })}
              {BUCKETS.filter((b) => !hidden[b.id]).map((b) => (
                <path
                  key={'l' + b.id}
                  d={stacked
                    .map((s, i) => {
                      const l = s.layers.find((x) => x.id === b.id)!;
                      return `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(l.y1).toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke={b.color}
                  strokeWidth={1.4}
                />
              ))}

              {stacked.map((s, i) =>
                i % 3 === 0 ? (
                  <g key={s.iso}>
                    <line x1={X(i)} y1={padT} x2={X(i)} y2={h - padB} stroke="rgba(148,163,184,0.07)" strokeWidth={0.8} />
                    <text x={X(i)} y={h - padB + 15} fill="rgba(148,163,184,0.5)" fontSize={8.5} fontFamily="monospace" textAnchor="middle">
                      {s.label}
                    </text>
                  </g>
                ) : null,
              )}

              {/* 关键事件竖线 */}
              {[
                { d: '2025-06-13', t: 'MSL 成立', c: '#CBD5E1' },
                { d: '2025-08-05', t: 'gpt-oss 开源', c: '#2DD4BF' },
                { d: '2026-04-02', t: 'Gemma 4 → Apache-2.0', c: '#818CF8' },
                { d: '2026-04-07', t: 'Mythos 受限', c: '#F87171' },
                { d: '2026-04-08', t: 'Meta 转闭源', c: '#FBBF24' },
                { d: '2026-07-27', t: 'K3 许可收紧', c: '#FB923C' },
              ].map((e) => {
                const i = stacked.findIndex((s) => s.label === e.d.slice(0, 7));
                if (i < 0) return null;
                return (
                  <g key={e.d}>
                    <line x1={X(i)} y1={padT} x2={X(i)} y2={h - padB} stroke={e.c} strokeWidth={1} strokeDasharray="3 3" opacity={0.55} />
                    <text x={X(i) + 3} y={padT + 9} fill={e.c} fontSize={8} fontFamily="monospace" opacity={0.95}>
                      {e.t}
                    </text>
                  </g>
                );
              })}

              <text x={padL} y={h - 6} fill="rgba(100,116,139,0.7)" fontSize={8.5} fontFamily="monospace">
                累计发布条目数，按许可类型堆叠（含非模型结构事件）
              </text>
            </svg>
          </div>

          <div className="flex flex-col gap-3">
            <div className="panel p-3">
              <div className="font-mono text-[10px] tracking-widest text-slate-500">许可图例（点击隐藏）</div>
              <div className="mt-2 space-y-1">
                {BUCKETS.map((b) => {
                  const n = MODELS.filter((m) => m.license === b.id).length;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setHidden((s) => ({ ...s, [b.id]: !s[b.id] }))}
                      className={`flex w-full items-center gap-2 rounded px-1.5 py-1 text-left transition ${
                        hidden[b.id] ? 'opacity-35' : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: b.color }} />
                      <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">{b.label}</span>
                      <span className="num shrink-0 font-mono text-[10px] text-slate-500">{n}</span>
                      {b.osi && (
                        <span className="shrink-0 rounded bg-emerald-400/15 px-1 font-mono text-[8px] text-emerald-400">
                          OSI
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2.5 border-t border-white/[0.07] pt-2.5 text-[10.5px] leading-relaxed text-slate-500">
                <b className="text-slate-400">OSI 标记很关键：</b>Llama 与早期 Gemma 条款含月活阈值等商用限制，
                不是 OSI 认证的开源许可。2023–2024 年把它们统称「开源模型」是普遍但不准确的用法。
              </p>
            </div>

            <div className="panel p-3">
              <div className="font-mono text-[10px] tracking-widest text-slate-500">
                最大可下载权重的规模（阶梯）
              </div>
              <svg viewBox="0 0 280 96" className="mt-2 h-auto w-full">
                {sizeSteps.map((s, i) => {
                  const x = 26 + (i / Math.max(sizeSteps.length - 1, 1)) * 240;
                  const y = 76 - (Math.log10(s.paramsTotal!) / Math.log10(3000)) * 60;
                  const prev = sizeSteps[i - 1];
                  const px = prev ? 26 + ((i - 1) / Math.max(sizeSteps.length - 1, 1)) * 240 : 26;
                  const py = prev ? 76 - (Math.log10(prev.paramsTotal!) / Math.log10(3000)) * 60 : y;
                  return (
                    <g key={s.id}>
                      {i > 0 && <line x1={px} y1={py} x2={x} y2={py} stroke="#4ADE80" strokeWidth={1.3} opacity={0.6} />}
                      {i > 0 && <line x1={x} y1={py} x2={x} y2={y} stroke="#4ADE80" strokeWidth={1.3} opacity={0.6} />}
                      <circle cx={x} cy={y} r={3} fill={labColor(s.lab)} stroke="#4ADE80" strokeWidth={1} />
                      <text x={x} y={y - 7} fill="rgba(203,213,225,0.85)" fontSize={7.5} fontFamily="monospace" textAnchor="middle">
                        {s.paramsTotal! >= 1000 ? `${(s.paramsTotal! / 1000).toFixed(1)}T` : `${s.paramsTotal}B`}
                      </text>
                      {i === 0 && <line x1={26} y1={y} x2={x} y2={y} stroke="#4ADE80" strokeWidth={1.3} opacity={0.6} />}
                    </g>
                  );
                })}
                <text x={26} y={92} fill="rgba(100,116,139,0.8)" fontSize={7} fontFamily="monospace">
                  2025-01
                </text>
                <text x={266} y={92} fill="rgba(100,116,139,0.8)" fontSize={7} fontFamily="monospace" textAnchor="end">
                  2026-11
                </text>
              </svg>
              <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                从 27B（Gemma 3）到 2.8T（Kimi K3），18 个月放大约 100 倍。
                <b className="text-slate-400">「开源」的可及性在同一段时间里下降了同样多。</b>
              </p>
            </div>
          </div>
        </div>

        {/* 硬件计算器 */}
        <div className="panel mt-4 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/[0.07] bg-emerald-400/[0.05] px-5 py-3">
            <Cpu size={15} className="text-emerald-400" />
            <h3 className="text-[14px] font-bold text-slate-100">本地部署现实检查器</h3>
            <span className="font-mono text-[10px] text-slate-500">
              「开源」的第三个维度：在你的硬件上真的能跑起来吗
            </span>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[320px_1fr]">
            <div className="space-y-3.5">
              <div>
                <label className="text-[11.5px] text-slate-400">选择开源权重模型</label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/12 bg-[#0A0E1A] px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-emerald-400/50"
                >
                  {OPEN_WEIGHT.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.paramsTotal}B 总 / {m.paramsActive ?? '—'}B 激活 · {m.license}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11.5px] text-slate-400">量化精度</label>
                <div className="mt-1.5 grid grid-cols-2 gap-1">
                  {QUANTS.map((qq) => (
                    <button
                      key={qq.id}
                      onClick={() => setQuant(qq.id)}
                      className={`rounded-lg border px-2 py-1.5 text-left transition ${
                        quant === qq.id
                          ? 'border-emerald-400/50 bg-emerald-400/10'
                          : 'border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className={`font-mono text-[10.5px] ${quant === qq.id ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {qq.label}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">{q.note}</p>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-[11.5px] text-slate-400">目标上下文长度</label>
                  <span className="num font-mono text-[12px] font-bold text-emerald-300">{ctxK}K</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={256}
                  step={4}
                  value={ctxK}
                  onChange={(e) => setCtxK(Number(e.target.value))}
                  className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-400"
                />
              </div>

              <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
                <div className="font-mono text-[10px] tracking-widest text-emerald-400">显存需求（估算）</div>
                <div className="num mt-1 font-mono text-3xl font-black text-emerald-200">
                  {need >= 1000 ? `${(need / 1000).toFixed(2)} TB` : `${need.toFixed(0)} GB`}
                </div>
                <div className="mt-1.5 font-mono text-[10px] leading-relaxed text-emerald-200/60">
                  权重 {(model.paramsTotal! * q.bits / 8).toFixed(0)} GB + KV 缓存与运行时开销
                </div>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-widest text-slate-500">
                可行的最低成本配置（含多卡互联效率损失）
              </div>
              <div className="mt-2.5 space-y-1.5">
                {configs.map((c) => (
                  <div
                    key={c.gpu.id}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
                  >
                    <span className="num w-[52px] shrink-0 font-mono text-[16px] font-black text-emerald-400">
                      ×{c.count}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-slate-200">{c.gpu.name}</span>
                        <span
                          className={`rounded px-1 py-px font-mono text-[8.5px] ${
                            c.tier === '单机'
                              ? 'bg-emerald-400/15 text-emerald-400'
                              : 'bg-red-400/15 text-red-400'
                          }`}
                        >
                          {c.tier}
                        </span>
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-500">
                        有效显存 {c.vram >= 1000 ? `${(c.vram / 1000).toFixed(1)} TB` : `${c.vram.toFixed(0)} GB`}
                        （互联折损后）· 需高速互联
                      </span>
                    </span>
                    <span className="num shrink-0 text-right font-mono text-[13px] font-bold text-slate-100">
                      ${c.cost.toLocaleString()}
                    </span>
                  </div>
                ))}
                {configs.length === 0 && (
                  <div className="rounded-lg border border-red-400/25 bg-red-500/[0.06] px-4 py-6 text-center">
                    <Lock size={18} className="mx-auto text-red-400" />
                    <div className="mt-2 text-[13px] font-semibold text-red-200">
                      在 256 张数据中心级 GPU 以内无法加载
                    </div>
                    <div className="mt-1 text-[11.5px] leading-relaxed text-red-200/60">
                      这个模型即使权重可下载，也需要超大规模基础设施。
                      「开源」在此规模上意味着「可审计、可微调、可自建集群部署」，
                      而<b>不是</b>「可本地运行」。
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  { t: '笔记本 / 单张消费卡', d: '≤ 32GB。2026 年末实际上限约 27B 稠密（INT4）或 120B MoE（INT4，5.1B 激活）。', c: '#34D399' },
                  { t: '单机工作站', d: '96–512GB。可跑 230B–550B MoE 的 INT4，或 27B–70B 稠密的 FP8。', c: '#FBBF24' },
                  { t: '多节点集群', d: '>512GB。1T–2.8T 权重在这里，且需要高速互联（NVLink / InfiniBand）。', c: '#F87171' },
                ].map((x) => (
                  <div key={x.t} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                    <div className="text-[11.5px] font-semibold" style={{ color: x.c }}>
                      {x.t}
                    </div>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">{x.d}</p>
                  </div>
                ))}
              </div>

              <p className="mt-3 flex gap-2 text-[11px] leading-relaxed text-slate-500">
                <Download size={13} className="mt-0.5 shrink-0 text-slate-600" />
                <span>
                  <b className="text-slate-400">诚实说明：</b>
                  MoE 模型的显存必须容纳<b className="text-slate-300">全部</b>参数（总参数），而不是激活参数——
                  激活参数只决定计算量与 API 单价，不决定部署门槛。估算含约 1.5 GB 运行时开销与简化的 KV 缓存项，
                  多卡可用显存按 0.9<sup>log₂(n)</sup> 的互联折损粗算（这是一个简化模型，真实值取决于 NVLink / InfiniBand 拓扑与并行策略）。
                  未考虑专家卸载（expert offloading）、分页 KV 缓存或 CPU/内存混合推理等能显著降低门槛的工程手段——
                  实际可行配置可能比这里显示的更省。
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 实验室立场表 */}
        <div className="panel mt-4 overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3 font-mono text-[10px] tracking-widest text-slate-500">
            11 家实验室的许可立场与 2025–2026 年的实际变化
          </div>
          <div className="divide-y divide-white/[0.05]">
            {LABS.map((l) => {
              const ms = MODELS.filter((m) => m.lab === l.id);
              const open = ms.filter((m) => m.license === 'MIT' || m.license === 'Apache-2.0').length;
              const gated = ms.filter((m) => m.license === 'restricted').length;
              const closed = ms.length - open - gated;
              return (
                <div key={l.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
                  <span className="mt-1 h-8 w-1 shrink-0 rounded-full" style={{ background: l.color }} />
                  <div className="min-w-[180px] flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-slate-100">{l.name}</span>
                      <span className="font-mono text-[10px] text-slate-600">
                        {l.flag} {l.country}
                      </span>
                    </div>
                    <p className="mt-1 max-w-3xl text-[11.5px] leading-relaxed text-slate-500">{l.note}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {[
                      { n: open, c: '#4ADE80', l: 'OSI 开源' },
                      { n: closed, c: '#64748B', l: '闭源/条款' },
                      { n: gated, c: '#F87171', l: '受限' },
                    ]
                      .filter((x) => x.n > 0)
                      .map((x) => (
                        <span
                          key={x.l}
                          className="num rounded px-1.5 py-0.5 font-mono text-[9.5px]"
                          style={{ background: x.c + '22', color: x.c }}
                          title={x.l}
                        >
                          {x.n} {x.l}
                        </span>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
