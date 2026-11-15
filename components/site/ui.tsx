'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { E, ELink, EList, ItemTools, EToggle, cx, useEditor, useAccent, SmartLink } from '@/components/editor/core';
import { getIn } from '@/lib/paths';

export const Arrow = ({ size = 18, dir = 'right' }: { size?: number; dir?: 'right' | 'down' | 'left' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="arr">
    {dir === 'right' && <path d="M5 12h14M13 6l6 6-6 6" />}
    {dir === 'left' && <path d="M19 12H5M11 6l-6 6 6 6" />}
    {dir === 'down' && <path d="M12 5v14M6 13l6 6 6-6" />}
  </svg>
);

export const Star = ({ size = 20, fill = '#061633', className, style }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
    <polygon points="12,1.5 14.9,8.6 22.5,9.1 16.6,14 18.5,21.5 12,17.4 5.5,21.5 7.4,14 1.5,9.1 9.1,8.6" fill={fill} />
  </svg>
);

const PENT = '0,-3.6 3.424,-1.112 2.116,2.912 -2.116,2.912 -3.424,-1.112';
export function Ball({ fill, ink, id, className }: { fill: string; ink: string; id: string; className?: string }) {
  return (
    <g className={className}>
      <clipPath id={id}><circle r="9" /></clipPath>
      <circle r="9" fill={fill} />
      <g clipPath={`url(#${id})`} fill={ink}>
        <polygon points={PENT} />
        {[36, 108, 180, 252, 324].map((a) => <polygon key={a} transform={`rotate(${a}) translate(0 -9.8) scale(.9 -.9)`} points={PENT} />)}
      </g>
      <g stroke={ink} strokeWidth=".8">
        <line x1="0" y1="-3.6" x2="0" y2="-9" /><line x1="3.424" y1="-1.112" x2="8.56" y2="-2.78" /><line x1="2.116" y1="2.912" x2="5.29" y2="7.28" /><line x1="-2.116" y1="2.912" x2="-5.29" y2="7.28" /><line x1="-3.424" y1="-1.112" x2="-8.56" y2="-2.78" />
      </g>
    </g>
  );
}

export function LogoMark({ stroke = '#ffffff', fill, ink = '#061633', size = 40 }: { stroke?: string; fill: string; ink?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M37 27H9V73H37" fill="none" stroke={stroke} strokeWidth="10" />
      <path d="M63 27H91V73H63" fill="none" stroke={stroke} strokeWidth="10" />
      <g transform="translate(50 50)"><circle r="12" fill={fill} /><polygon transform="scale(1.35)" points={PENT} fill={ink} /></g>
    </svg>
  );
}

export function Wordmark({ toColor, className }: { toColor: string; className?: string }) {
  return (
    <span className={cx('wordmark', className)}>Box<span className="serif" style={{ color: toColor }}>to</span>Box</span>
  );
}

// ---------------------------------------------------------------------------
export function Header({ theme = 'dark', mark, ctaPath = 'settings.cta' }: { theme?: 'dark' | 'light'; mark?: string; ctaPath?: string }) {
  const ed = useEditor();
  const accent = useAccent();
  const pathname = usePathname();
  const light = theme === 'light';
  const markColor = mark || (light ? '#B3261E' : accent);
  return (
    <header className={cx('site-header', light ? 'hdr-light' : 'hdr-dark')}>
      <div className="wrap hdr-in">
        <Link href="/" className="brand" aria-label={ed.content.settings.siteName + ' — início'}>
          <LogoMark stroke={light ? '#061633' : '#ffffff'} fill={markColor} ink={light ? '#F4F1E8' : '#061633'} />
          <Wordmark toColor={markColor} />
        </Link>
        <nav aria-label="Secções" className="hdr-nav">
          <EList path="settings.nav" newItem={{ label: 'Nova', href: '/' }} addLabel="Ligação" render={(item, p) => {
            const active = item.href && !item.href.includes('#') && item.href !== '/' && pathname.startsWith(item.href);
            return (
              <span className="eitem nav-item">
                <ELink path={p} className={cx('ul', active && 'is-active')} style={active && light ? { color: markColor } : undefined} aria-current={active ? 'page' : undefined} />
                <ItemTools noDup />
              </span>
            );
          }} />
          <ELink path={ctaPath} className={cx('btn hdr-cta', light && 'btn-ink')}  />
        </nav>
      </div>
    </header>
  );
}

export function Socials() {
  const s = useEditor().content.settings.socials || {};
  const items = [
    ['instagram', 'Instagram', <svg key="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>],
    ['tiktok', 'TikTok', <svg key="t" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.5 2.5 4.5 5 5" /></svg>],
    ['x', 'X', <svg key="x" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20" /></svg>]
  ] as const;
  return (
    <nav aria-label="Redes sociais" className="socials">
      {items.map(([k, label, icon]) => (
        <SmartLink key={k} href={s[k] || '#'} aria-label={label} className="btn soc">{icon}</SmartLink>
      ))}
    </nav>
  );
}

export function Footer({ big, children, back }: { big?: string; children?: React.ReactNode; back?: boolean }) {
  const ed = useEditor();
  const accent = useAccent();
  const st = ed.content.settings;
  return (
    <footer className="site-footer">
      <div className="wrap ft-in">
        <div className="ft-text">
          {back && <Link href="/" className="ul ft-back">← Voltar à homepage</Link>}
          <span className="ft-line"><span>{st.slogan}</span> · <E path="settings.footerLine" /></span>
          <E as="span" path="settings.credits" className="ft-credits" multiline />
        </div>
        <div className="ft-actions">
          {children}
          <Socials />
        </div>
      </div>
      {big !== undefined ? (
        <div aria-hidden="true" className="ft-big sr">{big}</div>
      ) : (
        <>
          <div className="sr ft-ball" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <line x1="50" y1="4" x2="50" y2="96" stroke="#0B1E44" strokeWidth=".5" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="#12295A" strokeWidth=".6" />
              <path d="M37 27H9V73H37" fill="none" stroke="#0B1E44" strokeWidth="7" />
              <path d="M63 27H91V73H63" fill="none" stroke="#0B1E44" strokeWidth="7" />
              <g transform="translate(50 50) scale(1.1)"><Ball fill={accent} ink="#040F24" id="fb" /></g>
            </svg>
          </div>
          <div className="sr ft-big ft-word" aria-hidden="true">Box<span className="serif" style={{ color: accent }}>to</span>Box</div>
        </>
      )}
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Campo tático. Os jogadores arrastam-se no modo edição.
export function Pitch({ path, phase, variant = 'home', label }: { path: string; phase: number; variant?: 'home' | 'article'; label?: string }) {
  const ed = useEditor();
  const accent = useAccent();
  const board = getIn(ed.content, path) || { phases: [] };
  const ph = board.phases[phase] || board.phases[0];
  const pi = board.phases[phase] ? phase : 0;
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null);
  if (!ph) return null;
  const playersPath = `${path}.phases.${pi}.players`;
  const hotColor = variant === 'article' ? '#F7D116' : accent;

  const pct = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: Math.max(2, Math.min(98, Math.round(((e.clientX - r.left) / r.width) * 100))), y: Math.max(2, Math.min(98, Math.round(((e.clientY - r.top) / r.height) * 100))) };
  };

  return (
    <>
      <div ref={ref} className={cx('pitch', 'pitch-' + variant, ed.editing && 'pitch-edit')} role="img" aria-label={label || 'Campo tático: ' + ph.title}>
        <div aria-hidden="true" className="pl-line pl-mid" />
        <div aria-hidden="true" className="pl-circle" />
        <div aria-hidden="true" className="pl-box pl-top" />
        <div aria-hidden="true" className="pl-box pl-bot" />
        <div aria-hidden="true" className="pl-band" style={{ opacity: ph.band ? 1 : 0, transform: `scaleY(${ph.band ? 1 : 0.4})` }} />
        {(ph.players || []).map((p: any, i: number) => {
          const d = drag && drag.i === i ? drag : null;
          const x = d ? d.x : p.x;
          const y = d ? d.y : p.y;
          return (
            <div key={i} className="pl" style={{ transform: `translate(${x}%, ${y}%)`, transitionDelay: d ? '0s' : `${(i * 0.035).toFixed(3)}s`, transitionDuration: d ? '0s' : undefined }}>
              <div className="pl-in">
                <div
                  className="pl-dot"
                  style={{ background: p.hot ? hotColor : '#0B3B8C', color: p.hot ? '#061633' : '#ffffff' }}
                  onPointerDown={ed.editing ? (e) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); setDrag({ i, ...pct(e) }); } : undefined}
                  onPointerMove={ed.editing ? (e) => { if (drag && drag.i === i) setDrag({ i, ...pct(e) }); } : undefined}
                  onPointerUp={ed.editing ? () => { if (drag && drag.i === i) { ed.set(`${playersPath}.${i}`, { ...p, x: drag.x, y: drag.y }); setDrag(null); } } : undefined}
                  title={ed.editing ? 'Arrasta para mudar a posição' : undefined}
                >{p.ini}</div>
                <div className="pl-name">{p.name}</div>
              </div>
            </div>
          );
        })}
      </div>
      {ed.editing && (
        <div className="e-panel-inline">
          <div className="e-pi-h">Jogadores nesta fase — arrasta-os no campo; em amarelo = destaque</div>
          <div className="e-pi-grid">
            <EList path={playersPath} newItem={{ ini: 'NV', name: 'Novo', x: 50, y: 50, hot: false }} addLabel="Jogador" render={(_p, pp) => (
              <div className="eitem e-pi-row">
                <E path={pp + '.ini'} className="e-pi-ini" />
                <E path={pp + '.name'} className="e-pi-name" />
                <EToggle path={pp + '.hot'} label="destaque" />
                <ItemTools noDup />
              </div>
            )} />
          </div>
          <div className="e-pi-h">Fase: <EToggle path={`${path}.phases.${pi}.band`} label="mostrar faixa do bloco médio" /></div>
        </div>
      )}
    </>
  );
}

/** Formulário público (newsletter / sugestão) */
export async function submitForm(data: Record<string, string>) {
  const res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'Não foi possível enviar.');
  return j;
}
