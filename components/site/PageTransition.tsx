'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEditor } from '@/components/editor/core';
import { Star } from './ui';

/*
 * Transição entre páginas: a bandeira de Cabo Verde.
 *
 * Ao clicar numa ligação interna, as faixas da bandeira (azul, branco, vermelho, branco, azul,
 * nas proporções reais 6:1:1:1:3) entram da esquerda como um pano a desdobrar-se e o círculo das
 * dez estrelas acende-se, estrela a estrela, com o nome da secção de destino no meio.
 * Só depois de a bandeira tapar o ecrã é que a navegação acontece; quando a página nova chega,
 * as faixas saem pela direita e destapam-na. Se a página demorar, a bandeira fica — serve de "a carregar".
 *
 * Não interfere com: links externos, novos separadores, Ctrl/Cmd+clique, âncoras na mesma página,
 * modo edição do admin e prefers-reduced-motion.
 */
const BANDS = [
  { top: 0, h: 50, c: 'var(--pt-blue)' },
  { top: 50, h: 8.34, c: '#ffffff' },
  { top: 58.33, h: 8.34, c: 'var(--pt-red)' },
  { top: 66.66, h: 8.34, c: '#ffffff' },
  { top: 75, h: 25, c: 'var(--pt-blue)' }
];
const IN_MS = 620;
const OUT_MS = 950;

export function PageTransition() {
  const ed = useEditor();
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');
  const [label, setLabel] = useState('');
  const from = useRef(pathname);
  const timers = useRef<number[]>([]);
  const nav = ed.content.settings?.nav || [];
  const navRef = useRef(nav);
  navRef.current = nav;

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  useEffect(() => {
    if (ed.editing) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (url.pathname.startsWith('/api') || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return;
      e.preventDefault();
      const seg = '/' + (url.pathname.split('/')[1] || '');
      const hit = navRef.current.find((n: any) => (n.href || '').split('#')[0] === (seg === '/' ? '/' : seg));
      setLabel(hit?.label || (seg === '/' ? 'Home' : ''));
      timers.current.forEach(clearTimeout);
      timers.current = [];
      from.current = location.pathname;
      setPhase('in');
      later(() => router.push(url.pathname + url.search + url.hash), IN_MS);
      // Rede de segurança: se a navegação falhar, nunca deixar o ecrã tapado.
      later(() => setPhase((p) => (p === 'in' ? 'out' : p)), 6000);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [ed.editing, router]);

  // A página nova chegou: destapar.
  useEffect(() => {
    if (phase === 'in' && pathname !== from.current) {
      const t = window.setTimeout(() => setPhase('out'), 80);
      return () => clearTimeout(t);
    }
  }, [pathname, phase]);

  useEffect(() => {
    if (phase !== 'out') return;
    const t = window.setTimeout(() => setPhase('idle'), OUT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (phase === 'idle') return null;
  return (
    <div className={'pt pt-' + phase} aria-hidden="true">
      {BANDS.map((b, i) => (
        <div key={i} className="pt-band" style={{ top: b.top + '%', height: b.h + '%', background: b.c, ['--d' as any]: i }} />
      ))}
      <div className="pt-ring">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="pt-star" style={{ ['--a' as any]: i * 36 + 'deg', ['--d' as any]: i }}>
            <Star size={22} fill="#F7D116" />
          </span>
        ))}
        {label && <span className="pt-label">{label}</span>}
      </div>
    </div>
  );
}
