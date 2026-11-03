import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MODELS } from '../data/models';
import { LABS, LAB_BY_ID } from '../data/labs';
import { ACTS } from '../data/acts';
import type { ModelEntry } from '../data/types';
import {
  T0,
  SPAN,
  tNorm,
  toMs,
  fromNorm,
  monthLabel,
  labColor,
  fmtDate,
  fmtParams,
  fmtCtx,
  fmtMinutes,
  LICENSE_META,
  KIND_META,
  clamp,
} from '../lib/utils';

/* ───────────────────────── Y 轴定义 ───────────────────────── */

type YKey =
  | 'lane'
  | 'swebenchVerified'
  | 'arcagi2'
  | 'hle'
  | 'metrHorizon'
  | 'priceInv'
  | 'context'
  | 'paramsTotal';

interface AxisDef {
  key: YKey;
  label: string;
  short: string;
  domain: [number, number];
  log?: boolean;
  unit: string;
  ticks: { v: number; label: string }[];
  /** 诚实提示：这个轴在测量什么、不测量什么 */
  honesty: string;
  coverage: string;
}

const AXES: AxisDef[] = [
  {
    key: 'lane',
    label: '谱系分道（无能力轴）',
    short: '谱系',
    domain: [0, LABS.length - 1],
    unit: '',
    ticks: LABS.map((l, i) => ({ v: i, label: l.short })),
    honesty:
      '不假设任何能力排序。每个实验室一条独立泳道，只看发布的时间分布与血缘关系。这是最不容易说谎的一张图——因为它什么都不断言。',
    coverage: `${MODELS.length}/${MODELS.length} 条目`,
  },
  {
    key: 'swebenchVerified',
    label: 'SWE-bench Verified（编码）',
    short: 'SWE-V',
    domain: [30, 90],
    unit: '%',
    ticks: [
      { v: 40, label: '40%' },
      { v: 55, label: '55%' },
      { v: 70, label: '70%' },
      { v: 85, label: '85% · 饱和区' },
    ],
    honesty:
      '2025 年最有用、也最快被用坏的基准。分数高度依赖 agent 脚手架（迭代次数、测试反馈回路），同一模型换脚手架可差 10 个百分点以上；题目已进入大量后训练数据池。85% 以上视为饱和。',
    coverage: `${MODELS.filter((m) => m.benchmarks?.swebenchVerified).length}/${MODELS.length} 条目有公开数据`,
  },
  {
    key: 'arcagi2',
    label: 'ARC-AGI-2（抽象推理）',
    short: 'ARC-2',
    domain: [0, 100],
    unit: '%',
    ticks: [
      { v: 20, label: '20%' },
      { v: 50, label: '50%' },
      { v: 77, label: '77%' },
      { v: 95, label: '95% · 失去区分度' },
    ],
    honesty:
      '2025 年初最好成绩约 5%，2026-09 被自报至 95%。Gemini 3 Pro → 3.1 Pro 单代 +46 个百分点是整个时间线上最受争议的跳跃。它正在重演 ARC-AGI-1 的死亡路径，只是慢了一年。',
    coverage: `${MODELS.filter((m) => m.benchmarks?.arcagi2).length}/${MODELS.length} 条目有公开数据`,
  },
  {
    key: 'hle',
    label: "Humanity's Last Exam（极难知识）",
    short: 'HLE',
    domain: [15, 65],
    unit: '%',
    ticks: [
      { v: 20, label: '20%' },
      { v: 35, label: '35%' },
      { v: 50, label: '50%' },
      { v: 61, label: '61%' },
    ],
    honesty:
      '目前仍有区分度，但「含工具」与「纯文本」可相差 15–25 个百分点，厂商并不总标注清楚。本观测站的每个 HLE 数字都在悬停详情里注明 harness。',
    coverage: `${MODELS.filter((m) => m.benchmarks?.hle).length}/${MODELS.length} 条目有公开数据`,
  },
  {
    key: 'metrHorizon',
    label: 'METR 自主任务时长（对数）',
    short: 'METR',
    domain: [30, 1200],
    log: true,
    unit: '',
    ticks: [
      { v: 50, label: '50 分' },
      { v: 120, label: '2 小时' },
      { v: 300, label: '5 小时' },
      { v: 960, label: '16 小时 · 测量上限' },
    ],
    honesty:
      '唯一由独立第三方（METR）在受控条件下测得的能力轴，也是过去两年最有意义的单一指标。但 2026 年的 12–14.5 小时已超出 METR 声明的可靠区间（>16 小时噪声过大），且失败主因已从「能力不足」变为「长上下文自我条件化错误累积」。',
    coverage: `${MODELS.filter((m) => m.benchmarks?.metrHorizon).length}/${MODELS.length} 条目有独立测量`,
  },
  {
    key: 'priceInv',
    label: '输入单价倒数（对数 · 越高越便宜）',
    short: '性价比',
    domain: [1 / 80, 1 / 0.1],
    log: true,
    unit: '',
    ticks: [
      { v: 1 / 75, label: '$75/M' },
      { v: 1 / 10, label: '$10/M' },
      { v: 1 / 2, label: '$2/M' },
      { v: 1 / 0.1, label: '$0.10/M' },
    ],
    honesty:
      '这是「智能价格战」轴：越往上越便宜。注意它不含批量折扣、缓存命中折扣与预置容量；且单价下降 ≠ 账单下降——Agent 化工作流的单任务 token 消耗上升了 20–100 倍。',
    coverage: `${MODELS.filter((m) => m.priceIn !== undefined).length}/${MODELS.length} 条目有公开列表价`,
  },
  {
    key: 'context',
    label: '上下文窗口（对数）',
    short: '上下文',
    domain: [100_000, 10_000_000],
    log: true,
    unit: '',
    ticks: [
      { v: 128_000, label: '128K' },
      { v: 400_000, label: '400K' },
      { v: 1_000_000, label: '1M' },
      { v: 10_000_000, label: '10M（宣称）' },
    ],
    honesty:
      '窗口长度 ≠ 有效利用率。Llama 4 Scout 宣称 10M token，实测有效召回远低于窗口长度；Grok 4.1 的 2M 同理。长上下文在 2026 年仍是未解决问题——METR 指出的「自我条件化错误累积」正是长上下文失败模式。',
    coverage: `${MODELS.filter((m) => m.context).length}/${MODELS.length} 条目`,
  },
  {
    key: 'paramsTotal',
    label: '总参数量（对数）',
    short: '参数',
    domain: [20, 3000],
    log: true,
    unit: '',
    ticks: [
      { v: 30, label: '30B' },
      { v: 250, label: '250B' },
      { v: 1000, label: '1T' },
      { v: 2800, label: '2.8T' },
    ],
    honesty:
      'MoE 时代，总参数与推理成本已经解耦：激活参数（8B–104B）决定 API 单价，总参数（552B–2.8T）决定权重体积与自托管门槛。这两个成本落在不同的人身上。悬停查看「激活 / 总」拆分。',
    coverage: `${MODELS.filter((m) => m.paramsTotal).length}/${MODELS.length} 条目披露参数`,
  },
];

