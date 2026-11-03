export interface Lab {
  id: string;
  name: string;
  short: string;
  country: string;
  flag: string;
  color: string;
  founded: string;
  stance: string;
  note: string;
}

export const LABS: Lab[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    short: 'OAI',
    country: 'US',
    flag: '🇺🇸',
    color: '#2DD4BF',
    founded: '2015',
    stance: '闭源 · API',
    note: '2025 年 8 月首次开源权重（gpt-oss，Apache-2.0），但旗舰线保持闭源；2026 年 GPT-6 起对网络攻击能力实施分级管控。',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    short: 'ANT',
    country: 'US',
    flag: '🇺🇸',
    color: '#F0916B',
    founded: '2021',
    stance: '闭源 · 安全分级',
    note: '2026 年 Project Glasswing 将最强模型 Mythos 置于受限访问之后，公开可用线改名 Fable；引发「安全 vs. 开放」的正面争论。',
  },
  {
    id: 'google',
    name: 'Google DeepMind',
    short: 'GDM',
    country: 'US/UK',
    flag: '🇺🇸',
    color: '#818CF8',
    founded: '2010/2023',
    stance: '闭源旗舰 + 开源权重',
    note: '唯一同时维持旗舰闭源（Gemini）与大规模开源权重（Gemma）的实验室；2026-04 Gemma 4 转为 Apache-2.0。',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek 深度求索',
    short: 'DSK',
    country: 'CN',
    flag: '🇨🇳',
    color: '#38BDF8',
    founded: '2023',
    stance: 'MIT 开源',
    note: '2025-01 R1 的 RLVR 配方公开，直接冲击了「训练成本」叙事；至 2026 年仍坚持 MIT 许可与极低 API 定价。',
  },
  {
    id: 'qwen',
    name: 'Alibaba Qwen 通义',
    short: 'QWN',
    country: 'CN',
    flag: '🇨🇳',
    color: '#C084FC',
    founded: '2023',
    stance: 'Apache-2.0 为主',
    note: '开源权重数量最多的实验室之一；2026-08 旗舰 Qwen3.8-2.4T 首次改用自定义许可，27B 版本仍为 Apache-2.0。',
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI 月之暗面',
    short: 'KMI',
    country: 'CN',
    flag: '🇨🇳',
    color: '#4ADE80',
    founded: '2023',
    stance: '开源（修改版 MIT）',
    note: 'K2/K3 走「大规模 MoE + Agent」路线；2026-07 K3（2.8T/104B）成为当时最大的可下载开源权重模型。',
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI 智谱',
    short: 'GLM',
    country: 'CN',
    flag: '🇨🇳',
    color: '#F472B6',
    founded: '2019',
    stance: 'MIT 开源',
    note: 'GLM-4.5→GLM-5 系列在 MIT 许可下把 700B 级 MoE 权重放到公开渠道。',
  },
  {
    id: 'minimax',
    name: 'MiniMax 稀宇',
    short: 'MMX',
    country: 'CN',
    flag: '🇨🇳',
    color: '#FBBF24',
    founded: '2021',
    stance: '开源 + API',
    note: '以极小激活参数（10B 级）换取可本地部署的 Agent 模型，2026 年 H3 Max 转向多模态长上下文。',
  },
  {
    id: 'meta',
    name: 'Meta Superintelligence Labs',
    short: 'META',
    country: 'US',
    flag: '🇺🇸',
    color: '#CBD5E1',
    founded: '2013/2025',
    stance: '2026 年起闭源',
    note: '开源阵营最大的变量：Llama 4 Behemoth（2T）宣布后从未发布；2025-06 以 143 亿美元入股 Scale AI 组建 MSL，2026-04 Muse Spark 完全闭源，Yann LeCun 离开。',
  },
  {
    id: 'xai',
    name: 'xAI',
    short: 'xAI',
    country: 'US',
    flag: '🇺🇸',
    color: '#E2E8F0',
    founded: '2023',
    stance: '闭源 · API',
    note: '以自报高分与快速迭代著称；Grok 4（2025-07）的 HLE 与 ARC-AGI-1 数字为厂商自报，独立复现存在分歧。',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    short: 'MIS',
    country: 'FR',
    flag: '🇫🇷',
    color: '#FB923C',
    founded: '2023',
    stance: '混合：开源 + 商用闭源',
    note: '欧洲唯一持续发布前沿级模型的实验室；Magistral Small 采用 Apache-2.0，Large 线转为商用授权。',
  },
];

export const LAB_BY_ID: Record<string, Lab> = Object.fromEntries(
  LABS.map((l) => [l.id, l]),
);
