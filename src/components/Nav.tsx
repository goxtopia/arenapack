import { LABS } from '../data/labs';
import { MODELS } from '../data/models';

const NAV = [
  { id: 'observatory', label: '星图观测台' },
  { id: 'acts', label: '五幕编年' },
  { id: 'benchmarks', label: '基准博物馆' },
  { id: 'metr', label: '自主时长曲线' },
  { id: 'price', label: '智能价格战' },
  { id: 'open', label: '开源 / 闭源' },
  { id: 'ledger', label: '祛魅账本' },
  { id: 'showdown', label: '跨代对决' },
  { id: 'chronology', label: '全量年表' },
];

export default function Nav({ active }: { active: string }) {
  const openCount = MODELS.filter((m) => m.license === 'MIT' || m.license === 'Apache-2.0').length;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#05070E]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-2.5 lg:px-8">
        <a href="#top" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-md bg-gradient-to-br from-teal-400/40 to-indigo-500/40 blur-[6px]" />
            <span className="relative font-mono text-[11px] font-bold tracking-tighter text-teal-300">LE</span>
          </span>
          <span className="hidden font-mono text-[11px] font-semibold tracking-[0.18em] text-slate-300 sm:block">
            LATENT<span className="text-teal-400">·</span>EPOCH
          </span>
        </a>

        <nav className="scrollbar-none flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] transition-colors lg:text-xs ${
                active === n.id
                  ? 'bg-white/[0.08] text-teal-200'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 font-mono text-[10px] text-slate-500 xl:flex">
          <span>
            <b className="text-slate-300">{MODELS.length}</b> 条目
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span>
            <b className="text-emerald-400">{openCount}</b> 开源权重
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span>
            <b className="text-slate-300">{LABS.length}</b> 实验室
          </span>
        </div>
      </div>
    </header>
  );
}
