import type { MetrPoint } from './types';

/**
 * METR「50% 自主任务时长」（Time Horizon）
 * ------------------------------------------------------------------
 * 定义：模型在 METR 的 HCAST / SWAA 任务集上达到 50% 成功率时，
 * 该任务对人类专家而言所需的时间长度。
 *
 * reliable=false 的点位于 METR 明确声明的不可靠区间（>16 小时）：
 * 样本量不足、噪声过大，METR 1.1 报告本身即对此作出保留。
 *
 * 拟合：2023 年后 doubling time ≈ 130.8 天（METR, 2026-01）
 */
export const METR_POINTS: MetrPoint[] = [
  { date: '2025-03-19', model: 'Claude 3.7 Sonnet', lab: 'anthropic', minutes: 50, src: 'independent', reliable: true },
  { date: '2025-06-01', model: 'Deep Research (o3)', lab: 'openai', minutes: 78, src: 'independent', reliable: true },
  { date: '2025-08-20', model: 'GPT-5', lab: 'openai', minutes: 137, src: 'independent', reliable: true },
  { date: '2025-10-05', model: 'Claude Sonnet 4.5', lab: 'anthropic', minutes: 180, src: 'independent', reliable: true },
  { date: '2025-12-01', model: 'Claude Opus 4.5', lab: 'anthropic', minutes: 300, src: 'independent', reliable: true },
  { date: '2026-01-28', model: 'Claude Opus 4.6', lab: 'anthropic', minutes: 720, src: 'independent', reliable: false },
  { date: '2026-01-28', model: 'Claude Opus 4.6 (上界)', lab: 'anthropic', minutes: 870, src: 'independent', reliable: false },
  { date: '2026-06-20', model: 'Claude Fable 5', lab: 'anthropic', minutes: 960, src: 'independent', reliable: false },
];

export const METR_META = {
  doublingDaysPost2023: 130.8,
  doublingDaysHistorical: 213, // ~7 个月，2019–2023 区间
  unreliableAboveMinutes: 960, // 16 小时
  notes: [
    'METR 于 2025-03-19 发布 Time Horizon 1.0，2026-01-28 发布 1.1 版本。',
    '1.1 版报告的关键结论之一：失败主因已从「模型能力不足」转变为「长上下文中的自我条件化错误累积」——模型被自己先前的输出持续带偏，错误级联而非随机分布。',
    '超过约 16 小时的区间，METR 明确表示测量不可靠：任务样本稀少、评分者间一致性下降、置信区间宽到无法支撑外推。',
    '把这条曲线简单外推到「2027 年模型可自主工作数周」是常见的误读：曲线拟合的是任务时长，而任务集本身是静态的、可被针对性训练的，且长时程失败模式与短任务并非同类问题。',
    '本页面的两条拟合线都是对上图数据点做的最小二乘对数回归，不是 METR 官方拟合。全区间（2019–2026）斜率明显低于 2023 年后区间——这不是矛盾，而是说明「翻倍周期」本身随所选时间窗变化。引用任何一个翻倍周期数字时，都必须同时说明窗口与锚点。',
    '2025-03 之前的锚点（GPT-2 时代基线 → o1-preview）为回溯拟合值，用于展示曲线完整形态，并非当时的实测发布记录。把它们纳入拟合会拉低整体斜率，这也是两条线差异的主要来源之一。',
  ],
};

/** 对数刻度下的历史锚点（2019–2024），用于展示曲线的完整形态 */
export const METR_HISTORICAL: MetrPoint[] = [
  { date: '2019-03-01', model: 'GPT-2 时代基线', lab: 'openai', minutes: 0.02, src: 'independent', reliable: true },
  { date: '2021-01-01', model: 'GPT-3', lab: 'openai', minutes: 0.2, src: 'independent', reliable: true },
  { date: '2022-06-01', model: 'GPT-3.5 / 早期 RLHF', lab: 'openai', minutes: 2, src: 'independent', reliable: true },
  { date: '2023-11-01', model: 'GPT-4 (early)', lab: 'openai', minutes: 10, src: 'independent', reliable: true },
  { date: '2024-10-01', model: 'o1-preview / Claude 3.5', lab: 'anthropic', minutes: 25, src: 'independent', reliable: true },
];