const AXIS_BY_KEY = Object.fromEntries(AXES.map((a) => [a.key, a])) as Record<YKey, AxisDef>;

function rawValue(m: ModelEntry, key: YKey): number | null {
  switch (key) {
    case 'lane': {
      const i = LABS.findIndex((l) => l.id === m.lab);
      return i < 0 ? null : i;
    }
    case 'swebenchVerified':
      return m.benchmarks?.swebenchVerified?.v ?? null;
    case 'arcagi2':
      return m.benchmarks?.arcagi2?.v ?? null;
    case 'hle':
      return m.benchmarks?.hle?.v ?? null;
    case 'metrHorizon':
      return m.benchmarks?.metrHorizon?.v ?? null;
    case 'priceInv':
      return m.priceIn ? 1 / m.priceIn : null;
    case 'context':
      return m.context ?? null;
    case 'paramsTotal':
      return m.paramsTotal ?? null;
  }
}

function normalized(v: number, axis: AxisDef): number {
  const [lo, hi] = axis.domain;
  if (axis.log) {
    const l = Math.log10(Math.max(v, lo));
    return clamp((l - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)), 0, 1);
  }
  return clamp((v - lo) / (hi - lo), 0, 1);
}

/* ───────────────────────── 主组件 ───────────────────────── */

