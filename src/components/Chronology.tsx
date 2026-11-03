import { useMemo, useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { MODELS } from '../data/models';
import { LABS, LAB_BY_ID } from '../data/labs';
import type { ModelEntry } from '../data/types';
import {
  fmtDate,
  fmtParams,
  fmtCtx,
  fmtMinutes,
  labColor,
  LICENSE_META,
  KIND_META,
} from '../lib/utils';
import { SectionHead } from './Observatory';

type SortKey = 'date' | 'name' | 'price' | 'ctx' | 'params' | 'sweV' | 'metr';

const SORTS: { k: SortKey; label: string }[] = [
  { k: 'date', label: '日期' },
  { k: 'name', label: '名称' },
  { k: 'params', label: '参数' },
  { k: 'ctx', label: '上下文' },
  { k: 'price', label: '单价' },
  { k: 'sweV', label: 'SWE-V' },
  { k: 'metr', label: 'METR' },
];

const sortVal = (m: ModelEntry, k: SortKey): number | string => {
  switch (k) {
    case 'date':
      return m.date;
    case 'name':
      return m.name.toLowerCase();
    case 'price':
      return m.priceIn ?? Infinity;
    case 'ctx':
      return m.context ?? -1;
    case 'params':
      return m.paramsTotal ?? -1;
    case 'sweV':
      return m.benchmarks?.swebenchVerified?.v ?? -1;
    case 'metr':
      return m.benchmarks?.metrHorizon?.v ?? -1;
  }
};

function SrcDot({ m, k }: { m: ModelEntry; k: 'swebenchVerified' | 'hle' | 'arcagi2' | 'metrHorizon' }) {
  const met = m.benchmarks?.[k];
  if (!met) return <span className="text-slate-700">—</span>;
  const ind = met.src === 'independent';
  return (
    <span className="inline-flex items-center gap-1" title={met.note}>
      <span className="num text-slate-200">
        {k === 'metrHorizon' ? fmtMinutes(met.v) : `${met.v}%`}
      </span>
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${ind ? 'bg-indigo-400' : 'bg-amber-400/70'}`}
      />
    </span>
  );
}

export default function Chronology({ onSelect }: { onSelect: (m: ModelEntry) => void }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('date');
  const [dir, setDir] = useState<1 | -1>(1);
  const [labF, setLabF] = useState<string>('all');
  const [licF, setLicF] = useState<string>('all');

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = MODELS.filter((m) => {
      if (labF !== 'all' && m.lab !== labF) return false;
      if (licF === 'open' && !(m.license === 'MIT' || m.license === 'Apache-2.0')) return false;
      if (licF === 'closed' && m.license !== 'proprietary') return false;
      if (licF === 'gated' && m.license !== 'restricted') return false;
      if (licF === 'other' && !['Llama', 'Gemma', 'custom'].includes(m.license)) return false;
      if (!s) return true;
      return (
        m.name.toLowerCase().includes(s) ||
        m.id.includes(s) ||
        m.note.toLowerCase().includes(s) ||
        (m.tags ?? []).some((t) => t.toLowerCase().includes(s)) ||
        (LAB_BY_ID[m.lab]?.name.toLowerCase().includes(s) ?? false)
      );
    });
    list = [...list].sort((a, b) => {
      const va = sortVal(a, sort);
      const vb = sortVal(b, sort);
      if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir;
      return ((va as number) - (vb as number)) * dir;
    });
    return list;
  }, [q, sort, dir, labF, licF]);

  const stats = useMemo(() => {
    const withPrice = rows.filter((m) => m.priceIn !== undefined);
    const withBench = rows.filter((m) => m.benchmarks && Object.keys(m.benchmarks).length > 0);
    const indep = rows.filter((m) =>
      Object.values(m.benchmarks ?? {}).some((v) => v && (v as { src: string }).src === 'independent'),
    );
    return { withPrice: withPrice.length, withBench: withBench.length, indep: indep.length };
  }, [rows]);

  return (
    <section id="chronology" className="relative z-10 border-b border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <SectionHead
          kicker="MODULE 09 · FULL CHRONOLOGY"
          title="全量年表"
          desc={`${MODELS.length} 条记录，可搜索、可排序、可筛选。点击任意行打开完整档案。指标旁的色点表示来源：蓝 = 独立实测，琥珀 = 厂商公布。`}
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索模型名、实验室、标签或备注内容…"
              className="w-full rounded-lg border border-white/12 bg-[#0A0E1A] py-2 pl-9 pr-3 text-[12.5px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-teal-400/50"
            />
          </div>
          <select
            value={labF}
            onChange={(e) => setLabF(e.target.value)}
            className="rounded-lg border border-white/12 bg-[#0A0E1A] px-2.5 py-2 text-[12px] text-slate-300 outline-none focus:border-teal-400/50"
          >
            <option value="all">全部实验室</option>
            {LABS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            value={licF}
            onChange={(e) => setLicF(e.target.value)}
            className="rounded-lg border border-white/12 bg-[#0A0E1A] px-2.5 py-2 text-[12px] text-slate-300 outline-none focus:border-teal-400/50"
          >
            <option value="all">全部许可</option>
            <option value="open">MIT / Apache-2.0</option>
            <option value="other">Llama / Gemma / 自定义</option>
            <option value="closed">闭源 API</option>
            <option value="gated">受限发放</option>
          </select>
          <div className="flex items-center gap-1">
            <ArrowUpDown size={13} className="text-slate-600" />
            {SORTS.map((s) => (
              <button
                key={s.k}
                onClick={() => {
                  if (sort === s.k) setDir((d) => (d === 1 ? -1 : 1));
                  else {
                    setSort(s.k);
                    setDir(s.k === 'price' ? 1 : -1);
                  }
                }}
                className={`rounded px-2 py-1 font-mono text-[10px] transition ${
                  sort === s.k ? 'bg-teal-400/15 text-teal-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s.label}
                {sort === s.k && <span className="ml-0.5">{dir === 1 ? '↑' : '↓'}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-slate-600">
          <span>
            显示 <b className="text-slate-300">{rows.length}</b> / {MODELS.length} 条
          </span>
          <span>
            有公开定价 <b className="text-slate-300">{stats.withPrice}</b>
          </span>
          <span>
            有任一基准数据 <b className="text-slate-300">{stats.withBench}</b>
          </span>
          <span>
            含至少一项独立实测 <b className="text-indigo-400">{stats.indep}</b>
          </span>
          <span className="text-slate-700">
            · 数据缺口本身是信息：受限发放与未发布条目天然没有可比基准
          </span>
        </div>

        <div className="panel mt-3 overflow-hidden">
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#0C1120]">
                <tr className="border-b border-white/10 font-mono text-[9.5px] tracking-wider text-slate-500">
                  {['日期', '实验室', '模型', '类型', '许可', '参数', '上下文', '$/1M in·out', 'SWE-V', 'ARC-2', 'HLE', 'METR'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const c = labColor(m.lab);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => onSelect(m)}
                      className="cursor-pointer border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.045]"
                    >
                      <td className="num whitespace-nowrap px-3 py-2 font-mono text-[10.5px] text-teal-400/90">
                        {fmtDate(m.date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: c, boxShadow: `0 0 5px ${c}` }} />
                          <span className="font-mono text-[10px]" style={{ color: c }}>
                            {LAB_BY_ID[m.lab]?.short}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-[12px] font-medium text-slate-100">{m.name}</div>
                        <div className="mt-0.5 max-w-[380px] truncate text-[10px] text-slate-600">{m.note}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-[9.5px] text-slate-500">
                        {KIND_META[m.kind].glyph} {KIND_META[m.kind].label}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <span
                          className="rounded px-1.5 py-0.5 font-mono text-[9px]"
                          style={{ background: LICENSE_META[m.license].color + '1F', color: LICENSE_META[m.license].color }}
                        >
                          {LICENSE_META[m.license].label}
                        </span>
                      </td>
                      <td className="num whitespace-nowrap px-3 py-2 font-mono text-[10.5px] text-slate-400">
                        {fmtParams(m)}
                      </td>
                      <td className="num whitespace-nowrap px-3 py-2 font-mono text-[10.5px] text-slate-400">
                        {fmtCtx(m.context)}
                      </td>
                      <td className="num whitespace-nowrap px-3 py-2 font-mono text-[10.5px] text-slate-400">
                        {m.priceIn !== undefined ? `${m.priceIn} · ${m.priceOut}` : '—'}
                      </td>
                      <td className="num whitespace-nowrap px-3 py-2 font-mono text-[10.5px]">
                        <SrcDot m={m} k="swebenchVerified" />
                      </td>
                      <td className="num whitespace-nowrap px-3 py-2 font-mono text-[10.5px]">
                        <SrcDot m={m} k="arcagi2" />
                      </td>
                      <td className="num whitespace-nowrap px-3 py-2 font-mono text-[10.5px]">
                        <SrcDot m={m} k="hle" />
                      </td>
                      <td className="num whitespace-nowrap px-3 py-2 font-mono text-[10.5px]">
                        <SrcDot m={m} k="metrHorizon" />
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-3 py-12 text-center text-[12.5px] text-slate-500">
                      没有匹配的条目。试试更短的关键词，或清除筛选条件。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
