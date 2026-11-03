import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  hue: number;
  tw: number;
  vx: number;
  vy: number;
}

/** 全站背景：极慢漂移的深空星场 + 潜在空间噪点 */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(320, Math.floor((w * h) / 5200));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        r: 0.3 + Math.random() * 1.5,
        hue: [186, 222, 265, 32, 15][Math.floor(Math.random() * 5)],
        tw: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.045,
        vy: (Math.random() - 0.5) * 0.045,
      }));
    };

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      // 深层辉光
      const g1 = ctx.createRadialGradient(w * 0.18, h * 0.12, 0, w * 0.18, h * 0.12, w * 0.55);
      g1.addColorStop(0, 'rgba(45,212,191,0.055)');
      g1.addColorStop(1, 'rgba(45,212,191,0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.86, h * 0.72, 0, w * 0.86, h * 0.72, w * 0.5);
      g2.addColorStop(0, 'rgba(129,140,248,0.05)');
      g2.addColorStop(1, 'rgba(129,140,248,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        if (!reduce) {
          s.x += s.vx * (0.3 + s.z);
          s.y += s.vy * (0.3 + s.z);
          if (s.x < -4) s.x = w + 4;
          if (s.x > w + 4) s.x = -4;
          if (s.y < -4) s.y = h + 4;
          if (s.y > h + 4) s.y = -4;
        }
        const a = (0.16 + 0.6 * s.z) * (0.55 + 0.45 * Math.sin(t * 1.6 + s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.5 + s.z), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 82%, ${62 + s.z * 20}%, ${a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    build();
    draw();
    window.addEventListener('resize', build);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', build);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