const LAB_IDS = LABS.map((l) => l.id);
type LicFilter = 'all' | 'open' | 'closed' | 'gated';

/** 来源徽章：区分「厂商公布」与「独立实测」 */
function SrcPill({ model, axisKey }: { model: ModelEntry; axisKey: YKey }) {
  const key = axisKey as keyof NonNullable<ModelEntry['benchmarks']>;
  const met = model.benchmarks?.[key];
  const src = met?.src ?? (axisKey === 'priceInv' || axisKey === 'context' || axisKey === 'paramsTotal' ? 'vendor' : undefined);
  if (!src) return null;
  const ind = src === 'independent';
  return (
    <span
      className={`ml-1.5 rounded px-1 py-px text-[9px] ${
        ind ? 'bg-indigo-400/20 text-indigo-300' : 'bg-amber-400/15 text-amber-300/90'
      }`}
      title={met?.note}
    >
      {ind ? '独立实测' : '厂商公布'}
    </span>
  );
}


function licBucket(m: ModelEntry): LicFilter {
  if (m.license === 'MIT' || m.license === 'Apache-2.0') return 'open';
  if (m.license === 'restricted' || m.kind === 'restricted') return 'gated';
  return 'closed';
}

interface Placed {
  m: ModelEntry;
  x: number;
  y: number;
  r: number;
  depth: number;
  alpha: number;
  born: number;
  hasData: boolean;
  color: string;
}

