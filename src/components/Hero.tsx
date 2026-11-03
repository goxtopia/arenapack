import { useEffect, useMemo, useRef, useState } from 'react';
import { MODELS, MODELS_SORTED } from '../data/models';
import { METR_POINTS, METR_META } from '../data/metr';
import { fmtDate, labColor, labName } from '../lib/utils';

function useCountUp(target: number, ms = 1600, decimals = 0) {
  const [v, setV] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 4);
      setV(Number((target * e).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, decimals]);
  return v;
}

function Stat({
  value,
  suffix,
  prefix,
  label,
  sub,
  decimals = 0,
  color = '#2DD4BF',
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sub: string;
  decimals?: number;
  color?: string;
}) {
  const v = useCountUp(value, 1800, decimals);
  return (
    <div className="panel panel-hover group px-4 py-4">
      <div
        className="num font-mono text-2xl font-bold leading-none sm:text-3xl"
        style={{ color }}
      >
        {prefix}
        {decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()}
        <span className="text-base font-medium opacity-70">{suffix}</span>
      </div>
      <div className="mt-2 text-[13px] font-medium text-slate-200">{label}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-slate-500">{sub}</div>
    </div>
  );
}

/** 底部滚动条：全部发布事件 */
function Ticker() {
  const items = useMemo(() => MODELS_SORTED, []);
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((m) => (
        <span key={m.id} className="flex items-center gap-2 whitespace-nowrap px-4 py-2">
          <span className="font-mono text-[10px] text-slate-600">{fmtDate(m.date)}</span>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: labColor(m.lab), boxShadow: `0 0 6px ${labColor(m.lab)}` }}
          />
          <span className="text-[11px] text-slate-400">
            <b className="font-mono text-[10px] text-slate-600">{labName(m.lab)}</b> {m.name}
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-[#070A13]/80">
      <div className="ticker-track flex w-max">{[row, row]}</div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#05070E] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#05070E] to-transparent" />
    </div>
  );
}

export default function Hero() {
  const totalModels = MODELS.length;
  const openCount = MODELS.filter((m) => m.license === 'MIT' || m.license === 'Apache-2.0').length;
  const firstHorizon = METR_POINTS[0].minutes;
  const lastReliable = [...METR_POINTS].reverse().find((p) => p.reliable)?.minutes ?? 300;

  return (
    <section id="top" className="relative z-10">
      <div className="mx-auto max-w-[1600px] px-4 pt-14 pb-8 lg:px-8 lg:pt-24">
        <div className="anim-in flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.24em] text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/25 bg-teal-400/[0.07] px-2.5 py-1 text-teal-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
            </span>
            数据截止 2026-11-03
          </span>
          <span className="rounded-full border border-white/10 px-2.5 py-1">
            2025.01.20 — 2026.11.03 · 652 天
          </span>
          <span className="rounded-full border border-white/10 px-2.5 py-1">自研汇编 · 逐条标注来源</span>
        </div>

        <h1 className="anim-in mt-6 text-[13vw] font-black leading-[0.82] tracking-[-0.045em] sm:text-[9vw] lg:text-[7.2vw]">
          <span className="block bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            潜在纪元
          </span>
          <span className="block font-mono text-[4.2vw] font-bold tracking-[-0.02em] text-teal-400/90 sm:text-[3vw] lg:text-[2.3vw]">
            LATENT EPOCH
          </span>
        </h1>

        <p className="anim-in mt-6 max-w-3xl text-[15px] leading-relaxed text-slate-400 sm:text-base">
          2025 年 1 月 20 日，一个中国实验室用 MIT 许可公开了一份强化学习配方，改写了整场竞赛的规则。
          652 天后，三家美国头部实验室都在把自己最强的模型<b className="text-slate-200">扣在公众拿不到的地方</b>，
          而曾经最坚定的开源推动者已经转向闭源。
        </p>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-400 sm:text-base">
          这是一个可交互的实证观测站。它同时记录突破与失信、能力与幻觉、降价与账单膨胀。
          <b className="text-slate-200">每一个数字都标注了「厂商自报」还是「独立实测」</b>——
          因为在 2025–2026 年，这个区分本身就成了理解行业的关键。
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            value={totalModels}
            label="已收录发布事件"
            sub="含 1 项从未发布（Llama 4 Behemoth）、5 项受限发放档位、1 项行业结构事件（MSL 成立）"
            color="#2DD4BF"
          />
          <Stat
            value={openCount}
            label="MIT / Apache-2.0 权重"
            sub={`占 ${Math.round((openCount / totalModels) * 100)}%；但其中最大者 2.8T 参数需多节点集群，与「本地可跑」无关`}
            color="#4ADE80"
          />
          <Stat
            value={lastReliable / firstHorizon}
            decimals={1}
            suffix="×"
            label="METR 自主任务时长（可靠区间）"
            sub={`50 分钟（2025-03）→ 5 小时（2025-12）。2026 年的 12–14.5 小时已超出 METR 声明的可靠测量上限`}
            color="#818CF8"
          />
          <Stat
            value={95}
            suffix="%"
            label="同档智能单价降幅"
            sub="$75/$150（GPT-4.5, 2025-02）→ $1/$5（GPT-6.1 Terra, 2026-10）。但 Agent 化工作流的 token 用量上升 20–100 倍"
            color="#FBBF24"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] text-slate-600">
          <span>
            历史翻倍周期 ≈ {METR_META.doublingDaysHistorical} 天（2019–2023）
          </span>
          <span className="text-slate-700">→</span>
          <span className="text-teal-500">
            ≈ {METR_META.doublingDaysPost2023} 天（2023 后）
          </span>
          <span className="text-slate-700">|</span>
          <span>
            METR 声明 &gt;{METR_META.unreliableAboveMinutes / 60} 小时区间测量不可靠
          </span>
          <span className="text-slate-700">|</span>
          <span>本页面不含任何厂商赞助内容</span>
        </div>

        <div className="mt-10 flex items-center gap-3 text-[11px] text-slate-500">
          <a
            href="#observatory"
            className="group inline-flex items-center gap-2 rounded-lg border border-teal-400/30 bg-teal-400/[0.08] px-4 py-2.5 font-medium text-teal-200 transition hover:bg-teal-400/[0.16]"
          >
            进入星图观测台
            <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          </a>
          <a
            href="#ledger"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-medium text-slate-300 transition hover:border-white/25 hover:bg-white/[0.04]"
          >
            直接看祛魅账本
          </a>
        </div>
      </div>
      <Ticker />
    </section>
  );
}
