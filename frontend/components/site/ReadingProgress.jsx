'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress({ targetId = 'article-content' }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const read = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), Math.max(total, 1));
      setPct(total > 0 ? (read / total) * 100 : 0);
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent" aria-hidden="true">
      <div className="h-full bg-post transition-[width] duration-100" style={{ width: `${pct}%` }} />
    </div>
  );
}