export default function Observatory({
  onSelect,
  selectedId,
}: {
  onSelect: (m: ModelEntry) => void;
  selectedId: string | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const placedRef = useRef<Placed[]>([]);

  const [axisKey, setAxisKey] = useState<YKey>('lane');
  const [t, setT] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [labs, setLabs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LAB_IDS.map((id) => [id, true])),
  );
  const [lic, setLic] = useState<LicFilter>('all');
  const [showLines, setShowLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showGhosts, setShowGhosts] = useState(true);
  const [hover, setHover] = useState<{ m: ModelEntry; x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 1200, h: 620 });

  const axis = AXIS_BY_KEY[axisKey];

  /* 尺寸 */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = Math.round(clamp(window.innerHeight * 0.66, 460, 760));
      setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* 影院模式 */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        const next = prev + dt * 0.021 * speed;
        return next > 1.02 ? 0 : next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  /* 键盘快捷键：仅当观测台在视口内时生效，避免劫持页面滚动 */
  const sectionRef = useRef<HTMLElement>(null);
  const inViewRef = useRef(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inViewRef.current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setPlaying((p) => {
          if (!p && t >= 1) setT(0);
          return !p;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPlaying(false);
        setT((v) => clamp(v + (e.shiftKey ? 0.05 : 0.008), 0, 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPlaying(false);
        setT((v) => clamp(v - (e.shiftKey ? 0.05 : 0.008), 0, 1));
      } else if (e.key === 'Home') {
        setPlaying(false);
        setT(0);
      } else if (e.key === 'End') {
        setPlaying(false);
        setT(1);
      } else if (/^[1-8]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (AXES[idx]) setAxisKey(AXES[idx].key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [t]);

  const visible = useMemo(
    () =>
      MODELS.filter(
        (m) => labs[m.lab] && (lic === 'all' || licBucket(m) === lic),
      ),
    [labs, lic],
  );

  /* ── 绘制 ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = size;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const padL = w < 720 ? 46 : 78;
    const padR = w < 720 ? 18 : 46;
    const padT = 56;
    const padB = 96; // 底部预留 scrubber 控件条高度，避免遮挡刻度
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const X = (n: number) => padL + n * plotW;
    const Y = (nv: number) => padT + (1 - nv) * plotH;

    /* 背景：透视地板 */
    ctx.save();
    ctx.strokeStyle = 'rgba(148,163,184,0.045)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 9; i++) {
      const p = i / 9;
      const y = padT + plotH * Math.pow(p, 1.55);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
    }
    ctx.restore();

    /* 幕区间色带 */
    for (const act of ACTS) {
      const a = tNorm(act.range[0]);
      const b = tNorm(act.range[1]);
      const revealed = clamp((t - a) / Math.max(b - a, 1e-6), 0, 1);
      if (revealed <= 0) continue;
      const grad = ctx.createLinearGradient(X(a), 0, X(b), 0);
      grad.addColorStop(0, act.accent + '00');
      grad.addColorStop(0.5, act.accent + '0E');
      grad.addColorStop(1, act.accent + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(X(a), padT, (X(b) - X(a)) * revealed, plotH);
      if (w > 900) {
        ctx.fillStyle = act.accent + 'AA';
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.5 * revealed;
        ctx.fillText(
          `ACT ${act.index} · ${act.title.slice(0, 12)}`,
          (X(a) + X(b)) / 2,
          17,
        );
        ctx.globalAlpha = 1;
      }
    }

    /* 时间刻度 */
    ctx.strokeStyle = 'rgba(148,163,184,0.09)';
    ctx.fillStyle = 'rgba(148,163,184,0.55)';
    ctx.font = '500 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let mo = 0; mo <= 22; mo++) {
      const ms = Date.UTC(2025, mo, 1);
      if (ms > T0 + SPAN) break;
      const n = (ms - T0) / SPAN;
      const x = X(n);
      const major = new Date(ms).getUTCMonth() % 3 === 0;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.strokeStyle = major ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.04)';
      ctx.stroke();
      if (major) {
        ctx.fillStyle = n <= t ? 'rgba(203,213,225,0.75)' : 'rgba(100,116,139,0.4)';
        ctx.fillText(monthLabel(n), x, h - padB + 16);
      }
    }

    /* Y 轴刻度 */
    ctx.textAlign = 'right';
    ctx.font = '500 9.5px "JetBrains Mono", monospace';
    for (const tk of axis.ticks) {
      const nv = normalized(tk.v, axis);
      const y = Y(axis.key === 'lane' ? 1 - nv : nv);
      ctx.strokeStyle = 'rgba(148,163,184,0.07)';
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.fillText(tk.label, padL - 8, y + 3);
    }
    if (axis.key === 'lane') {
      for (let i = 0; i < LABS.length; i++) {
        const y = Y(1 - i / Math.max(LABS.length - 1, 1));
        const l = LABS[i];
        if (!labs[l.id]) continue;
        ctx.fillStyle = l.color + '0A';
        ctx.fillRect(padL, y - plotH / LABS.length / 2, plotW, plotH / LABS.length);
      }
    }

    /* 布局节点 */
    const placed: Placed[] = [];
    for (const m of visible) {
      const n = tNorm(m.date);
      const raw = rawValue(m, axis.key);
      const hasData = raw !== null && raw !== undefined;
      let nv = hasData ? normalized(raw as number, axis) : 0;
      if (axis.key === 'lane') nv = 1 - nv;
      const depth = LAB_IDS.indexOf(m.lab) / Math.max(LAB_IDS.length - 1, 1);
      // 确定性抖动，避免完全重叠
      let hash = 0;
      for (let i = 0; i < m.id.length; i++) hash = (hash * 31 + m.id.charCodeAt(i)) % 1000;
      const jx = ((hash % 37) / 37 - 0.5) * 10 * (0.4 + depth);
      const jy = (((hash * 7) % 41) / 41 - 0.5) * 12 * (0.4 + depth);

      const x = X(n) + jx;
      const yBase = hasData ? Y(nv) : padT + plotH + 42;
      const y = yBase + (hasData ? jy : 0);

      const bornRaw = (t - n) / 0.028;
      const born = clamp(bornRaw, 0, 1);
      const future = t < n;
      const wz = m.weight ?? 0.5;
      const r = (2.2 + wz * 6.2) * (0.68 + 0.32 * (1 - depth));

      let alpha = future ? 0.07 : 0.28 + 0.72 * (1 - depth * 0.55);
      alpha *= future ? 1 : born;

      placed.push({
        m,
        x,
        y,
        r,
        depth,
        alpha,
        born,
        hasData,
        color: labColor(m.lab),
      });
    }
    placed.sort((a, b) => a.depth - b.depth);
    placedRef.current = placed;

    const byId = new Map(placed.map((p) => [p.m.id, p]));

    /* 血缘连线 */
    if (showLines) {
      for (const p of placed) {
        if (!p.m.lineage) continue;
        for (const pid of p.m.lineage) {
          const parent = byId.get(pid);
          if (!parent) continue;
          const prog = clamp((t - tNorm(p.m.date)) / 0.03, 0, 1);
          if (prog <= 0) continue;
          const mx = (parent.x + p.x) / 2;
          const my = Math.min(parent.y, p.y) - Math.abs(p.x - parent.x) * 0.16 - 14;
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          ctx.quadraticCurveTo(mx, my, parent.x + (p.x - parent.x) * prog, parent.y + (p.y - parent.y) * prog);
          const g = ctx.createLinearGradient(parent.x, parent.y, p.x, p.y);
          g.addColorStop(0, parent.color + '44');
          g.addColorStop(1, p.color + '88');
          ctx.strokeStyle = g;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = 0.55 * prog;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    /* 节点 */
    const now = performance.now();
    for (const p of placed) {
      const future = t < tNorm(p.m.date);
      const isSel = selectedId === p.m.id;
      const isHov = hover?.m.id === p.m.id;

      // 诞生冲击波
      if (!future && p.born < 1 && p.born > 0) {
        const rr = p.r + (1 - p.born) * 42;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = (1 - p.born) * 0.5;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (future) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100,116,139,0.28)';
        ctx.setLineDash([1.5, 2]);
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.setLineDash([]);
        continue;
      }

      if (!p.hasData) {
        if (!showGhosts) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.9, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = 0.32 * p.alpha;
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.globalAlpha = 1;
        continue;
      }

      const pulse = 0.5 + 0.5 * Math.sin(now / 900 + p.x * 0.02);

      // 光晕
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.5);
      glow.addColorStop(0, p.color + (isSel || isHov ? '70' : '38'));
      glow.addColorStop(1, p.color + '00');
      ctx.fillStyle = glow;
      ctx.globalAlpha = p.alpha * (0.65 + 0.35 * pulse);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // 核心
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.6 + 0.4 * p.born), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      // 受限 / 取消 标记
      if (p.m.kind === 'restricted' || p.m.kind === 'cancelled') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = p.m.kind === 'cancelled' ? '#F87171' : '#FBBF24';
        ctx.setLineDash([2, 2.5]);
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      if (isSel || isHov) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // 标签
      const important = (p.m.weight ?? 0) >= 0.78;
      const recent = t - tNorm(p.m.date) < 0.05 && t - tNorm(p.m.date) > 0;
      if (showLabels && (important || recent || isSel || isHov) && p.born > 0.7) {
        ctx.font = `${isSel || isHov ? '600' : '500'} ${isSel || isHov ? 10.5 : 9.5}px "JetBrains Mono", ui-monospace, monospace`;
        ctx.textAlign = 'left';
        const label = p.m.name;
        const tw = ctx.measureText(label).width;
        const lx = p.x + p.r + 6;
        const ly = p.y + 3;
        ctx.fillStyle = 'rgba(5,7,14,0.72)';
        ctx.fillRect(lx - 3, ly - 9, tw + 6, 12.5);
        ctx.fillStyle = isSel || isHov ? '#F8FAFC' : 'rgba(203,213,225,0.82)';
        ctx.fillText(label, lx, ly);
      }
    }

    /* 播放头 */
    const px = X(clamp(t, 0, 1));
    const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, 'rgba(45,212,191,0)');
    grad.addColorStop(0.15, 'rgba(45,212,191,0.75)');
    grad.addColorStop(1, 'rgba(45,212,191,0.08)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px, padT - 6);
    ctx.lineTo(px, padT + plotH + 20);
    ctx.stroke();

    // 已揭示区域外的遮罩
    ctx.fillStyle = 'rgba(5,7,14,0.62)';
    ctx.fillRect(px, padT - 6, w - padR - px, plotH + 34);

    // 播放头日期牌
    const dateStr = fmtDate(fromNorm(clamp(t, 0, 1)));
    ctx.font = '700 11px "JetBrains Mono", monospace';
    const tw = ctx.measureText(dateStr).width;
    ctx.fillStyle = '#2DD4BF';
    const bx = clamp(px - tw / 2 - 7, padL - 30, w - padR - tw - 16);
    ctx.beginPath();
    ctx.roundRect(bx, padT - 30, tw + 14, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#04211D';
    ctx.textAlign = 'left';
    ctx.fillText(dateStr, bx + 7, padT - 17);

  }, [size, visible, axis, t, showLines, showLabels, showGhosts, labs, selectedId, hover]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  /* 交互 */
  const pick = (cx: number, cy: number) => {
    let best: Placed | null = null;
    let bd = 18 * 18;
    for (const p of placedRef.current) {
      if (t < tNorm(p.m.date)) continue;
      const d = (p.x - cx) ** 2 + (p.y - cy) ** 2;
      const rr = Math.max(bd, (p.r + 7) ** 2);
      if (d < rr && d < bd) {
        bd = d;
        best = p;
      }
    }
    return best;
  };

  const onMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const p = pick(cx, cy);
    setHover(p ? { m: p.m, x: cx, y: cy } : null);
  };

  const onScrub = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const padL = size.w < 720 ? 46 : 78;
    const padR = size.w < 720 ? 18 : 46;
    const plotW = size.w - padL - padR;
    const n = clamp((e.clientX - rect.left - padL) / plotW, 0, 1);
    setT(n);
    setPlaying(false);
  };

  const axis2 = axis;

  return (
    <section
      id="observatory"
      ref={sectionRef}
      className="relative z-10 border-b border-white/[0.06] py-12"
    >
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 01 · PHYLOGENETIC OBSERVATORY"
          title="星图观测台"
          desc="横轴是时间（2025-01 → 2026-11），纵轴由你选择。每个光点是一次发布，光晕大小代表行业影响权重，连线代表血缘。拖动播放头或开启影院模式看它生长。"
        />

        {/* Y 轴选择 */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[10px] tracking-widest text-slate-600">Y 轴 =</span>
          {AXES.map((a, i) => (
            <button
              key={a.key}
              onClick={() => setAxisKey(a.key)}
              title={`快捷键 ${i + 1}`}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-[10.5px] transition ${
                axisKey === a.key
                  ? 'border-teal-400/50 bg-teal-400/15 text-teal-200'
                  : 'border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300'
              }`}
            >
              <span className="mr-1 opacity-45">{i + 1}</span>
              {a.short}
            </button>
          ))}
          <span className="ml-auto hidden font-mono text-[9.5px] text-slate-600 lg:block">
            空格 / P 影院模式 · ← → 步进（Shift 加速）· Home/End 首尾 · 1–8 换轴
          </span>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_320px]">
          <div
            ref={wrapRef}
            className="panel scanline relative overflow-hidden rounded-xl bg-[#070A13]"
          >
            <canvas
              ref={canvasRef}
              className="block cursor-crosshair"
              onMouseMove={onMove}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => {
                const rect = canvasRef.current!.getBoundingClientRect();
                const p = pick(e.clientX - rect.left, e.clientY - rect.top);
                if (p) onSelect(p.m);
                else onScrub(e);
              }}
            />

            {/* 悬浮卡 */}
            {hover && (
              <div
                className="pointer-events-none absolute z-20 w-[268px] rounded-lg border border-white/15 bg-[#0A0E1A]/96 p-3 shadow-2xl backdrop-blur"
                style={{
                  left: clamp(hover.x + 16, 8, size.w - 280),
                  top: clamp(hover.y - 20, 8, size.h - 190),
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: labColor(hover.m.lab), boxShadow: `0 0 8px ${labColor(hover.m.lab)}` }}
                  />
                  <span className="font-mono text-[10px] text-slate-500">
                    {LAB_BY_ID[hover.m.lab]?.name}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-teal-400">
                    {fmtDate(hover.m.date)}
                  </span>
                </div>
                <div className="mt-1.5 text-[13px] font-semibold leading-tight text-slate-100">
                  {hover.m.name}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px] text-slate-400">
                  <span>参数 {fmtParams(hover.m)}</span>
                  <span>上下文 {fmtCtx(hover.m.context)}</span>
                  <span>
                    价格{' '}
                    {hover.m.priceIn !== undefined
                      ? `$${hover.m.priceIn}/$${hover.m.priceOut}`
                      : '—'}
                  </span>
                  <span style={{ color: LICENSE_META[hover.m.license].color }}>
                    {LICENSE_META[hover.m.license].label}
                  </span>
                </div>
                {axis2.key !== 'lane' && rawValue(hover.m, axis2.key) !== null && (
                  <div className="mt-2 border-t border-white/10 pt-2 font-mono text-[10px]">
                    <span className="text-slate-500">{axis2.short}: </span>
                    <span className="text-slate-100">
                      {axis2.key === 'metrHorizon'
                        ? fmtMinutes(rawValue(hover.m, axis2.key)!)
                        : axis2.key === 'priceInv'
                          ? `$${hover.m.priceIn}/M in`
                          : axis2.key === 'context'
                            ? fmtCtx(hover.m.context)
                            : axis2.key === 'paramsTotal'
                              ? fmtParams(hover.m)
                              : `${rawValue(hover.m, axis2.key)}%`}
                    </span>
                    <SrcPill model={hover.m} axisKey={axis2.key} />
                  </div>
                )}
                <div className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
                  点击查看完整档案 →
                </div>
              </div>
            )}

            {/* 时间轴 scrubber */}
            <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.07] bg-[#070A13]/92 px-3 py-2 backdrop-blur">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (playing) setPlaying(false);
                    else {
                      if (t >= 1) setT(0);
                      setPlaying(true);
                    }
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-teal-400/40 bg-teal-400/10 text-teal-300 transition hover:bg-teal-400/20"
                  title={playing ? '暂停' : '影院模式'}
                >
                  {playing ? (
                    <span className="text-[10px]">❚❚</span>
                  ) : (
                    <span className="ml-0.5 text-[10px]">▶</span>
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.0005}
                  value={clamp(t, 0, 1)}
                  onChange={(e) => {
                    setPlaying(false);
                    setT(Number(e.target.value));
                  }}
                  className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-teal-400"
                />
                <span className="num shrink-0 font-mono text-[11px] font-semibold text-teal-300">
                  {fmtDate(fromNorm(clamp(t, 0, 1)))}
                </span>
                <div className="hidden shrink-0 items-center gap-1 sm:flex">
                  {[0.5, 1, 2.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`rounded px-1.5 py-0.5 font-mono text-[9.5px] transition ${
                        speed === s
                          ? 'bg-white/12 text-slate-200'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setPlaying(false);
                    setT(1);
                  }}
                  className="shrink-0 rounded border border-white/10 px-2 py-1 font-mono text-[9.5px] text-slate-400 transition hover:border-white/25 hover:text-slate-200"
                >
                  跳至今日
                </button>
              </div>
            </div>
          </div>

          {/* 侧栏 */}
          <div className="flex flex-col gap-3">
            <div className="panel p-3">
              <div className="font-mono text-[10px] tracking-widest text-slate-500">
                当前 Y 轴 · 诚实说明
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-slate-100">{axis.label}</div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate-400">{axis.honesty}</p>
              <div className="mt-2 font-mono text-[10px] text-slate-600">覆盖率 {axis.coverage}</div>
            </div>

            <div className="panel p-3">
              <div className="mb-2 font-mono text-[10px] tracking-widest text-slate-500">实验室</div>
              <div className="flex flex-wrap gap-1">
                {LABS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLabs((s) => ({ ...s, [l.id]: !s[l.id] }))}
                    className="group flex items-center gap-1.5 rounded border px-1.5 py-1 font-mono text-[9.5px] transition"
                    style={{
                      borderColor: labs[l.id] ? l.color + '55' : 'rgba(255,255,255,0.08)',
                      background: labs[l.id] ? l.color + '14' : 'transparent',
                      color: labs[l.id] ? l.color : '#475569',
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: labs[l.id] ? l.color : '#334155' }}
                    />
                    {l.short}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                <button
                  onClick={() => setLabs(Object.fromEntries(LAB_IDS.map((i) => [i, true])))}
                  className="flex-1 rounded border border-white/10 py-1 font-mono text-[9.5px] text-slate-500 hover:text-slate-300"
                >
                  全选
                </button>
                <button
                  onClick={() =>
                    setLabs(
                      Object.fromEntries(
                        LAB_IDS.map((i) => [i, ['openai', 'anthropic', 'google'].includes(i)]),
                      ),
                    )
                  }
                  className="flex-1 rounded border border-white/10 py-1 font-mono text-[9.5px] text-slate-500 hover:text-slate-300"
                >
                  仅美国三强
                </button>
                <button
                  onClick={() =>
                    setLabs(
                      Object.fromEntries(
                        LAB_IDS.map((i) => [
                          i,
                          ['deepseek', 'qwen', 'moonshot', 'zhipu', 'minimax'].includes(i),
                        ]),
                      ),
                    )
                  }
                  className="flex-1 rounded border border-white/10 py-1 font-mono text-[9.5px] text-slate-500 hover:text-slate-300"
                >
                  仅中国
                </button>
              </div>
            </div>

            <div className="panel p-3">
              <div className="mb-2 font-mono text-[10px] tracking-widest text-slate-500">许可</div>
              <div className="grid grid-cols-2 gap-1">
                {(
                  [
                    ['all', '全部'],
                    ['open', 'MIT / Apache'],
                    ['closed', '闭源 API'],
                    ['gated', '受限发放'],
                  ] as [LicFilter, string][]
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setLic(k)}
                    className={`rounded border px-2 py-1 text-[10.5px] transition ${
                      lic === k
                        ? 'border-teal-400/50 bg-teal-400/12 text-teal-200'
                        : 'border-white/10 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-1.5">
                {(
                  [
                    ['showLines', '血缘连线', showLines, setShowLines],
                    ['showLabels', '名称标签', showLabels, setShowLabels],
                    ['showGhosts', '无数据缺口', showGhosts, setShowGhosts],
                  ] as const
                ).map(([k, label, v, set]) => (
                  <button
                    key={k}
                    onClick={() => set(!v)}
                    className="flex w-full items-center justify-between rounded px-1 py-0.5 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    <span>{label}</span>
                    <span
                      className={`relative h-3.5 w-7 rounded-full transition ${
                        v ? 'bg-teal-400/70' : 'bg-white/12'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${
                          v ? 'left-4' : 'left-0.5'
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel p-3">
              <div className="mb-2 font-mono text-[10px] tracking-widest text-slate-500">图例</div>
              <div className="space-y-1.5 font-mono text-[10px] text-slate-500">
                {Object.entries(KIND_META).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-4 text-center text-slate-400">{v.glyph}</span>
                    <span>{v.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>光晕大小 = 行业影响权重（编者判断，非厂商声称）</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-px w-4 bg-gradient-to-r from-slate-500 to-transparent" />
                  <span>纵深 = 实验室泳道前后层次</span>
                </div>
                {axisKey !== 'lane' && (
                  <div className="flex items-center gap-2 border-t border-white/[0.07] pt-1.5 text-amber-500/80">
                    <span className="text-[11px] leading-none">○</span>
                    <span>
                      绘图区下方的空心点带 = 该指标<b className="text-amber-400">无公开数据</b>。
                      这是刻意保留的诚实缺口，不是渲染失败。
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 max-w-4xl text-[11px] leading-relaxed text-slate-600">
          <b className="text-slate-500">方法说明：</b>
          「行业影响权重」由编者依据后续被引用频率、是否改变行业行为、以及是否构成结构性事件综合判断，
          它<b className="text-slate-400">不是</b>能力度量，也<b className="text-slate-400">不是</b>厂商声称的重要性。
          切换 Y 轴会看到同一批模型在不同叙事下的排序完全不同——这本身就是本模块想传达的结论：
          任何单一纵轴都是对 2025–2026 年的一次简化，包括本页面提供的每一个。
        </p>
      </div>
    </section>
  );
}

export function SectionHead({
  kicker,
  title,
  desc,
  accent = '#2DD4BF',
}: {
  kicker: string;
  title: string;
  desc?: string;
  accent?: string;
}) {
  return (
    <div>
      <div
        className="font-mono text-[10px] font-semibold tracking-[0.22em]"
        style={{ color: accent }}
      >
        {kicker}
      </div>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">{title}</h2>
      {desc && <p className="mt-2.5 max-w-4xl text-[13.5px] leading-relaxed text-slate-400">{desc}</p>}
    </div>
  );
}
