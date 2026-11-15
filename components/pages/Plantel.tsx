'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { E, ELink, EImg, EToggle, ESelect, Sec, useEditor, SafeImg, cx } from '@/components/editor/core';
import { Header, Footer, Arrow } from '@/components/site/ui';

const faceStyle = (p: any): React.CSSProperties => {
  const [x, y, z] = p.face || [50, 30, 1];
  // Leva o ponto (x, y) da cara ao centro do círculo. O zoom mínimo garante que a foto continua
  // a cobrir o círculo depois de deslocada (sem isto, caras junto à margem ficavam fora, ex.: Kevin Pina).
  const fx = Math.min(Math.max(x, 1), 99);
  const fy = Math.min(Math.max(y, 1), 99);
  const zoom = Math.max(z, 50 / fx, 50 / (100 - fx), 50 / fy, 50 / (100 - fy));
  return { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%`, transform: `translate(${50 - x}%, ${50 - y}%) scale(${zoom.toFixed(2)})`, display: 'block' };
};

function Face({ p }: { p: any }) {
  const ini = <span className="pt-ini">{p.ini}</span>;
  return <SafeImg src={p.photo?.src} alt="" style={faceStyle(p)} fallback={ini} />;
}

function FaceCtl({ i, p }: { i: number; p: any }) {
  const ed = useEditor();
  const f = p.face || [50, 30, 1];
  const set = (k: number, v: number) => { const n = f.slice(); n[k] = v; ed.set(`players.${i}.face`, n); };
  return (
    <div className="e-panel-inline">
      <div className="e-pi-h">Recorte redondo (campo e banco)</div>
      <label className="pt-range">X <input type="range" min={0} max={100} value={f[0]} onChange={(e) => set(0, +e.target.value)} /></label>
      <label className="pt-range">Y <input type="range" min={0} max={100} value={f[1]} onChange={(e) => set(1, +e.target.value)} /></label>
      <label className="pt-range">Zoom <input type="range" min={1} max={4} step={0.1} value={f[2]} onChange={(e) => set(2, +e.target.value)} /></label>
    </div>
  );
}

function PlayerEditor({ i }: { i: number }) {
  const ed = useEditor();
  const c = ed.content;
  const p = c.players[i];
  if (!ed.editing || !p) return null;
  const P = `players.${i}`;
  return (
    <div className="e-panel-inline">
      <div className="e-pi-h">Editar jogador</div>
      <div className="pt-edgrid">
        <span>Nome curto (campo): <E path={P + '.short'} /></span>
        <span>Iniciais: <E path={P + '.ini'} /></span>
        <span>Número: <E path={P + '.num'} placeholder="—" /></span>
        <span>Clube: <E path={P + '.club'} /></span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 8 }}>
        <ESelect path={P + '.pos'} label="Posição" options={Object.entries(c.plantel.posNames) as any} />
        <EToggle path={P + '.captain'} label="Capitão" />
        <EToggle path={P + '.strip'} label="Na faixa da homepage" />
        <label className="e-ctl"><input type="checkbox" checked={!!p.xi} onChange={(e) => ed.set(P + '.xi', e.target.checked ? [50, 50] : null)} /><span>No onze (senão vai para o banco)</span></label>
        <ESelect path={P + '.radar'} label="Edição do Radar" options={[['', '—'], ...c.editions.map((e: any) => [e.slug, `#${e.num} ${e.name}`])] as any} />
      </div>
      <FaceCtl i={i} p={p} />
      <div className="ap-actions" style={{ marginTop: 8 }}>
        <button type="button" className="e-add" onClick={() => { if (window.confirm('Apagar ' + p.name + '?')) ed.remove('players', i); }}>Apagar jogador</button>
        <button type="button" className="e-add" onClick={() => ed.move('players', i, -1)}>Mover para trás</button>
        <button type="button" className="e-add" onClick={() => ed.move('players', i, 1)}>Mover para a frente</button>
      </div>
    </div>
  );
}

