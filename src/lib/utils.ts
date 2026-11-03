import { LAB_BY_ID } from '../data/labs';
import type { ModelEntry } from '../data/types';

export const T0 = Date.UTC(2025, 0, 1);
export const T1 = Date.UTC(2026, 10, 3); // 2026-11-03
export const SPAN = T1 - T0;

export const toMs = (iso: string) => new Date(iso + 'T00:00:00Z').getTime();
/** 0..1 normalized time */
export const tNorm = (iso: string) => (toMs(iso) - T0) / SPAN;

export const fromNorm = (n: number) => new Date(T0 + n * SPAN).toISOString().slice(0, 10);

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
};

export const fmtDateShort = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${m}/${d}`;
};

export const monthLabel = (n: number) => {
  const ms = T0 + n * SPAN;
  const d = new Date(ms);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const labColor = (labId: string) => LAB_BY_ID[labId]?.color ?? '#94A3B8';
export const labName = (labId: string) => LAB_BY_ID[labId]?.short ?? labId;

export const fmtParams = (m: ModelEntry) => {
  if (!m.paramsTotal && !m.paramsActive) return '—';
  const f = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}T` : `${n}B`);
  if (m.paramsTotal && m.paramsActive) return `${f(m.paramsActive)} 激活 / ${f(m.paramsTotal)} 总`;
  if (m.paramsTotal) return `${f(m.paramsTotal)}`;
  return `${f(m.paramsActive!)} 激活`;
};

export const fmtCtx = (n?: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(2)}M`;
  }
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
};

export const fmtPrice = (v?: number) => (v === undefined ? '—' : v < 1 ? `$${v.toFixed(2)}` : `$${v.toFixed(2)}`);

export const fmtMinutes = (min: number) => {
  if (min < 1) return `${Math.round(min * 60)} 秒`;
  if (min < 60) return `${Math.round(min)} 分钟`;
  const h = min / 60;
  if (h < 24) {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return mm ? `${hh} 小时 ${mm} 分` : `${hh} 小时`;
  }
  return `${(h / 24).toFixed(1)} 天`;
};

export const LICENSE_META: Record<string, { label: string; open: boolean; color: string }> = {
  MIT: { label: 'MIT', open: true, color: '#4ADE80' },
  'Apache-2.0': { label: 'Apache-2.0', open: true, color: '#2DD4BF' },
  Gemma: { label: 'Gemma 条款', open: false, color: '#FBBF24' },
  Llama: { label: 'Llama 条款', open: false, color: '#FBBF24' },
  custom: { label: '自定义（权重可下载）', open: false, color: '#FB923C' },
  proprietary: { label: '闭源 API', open: false, color: '#64748B' },
  restricted: { label: '受限发放', open: false, color: '#F87171' },
};

export const KIND_META: Record<string, { label: string; glyph: string }> = {
  flagship: { label: '旗舰', glyph: '◆' },
  reasoning: { label: '推理', glyph: '✦' },
  open: { label: '开源权重', glyph: '●' },
  small: { label: '小档', glyph: '·' },
  code: { label: '编码专用', glyph: '▮' },
  preview: { label: '预览', glyph: '○' },
  restricted: { label: '受限 / 非模型事件', glyph: '▲' },
  cancelled: { label: '从未发布', glyph: '✕' },
};

/** 显存估算：权重 + KV cache 粗算 */
export function vramGB(paramsTotalB: number, bits: number, ctxTokens = 8192): number {
  const weightGB = (paramsTotalB * bits) / 8;
  // 粗算 KV：约 0.0002 GB / 1k tokens / 1B active-ish，这里给一个保守常数项
  const kv = (ctxTokens / 1000) * 0.06 * (bits / 4);
  return weightGB + kv + 1.5; // + 运行时开销
}

export const GPUS = [
  { id: 'rtx4090', name: 'RTX 4090', vram: 24, price: 1800 },
  { id: 'rtx5090', name: 'RTX 5090', vram: 32, price: 2400 },
  { id: 'a100', name: 'A100 80GB', vram: 80, price: 12000 },
  { id: 'h100', name: 'H100 80GB', vram: 80, price: 28000 },
  { id: 'h200', name: 'H200 141GB', vram: 141, price: 34000 },
  { id: 'b200', name: 'B200 192GB', vram: 192, price: 45000 },
  { id: 'mi300x', name: 'MI300X 192GB', vram: 192, price: 18000 },
  { id: 'mac', name: 'Mac Studio M3 Ultra 512GB', vram: 512, price: 11000 },
];

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
