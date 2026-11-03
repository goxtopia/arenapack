import type { Act } from './types';

/** 五幕结构：2025-01 → 2026-11 */
export const ACTS: Act[] = [
  {
    id: 'act-1',
    index: 1,
    title: '推理的诞生与预训练的撞墙',
    subtitle: 'ACT I · THE REASONING SHOCK',
    range: ['2025-01-01', '2025-04-30'],
    accent: '#38BDF8',
    thesis:
      '四个月内，行业同时得到了一份意外的礼物和一个明确的坏消息：强化学习让模型学会了「想久一点」，而纯粹的预训练规模化已经不再产出等比例的回报。',
    whatActuallyHappened: [
      '2025-01-20，DeepSeek-R1 以 MIT 许可公开了 RLVR（可验证奖励强化学习）的完整配方。冲击不在于它的分数——AIME 79.8%、MATH-500 97.3%——而在于它以远低于同档闭源模型的成本做到了这件事，并且权重可以直接下载。',
      '11 天后 OpenAI 发布 o3-mini，把推理模型价格打到旗舰的十分之一；2-24 Anthropic 发布 Claude 3.7 Sonnet，第一次把「快速回答」与「扩展思考」合并进单一模型，同日推出 Claude Code 预览版。',
      '2-27，GPT-4.5 "Orion" 以 $75/$150 每百万 token 的史上最高价发布，然后在编码基准上输给了便宜得多的 GPT-4o。它在四个半月后（07-14，共 137 天）从 API 退役。这是「纯预训练规模化撞墙」最昂贵的一次公开演示。',
      '3-25，Gemini 2.5 Pro 实验版把 1M token 上下文与思考能力一起变成旗舰标配。',
      '4-05，Llama 4 Scout/Maverick 发布，宣称 10M 上下文；同期被宣布的 2T 参数 Behemoth 从此再未出现。',
      '4-14 至 4-16，OpenAI 在 72 小时内连发 GPT-4.1（1M 上下文，$2/$8，比 GPT-4.5 便宜约 37 倍）与 o3/o4-mini（工具调用写进思维链内部）。',
    ],
    honestCaveat:
      '这一幕里最容易被夸大的是 DeepSeek 的「成本」。R1 公布的是训练方法学与其自报的训练开销，不包括数据获取、失败实验、基础设施折旧与人才成本；把它读成「闭源模型贵了几百倍」是不成立的。同样需要标注的是：Grok 3 与 Llama 4 的多个高分是厂商自报的，且 harness 描述不完整——2025 年的自报基准问题从第一季度就开始了。',
    keyModels: ['deepseek-r1', 'gpt-4.5', 'claude-3.7-sonnet', 'gemini-2.5-pro-exp', 'gpt-4.1', 'o3'],
  },
  {
    id: 'act-2',
    index: 2,
    title: '榜单的幻觉',
    subtitle: 'ACT II · THE LEADERBOARD ILLUSION',
    range: ['2025-04-01', '2025-08-31'],
    accent: '#F0916B',
    thesis:
      '当所有实验室都在优化同一批指标时，指标本身停止了工作。2025 年年中，行业被迫承认：它一直在测量的东西，和它真正想要的东西，不是同一件事。',
    whatActuallyHappened: [
      '4-30，一篇被广泛引用的批评（《The Leaderboard Illusion》）指出：Meta 在 LMArena 上提交了 27 个未公开的 Llama 4 私有变体，只公开榜单表现最好的那个；同时 Arena 的偏好分数系统性地偏向更长、更多 Markdown 格式、更自信的回答。',
      '同月，OpenAI 因 GPT-4o 的「过度谄媚」更新而在数天内回滚——用户偏好分数上升，实际任务表现下降。这是风格偏差与能力偏差被公开区分的起点。',
      '5-22，Claude Opus 4 不再主打单轮分数，而是主打「连续工作 7 小时不跑偏」。评测重心开始从「答得多好」转向「能自主做多久」。',
      '6-13，Meta 以约 143 亿美元入股 Scale AI，组建 Meta Superintelligence Labs。开源权重生态最重要的推动者开始转向。',
      '7-09，Grok 4 自报 ARC-AGI-1 92.2% 与 HLE 25.4%（含工具）；ARC-AGI-1 当时业界普遍成绩已接近 98%，这个数字几乎没有信息量，但传播效果极好。',
      '8-05，OpenAI 发布 gpt-oss-120b/20b，Apache-2.0——自 GPT-2 之后第一次放出可商用权重。同日 Anthropic 发布 Opus 4.1。',
      '8-07，GPT-5 发布，把 GPT 主线与 o 推理线合并为自动路由。基准全面提升，产品口碑却明显下滑。',
    ],
    honestCaveat:
      '这一幕的教训至今没有被完全吸收。LMArena 在 2026-01 改名并引入风格控制项，但「人类盲测偏好」仍然是最常被引用的单一指标，而它对格式、长度、语气的敏感度并没有消失。GPT-5 的路由器争议尤其值得记住：一个在所有基准上都更强的模型，可以在真实使用中让大量用户觉得「变笨了」。基准衡量的是分布上的平均表现，用户体验衡量的是在你那个具体任务上的表现——这两者之间的鸿沟，2026 年仍然存在。',
    keyModels: ['llama-4-maverick', 'gpt-5', 'grok-4', 'gpt-oss-120b', 'claude-opus-4.1', 'msl-formation'],
  },
  {
    id: 'act-3',
    index: 3,
    title: '价格崩塌，能力趋同',
    subtitle: 'ACT III · THE GREAT DEFLATION',
    range: ['2025-09-01', '2026-03-31'],
    accent: '#2DD4BF',
    thesis:
      '旗舰档位第一次出现代际降价而不是涨价。同等能力的单位 token 价格在七个月内下降约一个数量级，而中美前沿模型在多数公开基准上的差距收敛到个位数百分点。',
    whatActuallyHappened: [
      '9-29，Claude Sonnet 4.5（$3/$15）在 SWE-bench Verified 上拿到 77.2%，超过五个月前 $15/$75 的 Opus 4。价格与能力排序正式脱钩。',
      '10-15，Claude Haiku 4.5 在 $1/$5 档拿到 73.3%。',
      '11-06，Kimi K2 Thinking（MIT，1T/32B）自报 HLE 44.9%（含工具）——开源模型第一次在这一指标上与闭源旗舰同区间。',
      '11-18，Gemini 3 Pro 在 GPQA（91.9%）与 LMArena（~1501）双双登顶，同时 ARC-AGI-2 只有 31.1%。同一代模型上，饱和基准与困难基准的分野前所未有地清晰。',
      '11-24，Claude Opus 4.5 把旗舰价从 $15/$75 砍到 $5/$25（-67%），能力同时提升。METR 独立测得其 50% 自主任务时长约 5 小时。',
      '12-11，GPT-5.2 把 SWE-bench Verified 推到 80%，业界随即普遍转向更难的 SWE-bench Pro（真实企业仓库、多文件）。',
      '2026-02-05，Claude Opus 4.6 发布，METR 1.1 报告测得约 12–14.5 小时自主任务时长；同日 GPT-5.3-Codex 发布。头部实验室的发布窗口开始正面重叠。',
      '2026-02-19，Gemini 3.1 Pro 把 ARC-AGI-2 从 31.1% 提到 77.1%——单代 +46 个百分点。',
    ],
    honestCaveat:
      '「便宜了」与「用得起」是两件事。单价下降约 95% 的同时，Agent 化工作流的单任务 token 消耗上升了 20–100 倍：长思维链、多轮工具调用、失败重试、多智能体编排。对多数重度用户而言，账单没有下降，只是买到了更多东西（Jevons 悖论）。另外，ARC-AGI-2 的 +46 个百分点必须打上问号——该基准的题目在这一时期被广泛用于后训练数据筛选，指标独立性正在流失。METR 也明确说明：超过约 16 小时的测量区间噪声过大，Opus 4.6 的数字已处在可靠测量的边缘。',
    keyModels: [
      'claude-sonnet-4.5',
      'claude-opus-4.5',
      'gemini-3-pro',
      'gpt-5.2',
      'kimi-k2-thinking',
      'claude-opus-4.6',
      'gemini-3.1-pro',
    ],
  },
  {
    id: 'act-4',
    index: 4,
    title: '开源的分岔与能力的分级',
    subtitle: 'ACT IV · GATED FRONTIERS',
    range: ['2026-04-01', '2026-08-31'],
    accent: '#C084FC',
    thesis:
      '同一个月内，Meta 转向完全闭源，Google 把 Gemma 改为 Apache-2.0。前沿能力第一次被实验室主动扣留——不是因为做不到，而是因为认为不该普遍可得。',
    whatActuallyHappened: [
      '4-02，Google 把 Gemma 4 的许可从专有 Gemma 条款改为 Apache-2.0。',
      '4-07，Anthropic 发布 Claude Mythos 预览版（Project Glasswing）：认定该档模型的自主漏洞发现能力构成实质风险，不向公众开放，仅通过受限通道提供给审核过的安全研究方。这是前沿实验室第一次以「能力过强」为由主动扣留自己最强的模型。',
      '4-08，Meta 发布 Muse Spark——完全闭源，仅 API，262K 上下文。从 Llama 3 到 Behemoth 失信到 MSL 成立到 Muse Spark，全球最大开源权重供给方在 12 个月内完成转向。',
      '4-24，DeepSeek-V4-Pro 以 MIT 许可发布 1.6T 总参数 + 1M 上下文，SWE-bench Verified 自报 81.2%，与闭源旗舰差距缩小到 2–3 个百分点。',
      '6-09，Anthropic 的公开线改名 Fable 5（$10/$50，带安全路由），受限线保留 Mythos 5。6-12 至 7-01 因出口管制审查短暂暂停部分区域服务——政策风险第一次直接中断商用模型可用性。',
      '7-16/27，Kimi K3 发布：2.8T/104B，当时最大的可下载权重模型。但许可已从 MIT 改为自定义条款，含商用规模限制。',
      '8-12，Qwen3.8-2.4T 采用自定义许可，同月的 Qwen3.8-27B 保持 Apache-2.0。「大模型收许可、小模型保持宽松」成为普遍折中。',
      '9-10，DeepSeek-V4.1-Flash：因果 encoder-decoder MoE，预填充激活 8B、解码激活 16B，MIT，离峰 $0.15/$0.60。',
    ],
    honestCaveat:
      '「开源 vs 闭源」在 2026 年已经不是一个二元问题，而是三个独立维度的组合：(1) 权重是否可下载；(2) 许可是否 OSI 认证（MIT/Apache-2.0 vs Llama/Gemma/自定义条款）；(3) 在该许可下是否真的能跑起来——2.8T 权重需要多节点 GPU 集群，不是笔记本电脑。同时，能力分级发放（Glasswing / Fairwind / Critical tier）的争议是双向的：它可能确实降低了风险，但也把最强能力集中到少数机构手中，并且使公众无法独立复核厂商关于该能力的一切说法。到 2026-11，这场争论没有共识。',
    keyModels: [
      'muse-spark',
      'gemma-4',
      'claude-mythos-preview',
      'deepseek-v4-pro',
      'kimi-k3',
      'claude-fable-5',
      'qwen3.8',
    ],
  },
  {
    id: 'act-5',
    index: 5,
    title: '收敛、饱和，与仍然存在的边界',
    subtitle: 'ACT V · CONVERGENCE & THE REMAINING GAP',
    range: ['2026-09-01', '2026-11-03'],
    accent: '#FBBF24',
    thesis:
      '旗舰价格收敛到 $1–2/$5–10，旗舰发布日完全重叠，多数经典基准已经饱和。与此同时，ARC-AGI-3 上的最好成绩约为 30–41%，而人类基线接近 100%。行业同时抵达了「工程收敛」和「能力边界」两个终点。',
    whatActuallyHappened: [
      '9-03，GPT-6 Astra：官方称 10 万块以上 GPU、循环 Transformer 结构，ARC-AGI-2 自报 95%——该基准在此点位基本失去区分度。同代引入网络能力 Critical 分级与受限发放。',
      '9-22，Claude Opus 5.5 从 $10/$50 降到 $4/$20，ARC-AGI-3 从 30.2% 升至约 41%。同日 GPT-6 Sol（$2/$10）与 Luna（$0.10/$0.50，2M 上下文）发布。',
      '9-30 / 10-13，Gemini 4 Argon 经 Fairwind 预览后 GA，$2/$10，稀疏 MoE 深度绑定 TPU。10-28 发布仅面向网络安全防御、受限发放的 Gemini 4 Carbon。',
      '10-07，Claude Haiku 5.5 把最低档做到 $0.10/$0.50 + 1M 上下文。',
      '10-26，GPT-6.1 Terra GA：$1/$5、2M 上下文、SWE-bench Pro 自报约 78%、HLE 含工具约 61%。',
      '10-29，DeepSeek 发布 Cyber 专用档位——能力分级发放机制不再只属于闭源实验室。',
      '至此，OpenAI、Anthropic、Google 三家都已建立「最强能力不向公众开放」的分级机制。',
    ],
    honestCaveat:
      '必须同时说清三件事。第一，饱和的基准（MMLU、GSM8K、HumanEval、ARC-AGI-1 ~98%、SWE-bench Verified ~85–95%）已经无法区分模型；仍在区分的（ARC-AGI-2/3、SWE-bench Pro、HLE、AA-Omniscience）数字都还低，且高度依赖 harness。第二，自主任务时长的翻倍曲线（2023 年后约每 130.8 天翻倍）在 2026 年已撞上测量天花板：METR 明确说明 >16 小时区间噪声过大，且失败主因从「能力不足」变成「长上下文中的自我条件化错误累积」——即模型被自己前面的输出带偏。第三，AA-Omniscience 类测评估计前沿模型的准确率约 62–68%，但在被要求不作答时选择不弃答的比例达 50–61%。高能力与高幻觉率并不矛盾，它们同时为真。',
    keyModels: [
      'gpt-6-astra',
      'claude-opus-5.5',
      'gpt-6-sol',
      'gemini-4-argon',
      'gpt-6.1-terra',
      'gemini-4-carbon',
      'deepseek-cyber',
    ],
  },
];