export default function PlantelPage() {
  const ed = useEditor();
  const c = ed.content;
  const t = c.plantel;
  const players: any[] = c.players;
  const [pos, setPos] = useState('all');
  const [sel, setSel] = useState(() => Math.max(0, players.findIndex((p) => p.id === 'pico')));
  const [drawer, setDrawer] = useState(-1);
  const [n, setN] = useState(0);
  const pitchRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (drawer < 0) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(-1);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [drawer]);

  const si = Math.min(sel, players.length - 1);
  const s = players[si];
  const pick = (i: number) => { setSel(i); setN((x) => x + 1); };
  const visible = players.map((p, i) => ({ p, i })).filter(({ p }) => pos === 'all' || p.pos === pos);
  const posName = (k: string) => t.posNames[k] || k;
  const pct = (e: React.PointerEvent) => {
    const r = pitchRef.current!.getBoundingClientRect();
    return { x: Math.max(3, Math.min(97, Math.round(((e.clientX - r.left) / r.width) * 100))), y: Math.max(3, Math.min(97, Math.round(((e.clientY - r.top) / r.height) * 100))) };
  };
  const addPlayer = () => {
    const id = 'j' + Date.now().toString(36);
    ed.insert('players', players.length, { id, name: 'Novo jogador', short: 'Novo', ini: 'NJ', pos: pos === 'all' ? 'med' : pos, num: '', captain: false, xi: null, strip: false, photo: { src: '', alt: '', pos: '50% 30%', credit: '' }, face: [50, 30, 1], tag: 'Uma linha sobre o jogador.', bio: 'Biografia curta.', club: '[CLUBE]', radar: '' });
    setSel(players.length);
  };
  const d = drawer >= 0 ? players[drawer] : null;

  return (
    <div className="plantel" style={{ ['--mbase' as any]: '.5s', ['--base' as any]: '.7s' }}>
      {!ed.editing && (
        <div className="p-wipe" aria-hidden="true">
          <div style={{ left: 0, width: '34%', background: '#F7D116', animationDelay: '.05s' }} />
          <div style={{ left: '34%', width: '33%', background: '#0B3B8C', animationDelay: '.13s' }} />
          <div style={{ left: '67%', width: '33%', background: '#B3261E', animationDelay: '.21s' }} />
        </div>
      )}
      <Header />

      <section aria-labelledby="pl-h" className="p-hero">
        <div className="par p-hero-bg"><EImg path="plantel.heroPhoto" className="kb cover" alt="" /></div>
        <div aria-hidden="true" className="p-hero-grad" />
        <div className="wrap p-hero-in">
          <E as="p" path="plantel.kicker" className="fade kicker acc" style={{ ['--i' as any]: 0, marginBottom: 20 }} />
          <h1 id="pl-h" className="display p-title">
            <span className="mask p-t1" style={{ ['--i' as any]: 0 }}><E path="plantel.title" /></span>
            <span className="mask p-t2" style={{ ['--i' as any]: 2 }}><span><E path="plantel.subPre" /> <E path="plantel.subSerif" className="serif acc" /></span></span>
          </h1>
          <div className="fade p-hero-row" style={{ ['--i' as any]: 4 }}>
            <E as="p" path="plantel.text" className="p-hero-p" multiline />
            <ELink path="plantel.cta" className="btn pill pill-acc" style={{ padding: '16px 24px' }}><Arrow dir="down" /></ELink>
          </div>
          <E as="p" path="plantel.heroCredit" className="fade p-hero-c" style={{ ['--i' as any]: 5 }} />
        </div>
      </section>

      <section id="onze" aria-labelledby="xi-h" className="p-xi">
        <div className="wrap">
          <div className="sr h-sechead">
            <div>
              <E as="p" path="plantel.xiKicker" className="kicker" style={{ color: 'var(--muted3)', marginBottom: 14 }} />
              <h2 id="xi-h" className="display h-xl" style={{ color: '#fff' }}><E path="plantel.xiTitle" /><br /><E path="plantel.xiTitleSerif" className="serif acc" /></h2>
            </div>
            <div className="p-sysbox">
              <div><E as="div" path="plantel.systemLabel" className="p-sys-k" /><E as="div" path="plantel.system" className="p-sys-v" /></div>
              <div><E as="div" path="plantel.coachLabel" className="p-sys-k" /><E as="div" path="plantel.coach" className="p-sys-v" /></div>
            </div>
          </div>

          <div className="p-xi-row">
            <div className="p-pitch-col">
              <div ref={pitchRef} className={cx('p-pitch', ed.editing && 'pitch-edit')} role="group" aria-label="Campo com o onze inicial">
                <div aria-hidden="true" className="pl-line pl-mid" style={{ borderTopColor: 'rgba(255,255,255,.75)' }} />
                <div aria-hidden="true" className="pl-circle" style={{ width: '27%' }} />
                <div aria-hidden="true" className="p-spot" />
                <div aria-hidden="true" className="p-box p-box-t" />
                <div aria-hidden="true" className="p-box p-box-t2" />
                <div aria-hidden="true" className="p-box p-box-b" />
                <div aria-hidden="true" className="p-box p-box-b2" />
                <div aria-hidden="true" className="p-atk">Ataque ↑</div>
                {players.map((p, i) => {
                  if (!p.xi) return null;
                  const dd = drag && drag.i === i ? drag : null;
                  const x = dd ? dd.x : p.xi[0];
                  const y = dd ? dd.y : p.xi[1];
                  const on = i === si;
                  return (
                    <div key={p.id || i} className="p-tkwrap" style={{ transform: `translate(${x}%, ${y}%)` }}>
                      <div className="p-tkpos">
                        <button type="button" className={cx('tk', on && 'on')} onClick={() => pick(i)} aria-pressed={on} aria-label={`${p.name}, ${posName(p.pos)}`}
                          onPointerDown={ed.editing ? (e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setDrag({ i, ...pct(e) }); } : undefined}
                          onPointerMove={ed.editing ? (e) => { if (drag && drag.i === i) setDrag({ i, ...pct(e) }); } : undefined}
                          onPointerUp={ed.editing ? () => { if (drag && drag.i === i) { if (drag.x !== p.xi[0] || drag.y !== p.xi[1]) ed.set(`players.${i}.xi`, [drag.x, drag.y]); setDrag(null); pick(i); } } : undefined}>
                          <span className="tk-face-wrap">
                            {on && <span className="ring" aria-hidden="true" />}
                            <span className="tk-face" style={{ borderColor: on ? '#F7D116' : '#fff' }}><Face p={p} /></span>
                            {p.num && <span aria-hidden="true" className="tk-num">{p.num}</span>}
                          </span>
                          <span className="tk-name">{p.short}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <E as="p" path="plantel.pitchHint" className="p-hint" />
              {ed.editing && <span className="e-note">Arrasta os jogadores no campo para os reposicionar.</span>}
            </div>

            <div className="p-side">
              {s && (
                <article key={n} className="sel-in p-sel" aria-live="polite">
                  <div className="p-sel-img">
                    <EImg path={`players.${si}.photo`} className="cover" alt={s.name} label={s.ini} />
                    {s.photo?.credit && <span className="p-credit">Foto: {s.photo.credit}</span>}
                  </div>
                  <div className="p-sel-b">
                    <div className="p-sel-top"><span className="p-sel-pos">{posName(s.pos)}</span><span className="p-sel-num">{s.num || '—'}</span></div>
                    <E as="h3" path={`players.${si}.name`} className="display p-sel-name" />
                    <E as="p" path={`players.${si}.tag`} className="p-sel-tag" />
                    <E as="p" path={`players.${si}.bio`} className="p-sel-bio" multiline />
                    {s.radar && c.editions.some((e: any) => e.slug === s.radar) && <Link className="ul ul0 lnk" href={'/radar/' + s.radar} style={{ alignSelf: 'flex-start', fontSize: 14, padding: '10px 0' }}>{t.radarLink}</Link>}
                    {ed.editing && <span className="e-note">Texto do link: <E path="plantel.radarLink" /></span>}
                  </div>
                </article>
              )}
              <PlayerEditor i={si} />

              <section aria-labelledby="bench-h">
                <div className="p-bench-h">
                  <E as="h3" path="plantel.benchTitle" id="bench-h" className="display" style={{ fontSize: 30, color: '#fff' }} />
                  <E path="plantel.benchHint" className="p-bench-hint" />
                </div>
                <div className="p-bench">
                  {players.map((p, i) => p.xi ? null : (
                    <button key={p.id || i} type="button" className={cx('bench', i === si && 'on')} onClick={() => pick(i)} aria-pressed={i === si}>
                      <span className="bench-face"><Face p={p} /></span>
                      <span className="bench-t"><span className="bench-n">{p.name}</span><span className="bench-s">{p.tag}</span></span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section id="grelha" aria-labelledby="gr-h" className="p-grid-sec">
        <div className="wrap">
          <div className="h-sechead" style={{ marginBottom: 36 }}>
            <E as="h2" path={'plantel.groupTitles.' + pos} id="gr-h" className="sr display h-lg" style={{ color: '#fff' }} />
            <div role="group" aria-label="Filtrar por posição" className="chips">
              {Object.keys(t.filters).map((k) => {
                const count = players.filter((p) => k === 'all' || p.pos === k).length;
                return <button key={k} type="button" className={cx('chip p-chip', pos === k && 'on')} onClick={() => setPos(k)} aria-pressed={pos === k}><E path={'plantel.filters.' + k} /><span style={{ marginLeft: 8, opacity: .65 }}>{count}</span></button>;
              })}
            </div>
          </div>
          <div className="p-grid">
            {visible.map(({ p, i }, k) => (
              <button key={p.id || i} type="button" className="pc in" onClick={() => (ed.editing ? pick(i) : setDrawer(i))} aria-label={'Abrir ficha de ' + p.name} style={{ animationDelay: (k * 0.05).toFixed(2) + 's' }}>
                <div className="pc-img">
                  {p.photo?.src ? <SafeImg className="pimg" src={p.photo.src} alt="" style={{ objectPosition: p.photo.pos }} /> : (
                    <svg aria-hidden="true" viewBox="0 0 100 120" className="pc-sil"><circle cx="50" cy="38" r="20" fill="rgba(255,255,255,.12)" /><path d="M10 120c0-26 18-44 40-44s40 18 40 44z" fill="rgba(255,255,255,.12)" /></svg>
                  )}
                  <div aria-hidden="true" className="pc-grad" />
                  <span className="num" aria-hidden="true">{p.num || '—'}</span>
                  {p.captain && <span className="pc-cap">Capitão</span>}
                  <div className="pc-b">
                    <span className="pc-pos">{posName(p.pos)}</span>
                    <span className="pc-name">{p.name}</span>
                    <span className="pc-tag">{p.tag}</span>
                  </div>
                </div>
                <span className="bar" aria-hidden="true" />
              </button>
            ))}
            {pos === 'all' && !ed.editing && (
              <div className="p-more">
                <span className="p-more-t">{t.moreTitle}</span>
                <span className="p-more-p">{t.moreText}</span>
              </div>
            )}
            {ed.editing && (
              <div className="p-more">
                <button type="button" className="e-add" onClick={addPlayer}>+ Jogador</button>
                <span className="e-note">Clica num cartão para o editar no painel de cima.</span>
                <span className="e-note">Cartão final: <E path="plantel.moreTitle" /> · <E path="plantel.moreText" /></span>
              </div>
            )}
          </div>
        </div>
      </section>

      <Sec k="plantel.cta" label="Chamada final" aria-labelledby="cta-h" className="p-cta">
        <div className="wrap p-cta-in">
          <h2 id="cta-h" className="sr display p-cta-t"><E path="plantel.ctaTitle" multiline /> <E path="plantel.ctaSerif" className="serif" /></h2>
          <ELink path="plantel.cta2" className="btn sr pill pill-ink" style={{ padding: '18px 28px' }}><Arrow /></ELink>
        </div>
      </Sec>

      {d && !ed.editing && (
        <>
          <div className="dr-bg" onClick={() => setDrawer(-1)} aria-hidden="true" />
          <aside className="dr" role="dialog" aria-modal="true" aria-label={'Ficha de ' + d.name}>
            <div className="dr-img">
              {d.photo?.src ? <SafeImg src={d.photo.src} alt={d.name} className="cover" style={{ objectPosition: d.photo.pos }} /> : <span aria-hidden="true" className="dr-ini">{d.ini}</span>}
              <button type="button" onClick={() => setDrawer(-1)} aria-label="Fechar ficha" className="dr-x"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg></button>
              {d.photo?.credit && <span className="p-credit">Foto: {d.photo.credit}</span>}
            </div>
            <div className="dr-b">
              <span className="dr-pos">{posName(d.pos)}</span>
              <h3 className="display dr-name">{d.name}</h3>
              <p className="dr-tag">{d.tag}</p>
              <p className="dr-bio">{d.bio}</p>
              <dl className="dr-dl">
                <div><dt>Número</dt><dd>{d.num || '—'}</dd></div>
                <div><dt>Clube</dt><dd>{d.club || '—'}</dd></div>
              </dl>
              <div className="dr-nav">
                <button type="button" onClick={() => setDrawer((drawer - 1 + players.length) % players.length)}>← Anterior</button>
                <button type="button" className="on" onClick={() => setDrawer((drawer + 1) % players.length)}>Seguinte →</button>
              </div>
            </div>
          </aside>
        </>
      )}

      <Footer big="Plantel" back />
    </div>
  );
}
