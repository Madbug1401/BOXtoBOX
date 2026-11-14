'use client';
import { useAccent } from '@/components/editor/core';

/** Aplica a cor de destaque (editável) como variável CSS a todo o site. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const accent = useAccent();
  return <div className="site" style={{ ['--accent' as any]: accent }}>{children}</div>;
}
