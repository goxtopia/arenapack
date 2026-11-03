import type { BenchmarkSeries } from './types';

/**
 * 基准的「灭绝与重生」
 * ------------------------------------------------------------------
 * status:
 *   saturated  = 已饱和，失去区分度（前沿模型普遍 >90%）
 *   contested  = 数字存在但方法论受质疑 / 已被用于训练数据筛选
 *   active     = 仍在有效区分模型
 *   retired    = 已停用或被替换
 */
export const BENCHMARKS: BenchmarkSeries[] = [
  {
    id: 'mmlu',
    name: 'MMLU / MMLU-Pro',
    status: 'saturated',
    ceiling: 100,
    unit: '%',
    saturatedOn: '2024-06',
    points: [
      { date: '2025-01-01', model: 'GPT-4o', lab: 'openai', v: 88.7, src: 'vendor' },
      { date: '2025-06-01', model: 'Gemini 2.5 Pro', lab: 'google', v: 90.4, src: 'vendor' },
      { date: '2025-11-01', model: 'Gemini 3 Pro', lab: 'google', v: 92.1, src: 'vendor' },
      { date: '2026-09-01', model: 'GPT-6 Astra', lab: 'openai', v: 94.6, src: 'vendor' },
    ],
    story:
      '四选一的知识问答。前沿模型自 2024 年中起就都在 88–95% 区间，而该区间同时也是「随机蒙对 + 训练集污染」能达到的区间。它在 2025 年之后基本不再出现在任何旗舰发布材料的主表里——一个基准的死亡方式，就是被厂商自己静默移除。',
  },
  {
    id: 'gsm8k',
    name: 'GSM8K',
    status: 'retired',
    ceiling: 100,
    unit: '%',
    saturatedOn: '2023-12',
    points: [
      { date: '2025-01-01', model: 'o1-mini', lab: 'openai', v: 97.8, src: 'vendor' },
      { date: '2025-08-01', model: 'GPT-5', lab: 'openai', v: 99.1, src: 'vendor' },
    ],
    story: '小学数学应用题。2023 年底即已饱和，2025 年后彻底退出发布材料。它的墓碑上写着：任何以「解题正确率」为唯一目标的基准，寿命都不会超过 18 个月。',
  },
  {
    id: 'humaneval',
    name: 'HumanEval',
    status: 'retired',
    ceiling: 100,
    unit: '%',
    saturatedOn: '2024-03',
    points: [
      { date: '2025-01-01', model: 'GPT-4o', lab: 'openai', v: 90.2, src: 'vendor' },
      { date: '2025-08-01', model: 'GPT-5', lab: 'openai', v: 95.0, src: 'vendor' },
    ],
    story: '164 道独立函数补全题。饱和后被 SWE-bench 系列整体替换——从「写一个函数」到「在一个真实仓库里改多个文件」。',
  },
  {
    id: 'swebench-verified',
    name: 'SWE-bench Verified',
    status: 'contested',
    ceiling: 100,
    unit: '%',
    points: [
      { date: '2025-02-24', model: 'Claude 3.7 Sonnet', lab: 'anthropic', v: 62.3, src: 'vendor' },
      { date: '2025-05-22', model: 'Claude Opus 4', lab: 'anthropic', v: 72.5, src: 'vendor' },
      { date: '2025-06-17', model: 'Gemini 2.5 Pro', lab: 'google', v: 67.2, src: 'vendor' },
      { date: '2025-08-07', model: 'GPT-5', lab: 'openai', v: 74.9, src: 'vendor' },
      { date: '2025-09-29', model: 'Claude Sonnet 4.5', lab: 'anthropic', v: 77.2, src: 'vendor' },
      { date: '2025-11-24', model: 'Claude Opus 4.5', lab: 'anthropic', v: 80.9, src: 'vendor' },
      { date: '2025-12-11', model: 'GPT-5.2', lab: 'openai', v: 80.0, src: 'vendor' },
      { date: '2026-02-05', model: 'Claude Opus 4.6', lab: 'anthropic', v: 82.6, src: 'vendor' },
      { date: '2026-04-24', model: 'DeepSeek-V4-Pro', lab: 'deepseek', v: 81.2, src: 'vendor' },
      { date: '2026-05-28', model: 'Claude Opus 4.8', lab: 'anthropic', v: 85.2, src: 'vendor' },
    ],
    story:
      '2025 年最有用、也最快被用坏的基准。它在 14 个月内从 62% 走到 85%+，进入了公认饱和区。必须区分的三件事：(1) Verified 是人工筛过的 500 题子集，与原始 SWE-bench 不可比；(2) 分数高度依赖 agent 脚手架（迭代次数、可运行测试的反馈回路），同一模型换脚手架可差 10 个百分点以上；(3) 题目已进入大量后训练数据池。行业因此在 2025 年底集体转向 SWE-bench Pro。',
  },
  {
    id: 'swebench-pro',
    name: 'SWE-bench Pro',
    status: 'active',
    ceiling: 100,
    unit: '%',
    points: [
      { date: '2025-09-29', model: 'Claude Sonnet 4.5', lab: 'anthropic', v: 42.8, src: 'vendor' },
      { date: '2025-11-24', model: 'Claude Opus 4.5', lab: 'anthropic', v: 55.9, src: 'vendor' },
      { date: '2025-12-11', model: 'GPT-5.2', lab: 'openai', v: 55.6, src: 'vendor' },
      { date: '2026-02-05', model: 'Claude Opus 4.6', lab: 'anthropic', v: 60.1, src: 'vendor' },
      { date: '2026-07-24', model: 'Claude Opus 5', lab: 'anthropic', v: 64.0, src: 'vendor' },
      { date: '2026-09-03', model: 'GPT-6 Astra', lab: 'openai', v: 72.0, src: 'vendor' },
      { date: '2026-10-13', model: 'Gemini 4 Argon', lab: 'google', v: 70.5, src: 'vendor' },
      { date: '2026-10-26', model: 'GPT-6.1 Terra', lab: 'openai', v: 78.0, src: 'vendor' },
    ],
    story:
      '真实商业代码库、多文件、企业级复杂度，且刻意避开公开仓库以降低污染。它比 Verified 难 20–35 个百分点，是目前编码能力最有区分度的公开基准——但同样正在被快速追赶，按当前斜率可能在 12–18 个月内进入饱和区。',
  },
  {
    id: 'arcagi1',
    name: 'ARC-AGI-1',
    status: 'saturated',
    ceiling: 100,
    unit: '%',
    saturatedOn: '2025-09',
    points: [
      { date: '2025-04-16', model: 'o3 (with tools)', lab: 'openai', v: 75.7, src: 'vendor' },
      { date: '2025-07-09', model: 'Grok 4', lab: 'xai', v: 92.2, src: 'vendor' },
      { date: '2026-02-19', model: 'Gemini 3.1 Pro', lab: 'google', v: 96.0, src: 'vendor' },
    ],
    story:
      'Chollet 的抽象推理基准，2024 年最好成绩不到 30%。2025 年内被推到 92%+，业界普遍达到约 98%。这是「基准被解决的速度快于基准被设计出来的速度」最极端的案例——它直接催生了 ARC-AGI-2 与 ARC-AGI-3。Grok 4 的 92.2% 尤其需要标注：自报、harness 描述不完整、且发布时该分数已不具备排名意义。',
  },
  {
    id: 'arcagi2',
    name: 'ARC-AGI-2',
    status: 'contested',
    ceiling: 100,
    unit: '%',
    points: [
      { date: '2025-04-16', model: 'o3 (with tools)', lab: 'openai', v: 20.4, src: 'vendor' },
      { date: '2025-08-07', model: 'GPT-5', lab: 'openai', v: 52.9, src: 'vendor' },
      { date: '2025-11-18', model: 'Gemini 3 Pro', lab: 'google', v: 31.1, src: 'vendor' },
      { date: '2025-11-24', model: 'Claude Opus 4.5', lab: 'anthropic', v: 69.1, src: 'vendor' },
      { date: '2025-12-11', model: 'GPT-5.2', lab: 'openai', v: 54.2, src: 'vendor' },
      { date: '2026-02-19', model: 'Gemini 3.1 Pro', lab: 'google', v: 77.1, src: 'vendor' },
      { date: '2026-06-09', model: 'Claude Fable 5', lab: 'anthropic', v: 83.0, src: 'vendor' },
      { date: '2026-09-03', model: 'GPT-6 Astra', lab: 'openai', v: 95.0, src: 'vendor' },
      { date: '2026-10-13', model: 'Gemini 4 Argon', lab: 'google', v: 92.0, src: 'vendor' },
    ],
    story:
      'ARC-AGI-1 的续作，2025 年初最好成绩约 5%。到 2026-09 已被自报到 95%。Gemini 3 Pro → 3.1 Pro 单代 +46 个百分点（31.1% → 77.1%）是整个时间线上最受争议的单个数字跳跃：如果这是真实的抽象推理突破，那么三个月内不该有其他家在同一指标上落后 40 个百分点；更可能的解释是题目集已进入训练与数据筛选流程。ARC-AGI-2 正在重演 ARC-AGI-1 的死亡路径，只是慢了一年。',
  },
  {
    id: 'arcagi3',
    name: 'ARC-AGI-3',
    status: 'active',
    ceiling: 100,
    unit: '%',
    points: [
      { date: '2026-05-01', model: '人类基线', lab: 'human', v: 99.0, src: 'independent' },
      { date: '2026-07-24', model: 'Claude Opus 5', lab: 'anthropic', v: 30.2, src: 'independent' },
      { date: '2026-09-22', model: 'Claude Opus 5.5', lab: 'anthropic', v: 41.0, src: 'independent' },
    ],
    story:
      '交互式基准：模型必须与一个未知规则的环境持续博弈、试错、建立心智模型，而不是一次性看图作答。人类基线接近 100%，2026-09 的最好模型成绩约 41%。这是目前公开可用、最难被针对性训练、也最诚实地标出能力边界的基准。差距不是 5 个百分点，是 58 个。',
  },
  {
    id: 'hle',
    name: "Humanity's Last Exam (HLE)",
    status: 'active',
    ceiling: 100,
    unit: '%',
    points: [
      { date: '2025-06-17', model: 'Gemini 2.5 Pro (tools)', lab: 'google', v: 21.6, src: 'vendor' },
      { date: '2025-08-07', model: 'GPT-5 (tools)', lab: 'openai', v: 25.1, src: 'vendor' },
      { date: '2025-08-21', model: 'Gemini 2.5 Deep Think', lab: 'google', v: 33.8, src: 'vendor' },
      { date: '2025-11-18', model: 'Gemini 3 Pro (tools)', lab: 'google', v: 37.5, src: 'vendor' },
      { date: '2025-12-11', model: 'GPT-5.2 (no tools)', lab: 'openai', v: 34.5, src: 'vendor' },
      { date: '2026-02-05', model: 'Claude Opus 4.6 (no tools)', lab: 'anthropic', v: 41.6, src: 'vendor' },
      { date: '2026-02-19', model: 'Gemini 3.1 Pro (tools)', lab: 'google', v: 44.4, src: 'vendor' },
      { date: '2026-09-03', model: 'GPT-6 Astra (tools)', lab: 'openai', v: 55.0, src: 'vendor' },
      { date: '2026-10-26', model: 'GPT-6.1 Terra (tools)', lab: 'openai', v: 61.0, src: 'vendor' },
    ],
    story:
      '由各领域专家出的、刻意超出常规训练分布的极难题。它目前仍有区分度（前沿 55–61%），但存在两个结构性问题：(1)「含工具」与「纯文本」的成绩可以相差 15–25 个百分点，厂商并不总是标注清楚——本表已逐条标注；(2) 题目在公开后会被逐步吸收进训练数据，2025 年初的题目与 2026 年末的题目已经不是同一个基准。',
  },
  {
    id: 'lmarena',
    name: 'LMArena (Chatbot Arena) Elo',
    status: 'contested',
    ceiling: 1600,
    unit: 'Elo',
    points: [
      { date: '2025-03-25', model: 'Gemini 2.5 Pro Exp', lab: 'google', v: 1452, src: 'independent' },
      { date: '2025-04-05', model: 'Llama 4 Maverick', lab: 'meta', v: 1417, src: 'independent' },
      { date: '2025-08-07', model: 'GPT-5', lab: 'openai', v: 1468, src: 'independent' },
      { date: '2025-11-12', model: 'GPT-5.1', lab: 'openai', v: 1478, src: 'independent' },
      { date: '2025-11-18', model: 'Gemini 3 Pro', lab: 'google', v: 1501, src: 'independent' },
      { date: '2026-02-19', model: 'Gemini 3.1 Pro', lab: 'google', v: 1520, src: 'independent' },
      { date: '2026-07-16', model: 'Kimi K3', lab: 'moonshot', v: 1512, src: 'independent' },
      { date: '2026-10-13', model: 'Gemini 4 Argon', lab: 'google', v: 1533, src: 'independent' },
    ],
    story:
      '人类盲测偏好。它测的是「让人满意」，不是「正确」。已知偏差至少四类：偏好更长回答、偏好更多 Markdown 排版、偏好更自信语气、偏好谄媚。2025-04 的《The Leaderboard Illusion》披露 Meta 提交了 27 个未公开私有变体、只公布最好的一个；同月 OpenAI 因 GPT-4o 谄媚化更新在数天内回滚。LMArena 于 2026-01 改名并引入风格控制项，但偏好分数对表面特征的敏感度并未消失。20 个月的总跨度只有约 80 Elo——在一个系统性偏向格式的指标上，这个量级的差异几乎不携带能力信息。',
  },
  {
    id: 'omniscience',
    name: 'AA-Omniscience（知识与幻觉）',
    status: 'active',
    ceiling: 100,
    unit: '%',
    points: [
      { date: '2025-06-01', model: '前沿模型平均准确率', lab: 'aggregate', v: 48.0, src: 'independent' },
      { date: '2026-01-01', model: '前沿模型平均准确率', lab: 'aggregate', v: 58.0, src: 'independent' },
      { date: '2026-09-01', model: '前沿模型平均准确率', lab: 'aggregate', v: 65.0, src: 'independent' },
      { date: '2026-09-01', model: '不作答时的幻觉率', lab: 'aggregate', v: 55.0, src: 'independent' },
    ],
    story:
      '最不舒服的一组数字。前沿模型在事实性知识题上的准确率约 62–68%，而在被允许弃答时，选择不弃答却答错的比例约 50–61%。也就是说：模型不仅会错，而且倾向于在不知道的时候仍然给出确定答案。这与推理基准的提升是并行发生的、互不矛盾的两个事实——更高的「智商」并没有带来更低的幻觉率。这一点在 2025–2026 年的厂商发布材料中几乎从不出现。',
  },
  {
    id: 'gpqa',
    name: 'GPQA Diamond',
    status: 'saturated',
    ceiling: 100,
    unit: '%',
    saturatedOn: '2026-02',
    points: [
      { date: '2025-02-19', model: 'Grok 3', lab: 'xai', v: 84.6, src: 'vendor' },
      { date: '2025-02-24', model: 'Claude 3.7 Sonnet', lab: 'anthropic', v: 84.8, src: 'vendor' },
      { date: '2025-04-16', model: 'o3', lab: 'openai', v: 87.7, src: 'vendor' },
      { date: '2025-06-17', model: 'Gemini 2.5 Pro', lab: 'google', v: 86.4, src: 'vendor' },
      { date: '2025-11-18', model: 'Gemini 3 Pro', lab: 'google', v: 91.9, src: 'vendor' },
      { date: '2026-02-19', model: 'Gemini 3.1 Pro', lab: 'google', v: 94.3, src: 'vendor' },
    ],
    story: '研究生级科学问答，人类领域专家基线约 65–81%。2026 年初前沿模型已超过 94%，即已稳定超过该基准的人类专家上限——一个基准在人类专家之下失去意义的方式，就是被超过。',
  },
];

export const BENCH_STATUS_META = {
  saturated: { label: '已饱和', color: '#64748B', desc: '前沿模型普遍 >90%，失去区分度' },
  contested: { label: '受质疑', color: '#FBBF24', desc: '数字存在但方法论 / 独立性受质疑' },
  active: { label: '仍有效', color: '#34D399', desc: '目前仍能区分模型' },
  retired: { label: '已退役', color: '#475569', desc: '不再被发布材料引用' },
};
