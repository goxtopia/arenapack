import { useEffect, useState } from 'react';
import Starfield from './components/Starfield';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Observatory from './components/Observatory';
import Dossier from './components/Dossier';
import Acts from './components/Acts';
import BenchmarkMuseum from './components/BenchmarkMuseum';
import MetrHorizon from './components/MetrHorizon';
import PriceWar from './components/PriceWar';
import OpenClosed from './components/OpenClosed';
import Ledger from './components/Ledger';
import Showdown from './components/Showdown';
import Chronology from './components/Chronology';
import SourcesSection from './components/SourcesSection';
import type { ModelEntry } from './data/types';

const SECTIONS = [
  'observatory',
  'acts',
  'benchmarks',
  'metr',
  'price',
  'open',
  'ledger',
  'showdown',
  'chronology',
];

export default function App() {
  const [selected, setSelected] = useState<ModelEntry | null>(null);
  const [active, setActive] = useState('observatory');

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <div className="relative min-h-screen">
      <div className="grain pointer-events-none fixed inset-0 z-0 opacity-60" aria-hidden />
      <Starfield />
      <div className="relative z-10">
        <Nav active={active} />
        <main>
          <Hero />
          <Observatory onSelect={setSelected} selectedId={selected?.id ?? null} />
          <Acts onSelect={setSelected} />
          <BenchmarkMuseum />
          <MetrHorizon />
          <PriceWar onSelect={setSelected} />
          <OpenClosed />
          <Ledger />
          <Showdown onSelect={setSelected} />
          <Chronology onSelect={setSelected} />
          <SourcesSection />
        </main>
      </div>
      <Dossier model={selected} onClose={() => setSelected(null)} onSelect={setSelected} />
    </div>
  );
}
