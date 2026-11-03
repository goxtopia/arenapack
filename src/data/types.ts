export type MetricSource = 'vendor' | 'independent';

export interface Metric {
  /** value */
  v: number;
  /** who produced this number */
  src: MetricSource;
  /** harness caveat, e.g. "with tools", "beta ctx", "self-reported" */
  note?: string;
}

export interface Benchmarks {
  swebenchVerified?: Metric;
  swebenchPro?: Metric;
  hle?: Metric;
  arcagi1?: Metric;
  arcagi2?: Metric;
  arcagi3?: Metric;
  gpqa?: Metric;
  osworld?: Metric;
  lmarena?: Metric;
  /** METR 50% autonomous task horizon, in minutes */
  metrHorizon?: Metric;
  /** $ / 1M blended, when notable */
  costIndex?: Metric;
}

export type ModelKind =
  | 'flagship'
  | 'reasoning'
  | 'open'
  | 'small'
  | 'code'
  | 'preview'
  | 'restricted'
  | 'cancelled';

export type License =
  | 'proprietary'
  | 'restricted'
  | 'custom'
  | 'MIT'
  | 'Apache-2.0'
  | 'Gemma'
  | 'Llama';

export interface ModelEntry {
  id: string;
  name: string;
  lab: string;
  /** ISO date of public release / announcement */
  date: string;
  kind: ModelKind;
  license: License;
  /** billions of parameters */
  paramsTotal?: number;
  paramsActive?: number;
  /** context window, tokens */
  context?: number;
  /** $ per 1M input tokens (list price at launch) */
  priceIn?: number;
  /** $ per 1M output tokens */
  priceOut?: number;
  /** ids of predecessor models — drawn as lineage synapses */
  lineage?: string[];
  benchmarks?: Benchmarks;
  /** one-sentence honest note, zh-CN */
  note: string;
  /** optional longer dossier text */
  detail?: string;
  tags?: string[];
  /** 0..1 importance for glyph size */
  weight?: number;
}

export interface Act {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  range: [string, string];
  thesis: string;
  whatActuallyHappened: string[];
  honestCaveat: string;
  keyModels: string[];
  accent: string;
}

export interface Critique {
  id: string;
  n: string;
  title: string;
  claim: string;
  evidence: string[];
  counterweight: string;
  verdict: string;
  severity: 'high' | 'medium' | 'structural';
  accent: string;
}

export interface BenchmarkSeries {
  id: string;
  name: string;
  status: 'saturated' | 'contested' | 'active' | 'retired';
  ceiling: number;
  unit: '%' | 'score' | 'Elo';
  /** date the benchmark stopped discriminating, if any */
  saturatedOn?: string;
  points: { date: string; model: string; lab: string; v: number; src: MetricSource }[];
  story: string;
}

export interface MetrPoint {
  date: string;
  model: string;
  lab: string;
  minutes: number;
  src: MetricSource;
  reliable: boolean;
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  kind: 'primary' | 'third-party' | 'critique' | 'tracker';
}
