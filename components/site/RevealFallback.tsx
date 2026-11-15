'use client';
import { useEffect } from 'react';

/**
 * As animações de scroll usam CSS `animation-timeline` (Chrome/Edge).
 * Nos browsers sem suporte (Firefox, Safari antigo) este componente reproduz o mesmo efeito
 * com IntersectionObserver; também move a barra de progresso de leitura (.prog).
 * Não faz nada com prefers-reduced-motion nem quando o browser já suporta as timelines.
 */
export function RevealFallback() {
  useEffect(() => {
    const w = window;
    const d = document;
    if (w.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const ok = (q: string) => !!(w.CSS && CSS.supports && CSS.supports(q));
    const cleanups: Array<() => void> = [];

    if (!ok('animation-timeline: scroll()')) {
      const upd = () => {
        const prog = d.querySelector<HTMLElement>('.prog');
        if (!prog) return;
        const s = d.scrollingElement || d.documentElement;
        const m = s.scrollHeight - s.clientHeight;
        prog.style.transform = 'scaleX(' + (m > 0 ? Math.min(1, s.scrollTop / m) : 0) + ')';
      };
      w.addEventListener('scroll', upd, { passive: true });
      upd();
      cleanups.push(() => w.removeEventListener('scroll', upd));
    }

    if (ok('animation-timeline: view()') || !('IntersectionObserver' in w)) return () => cleanups.forEach((f) => f());

    const seen = new WeakSet<Element>();
    const timers: number[] = [];
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        io.unobserve(el);
        if (el.classList.contains('word') && el.parentNode) {
          el.style.transitionDelay = Array.prototype.indexOf.call(el.parentNode.children, el) * 0.07 + 's';
        }
        el.classList.add('rv-go');
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('rv-pre')));
        timers.push(w.setTimeout(() => { el.classList.remove('rv-go'); el.style.transitionDelay = ''; }, 1800));
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    const scan = () => d.querySelectorAll('.sr,.sr-l,.word,.grow,.clip-in,.tk-in').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.classList.add('rv-pre');
      io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(d.body, { childList: true, subtree: true });

    return () => {
      cleanups.forEach((f) => f());
      io.disconnect();
      mo.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);
  return null;
}
