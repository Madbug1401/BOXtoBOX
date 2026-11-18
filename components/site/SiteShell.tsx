'use client';
import { useAccent } from '@/components/editor/core';
import { RevealFallback } from './RevealFallback';
import { PageTransition } from './PageTransition';

/** Aplica a cor de destaque (editável) como variável CSS a todo o site. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const accent = useAccent();
  return (
    <div className="site" style={{ ['--accent' as any]: accent }}>
      <RevealFallback />
      <PageTransition />
      {children}
    </div>
  );
}
