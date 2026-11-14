'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { E, ELink, EImg, EVideo, EList, ItemTools, EColor, EToggle, Sec, HrefLink, useEditor, SafeImg, useAccent, cx, rich } from '@/components/editor/core';
import { Header, Footer, Arrow, Star, Ball, Pitch, submitForm } from '@/components/site/ui';

const ring = (n: number, size: string, delay0: number, step: number) =>
  Array.from({ length: n }, (_, i) => ({
    style: { position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(${i * 36}deg) translateY(calc(${size} * -0.46))` } as React.CSSProperties,
    delay: (delay0 + i * step).toFixed(2) + 's'
  }));

function Intro({ onSkip }: { onSkip: () => void }) {
  const ed = useEditor();
  const it = ed.content.home.intro;
  const accent = useAccent();
  return (
    <div className="intro" role="presentation">
      <div className="i-line" aria-hidden="true" style={{ top: '50%' }} />
      <div className="i-line" aria-hidden="true" style={{ top: '18%', animationDelay: '.25s' }} />
      <div className="i-line" aria-hidden="true" style={{ top: '82%', animationDelay: '.35s' }} />
      {it.photo?.src && <SafeImg className="i-photo" src={it.photo.src} alt="" aria-hidden="true" style={{ objectPosition: it.photo.pos }} />}
      <div aria-hidden="true" className="i-ringbox">
        <div className="i-ring">
          {ring(10, 'min(440px, 78vw)', 0.25, 0.07).map((s, i) => (
            <div key={i} style={s.style}><Star size={26} fill="#F7D116" className="i-star" style={{ display: 'block', animationDelay: s.delay }} /></div>
          ))}
        </div>
      </div>
      <div className="i-center">
        <div style={{ position: 'relative' }}>
          <div className="i-word">
            <span className="i-boxL">Box</span>
            <span className="serif i-to" style={{ color: accent }}>to</span>
            <span className="i-boxR">Box</span>
          </div>
          <svg viewBox="0 0 100 100" aria-hidden="true" className="i-svg">
            <circle className="i-cc" cx="50" cy="50" r="15" fill="none" stroke="#ffffff" strokeOpacity=".38" strokeWidth=".45" pathLength={1} />
            <path className="i-br" d="M37 27H9V73H37" fill="none" stroke="#ffffff" strokeWidth="7" pathLength={1} />
            <path className="i-br" d="M63 27H91V73H63" fill="none" stroke="#ffffff" strokeWidth="7" pathLength={1} />
            <g transform="translate(50 50) scale(1.1)"><Ball fill="#F7D116" ink="#061633" id="ib" className="i-ball" /></g>
          </svg>
        </div>
        <p className="i-tag">{it.tagline}</p>
        <p className="i-meta">
          {(it.cities || []).map((c: string, i: number) => (
            <React.Fragment key={i}>{i > 0 && <span className="i-dash" />}<span>{c}</span></React.Fragment>
          ))}
        </p>
      </div>
      <div className="i-stripe" aria-hidden="true" style={{ top: '46%', background: '#ffffff', animationDelay: '2.45s' }} />
      <div className="i-stripe" aria-hidden="true" style={{ top: '49.2%', background: '#E03A3E', animationDelay: '2.53s' }} />
      <div className="i-stripe" aria-hidden="true" style={{ top: '52.4%', background: '#ffffff', animationDelay: '2.61s' }} />
      <button type="button" className="i-skip" onClick={onSkip}>{it.skip}</button>
    </div>
  );
}

function Newsletter() {
  const ed = useEditor();
  const n = ed.content.home.newsletter;
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ed.editing) return;
    setState('sending');
    try {
      await submitForm({ type: 'newsletter', email, website: (e.target as any).website?.value || '' });
      setState('ok');
    } catch (err) {
      setMsg((err as Error).message);
      setState('err');
    }
  };
  return (
    <Sec k="home.newsletter" label="Newsletter" id="newsletter" aria-labelledby="nl-h" className="h-nl">
      <div className="wrap h-nl-in">
        <h2 id="nl-h" className="display sr h-nl-t"><E path="home.newsletter.title" multiline /><br /><E path="home.newsletter.titleSerif" className="serif" /></h2>
        <form className="sr h-nl-f" onSubmit={send}>
          <label htmlFor="nl-email" className="kicker" style={{ letterSpacing: '.2em' }}><E path="home.newsletter.label" /></label>
          {state === 'ok' && !ed.editing ? (
            <p className="h-nl-ok" role="status">{n.thanks}</p>
          ) : (
            <div className="h-nl-row">
              <input id="nl-email" type="email" required placeholder={n.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
              <button type="submit" className="btn h-nl-b" disabled={state === 'sending'}><E path="home.newsletter.button" /></button>
            </div>
          )}
          {ed.editing && <span className="e-note">Mensagem de agradecimento: <E path="home.newsletter.thanks" /></span>}
          {state === 'err' && <p className="h-nl-err" role="alert">{msg}</p>}
        </form>
      </div>
    </Sec>
  );
}

export default function HomePage() {
  const ed = useEditor();
  const accent = useAccent();
  const c = ed.content;
  const h = c.home;
  const [intro, setIntro] = useState<boolean>(!!c.settings.intro);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!c.settings.intro || ed.editing) return setIntro(false);
    let seen = false;
    try { seen = sessionStorage.getItem('b2b-intro') === '1'; sessionStorage.setItem('b2b-intro', '1'); } catch {}
    if (seen) return setIntro(false);
    const t = setTimeout(() => setIntro(false), 5300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ed.editing]);

  const showIntro = intro && !ed.editing && c.settings.intro;
  const base = showIntro ? '4.1s' : '.15s';
  const phases = h.tactics.board.phases || [];
  const pi = Math.min(phase, Math.max(0, phases.length - 1));
  const team = h.campaign.team;
  const squad = c.players.filter((p: any) => p.strip);
  const words = String(c.settings.slogan || '').split(' ');
  const ticker = ed.editing ? h.ticker : [...h.ticker, ...h.ticker];
  const tags = ed.editing ? h.tags : [...h.tags, ...h.tags];
  const squadList = ed.editing ? squad : [...squad, ...squad];

  return (
    <div className="home" style={{ ['--base' as any]: base, ['--mbase' as any]: base }}>
      {showIntro && <Intro onSkip={() => setIntro(false)} />}
      <Header />

      {/* HERO */}
      <Sec k="home.hero" label="Destaque" id="top" className="h-hero">
        <div aria-hidden="true" className="par h-hero-ring"><svg className="spin-slow" viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth=".25" /><circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth=".25" strokeDasharray="1 1.6" /></svg></div>
        <div aria-hidden="true" className="h-hero-lines" />
        <div className="wrap h-hero-in">
          <div className="h-hero-text">
            <p className="fade kicker h-kicker" style={{ ['--i' as any]: 0 }}><span className="h-kbar" /><E path="home.hero.kicker" /></p>
            <h1 className="display h-title">
              <span className="mask h-t1" style={{ ['--i' as any]: 0 }}><E path="home.hero.line1" /></span>
              <span className="mask h-t2" style={{ ['--i' as any]: 1 }}><span><E path="home.hero.line2pre" /> <E path="home.hero.line2serif" className="serif" style={{ color: '#C9D6EE' }} /> <E path="home.hero.line2post" /></span></span>
              <span className="mask h-t2 acc" style={{ ['--i' as any]: 2 }}><E path="home.hero.line3" /></span>
            </h1>
            <E as="p" path="home.hero.lead" className="fade h-lead" style={{ ['--i' as any]: 5 }} multiline />
            <div className="fade h-ctas" style={{ ['--i' as any]: 6 }}>
              <ELink path="home.hero.cta1" className="btn pill pill-acc"><Arrow /></ELink>
              <ELink path="home.hero.cta2" className="btn pill pill-ghost"><Arrow /></ELink>
            </div>
          </div>
          <div className="fade h-hero-art" style={{ ['--i' as any]: 3 }}>
            <div className="h-ringbox">
              <div className="spin-mid" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
                {ring(10, 'min(400px, 78vw)', parseFloat(base) + 0.3, 0.06).map((s, i) => (
                  <div key={i} style={s.style}><Star size={30} fill={accent} className="h-star" style={{ display: 'block', animationDelay: s.delay }} /></div>
                ))}
              </div>
              <div className="ph h-circle"><EImg path="home.hero.photo" alt="" /></div>
              <div className="h-badge"><E path="home.hero.badgeNum" className="h-badge-n acc" /><E path="home.hero.badgeText" className="serif h-badge-t" /></div>
            </div>
          </div>
        </div>
        <div className="wrap" style={{ position: 'relative', marginTop: 72 }}>
          <div className="h-stats">
            <EList path="home.stats" newItem={{ value: '0', suffix: '', label: 'descrição', accent: false }} addLabel="Número" render={(s, p, i) => (
              <div className="fade h-stat eitem" style={{ ['--i' as any]: 7 + i }}>
                <div className="h-stat-n" style={{ color: s.accent ? accent : '#fff' }}><E path={p + '.value'} /><E path={p + '.suffix'} className="serif acc" /></div>
                <E as="div" path={p + '.label'} className="h-stat-l" />
                <EToggle path={p + '.accent'} label="cor de destaque" />
                <ItemTools />
              </div>
            )} />
          </div>
        </div>
      </Sec>

      {/* MARQUEE */}
      <Sec k="home.ticker" label="Faixas em movimento" as="div" className="h-marq" aria-hidden={ed.editing ? undefined : true}>
        <div className="marq-wrap h-marq-y">
          <div className="marq h-marq-y-in">
            {ed.editing ? (
              <EList path="home.ticker" newItem="Nova frase" addLabel="Frase" render={(_t, p) => (
                <span className="eitem h-marq-item"><E path={p} /><Star size={20} fill="#061633" /><ItemTools noDup /></span>
              )} />
            ) : ticker.map((t: string, i: number) => <span className="h-marq-item" key={i}>{t}<Star size={20} fill="#061633" /></span>)}
          </div>
        </div>
        <div className="h-marq-b">
          <div className="marq marq-r h-marq-b-in">
            {ed.editing ? (
              <EList path="home.tags" newItem="Etiqueta" addLabel="Etiqueta" render={(_t, p) => <span className="eitem" style={{ paddingRight: 44 }}><E path={p} /><ItemTools noDup /></span>} />
            ) : tags.map((t: string, i: number) => <span key={i} style={{ paddingRight: 44 }}>{t}</span>)}
          </div>
        </div>
      </Sec>

      {/* CAMPANHA */}
      <Sec k="home.campaign" label="A campanha" aria-labelledby="res-h" className="h-camp">
        <div className="wrap">
          <div className="sr h-sechead">
            <div>
              <E as="p" path="home.campaign.kicker" className="kicker" style={{ color: 'var(--muted3)', marginBottom: 14 }} />
              <h2 id="res-h" className="display h-xl" style={{ color: '#fff' }}><E path="home.campaign.title" /><br /><E path="home.campaign.titleSerif" className="serif acc" /></h2>
            </div>
            <ELink path="home.campaign.archive" className="ul ul0 lnk" style={{ fontSize: 14 }} />
          </div>
          {ed.editing && <span className="e-note">Equipa a realçar nos resultados: <E path="home.campaign.team" /></span>}
          <div className="h-rows">
            <EList path="home.campaign.matches" newItem={{ tag: 'Jogo', home: 'Cabo Verde', hs: '0', as: '0', away: 'Adversário', note: 'Nota do jogo.', highlight: false }} addLabel="Jogo" render={(m, p) => (
              <article className="row sr h-row eitem">
                <E as="div" path={p + '.tag'} className="h-row-tag" style={{ color: m.highlight ? accent : 'var(--muted3)' }} />
                <div className="h-row-score">
                  <E path={p + '.home'} className="h-team" style={{ textAlign: 'right', color: m.home === team ? accent : '#fff' }} />
                  <span className="sc h-sc"><E path={p + '.hs'} /><span className="h-sc-bar" /><E path={p + '.as'} /></span>
                  <E path={p + '.away'} className="h-team" style={{ color: m.away === team ? accent : '#fff' }} />
                </div>
                <E as="p" path={p + '.note'} className="h-row-note" />
                <EToggle path={p + '.highlight'} label="destacar" />
                <ItemTools />
              </article>
            )} />
          </div>
        </div>
      </Sec>

      {/* VÍDEO */}
      <Sec k="home.video" label="Vídeo" id="video" aria-labelledby="vid-h" className="h-video">
        <div aria-hidden="true" className="h-video-big">{h.video.bigWord}</div>
        <div className="wrap h-video-in">
          <div className="sr h-video-text">
            <p className="kicker h-video-k"><span className="h-dot" /><E path="home.video.kicker" /></p>
            <h2 id="vid-h" className="display h-video-t"><E path="home.video.title" /><br /><E path="home.video.titleSerif" className="serif" /></h2>
            <E as="p" path="home.video.text" className="h-video-p" multiline />
            <E as="p" path="home.video.credit" className="h-video-c" />
            {ed.editing && <span className="e-note">Palavra de fundo: <E path="home.video.bigWord" /></span>}
          </div>
          <div className="sr h-phone-wrap">
            <div className="tile h-phone"><EVideo path="home.video.video" className="h-phone-v" /></div>
          </div>
          <figure className="sr h-video-fig">
            <div className="tile ph h-polaroid"><EImg path="home.video.photo" /></div>
            <figcaption><strong><E path="home.video.captionStrong" /></strong> <E path="home.video.caption" /></figcaption>
          </figure>
        </div>
      </Sec>

      {/* BANDA FOTO */}
      <Sec k="home.band" label="Faixa de foto" aria-labelledby="band-h" className="ph h-band">
        <div className="par h-band-img"><EImg path="home.band.photo" /></div>
        <div aria-hidden="true" className="h-band-grad" />
        <div className="wrap h-band-in">
          <E as="p" path="home.band.kicker" className="sr kicker acc" style={{ marginBottom: 16 }} />
          <h2 id="band-h" className="sr display h-band-t"><E path="home.band.lines" multiline /><br /><E path="home.band.lineSerif" className="serif acc" /></h2>
          <ELink path="home.band.link" className="ul ul0 lnk" style={{ alignSelf: 'flex-start', marginTop: 28 }} />
        </div>
        <E as="span" path="home.band.photo.credit" className="credit" />
      </Sec>

      {/* MANIFESTO */}
      <Sec k="home.manifesto" label="Manifesto" id="sobre" aria-labelledby="sobre-h" className="h-man">
        <div aria-hidden="true" className="par h-man-big">{h.manifesto.bigWord}</div>
        <div className="wrap" style={{ position: 'relative' }}>
          <E as="p" path="home.manifesto.kicker" className="sr kicker" style={{ color: 'var(--red)', marginBottom: 28 }} />
          <h2 id="sobre-h" className="display h-man-slogan">
            {words.map((w, i) => {
              const a = 4 + i * (36 / words.length);
              return <span key={i} className="word" style={{ animationRange: `cover ${a.toFixed(1)}% cover ${(a + 14).toFixed(1)}%`, color: i === words.length - 1 ? 'var(--red)' : undefined } as any}>{w}</span>;
            })}
          </h2>
          {ed.editing && <span className="e-note">O slogan muda-se em Definições.</span>}
          <div className="h-man-cols">
            <E as="p" path="home.manifesto.lead" className="sr h-man-lead" multiline />
            <E as="p" path="home.manifesto.text" className="sr h-man-text" multiline />
            <div className="sr h-man-seal" aria-hidden={ed.editing ? undefined : true}>
              <svg className="spin-mid" viewBox="0 0 200 200"><defs><path id="ringp" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" /></defs><text fill="#061633" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: 3.6 }}><textPath href="#ringp">{h.manifesto.ringText}</textPath></text></svg>
              <div className="h-man-seal-img"><EImg path="home.manifesto.photo" alt="" /></div>
            </div>
          </div>
          {ed.editing && <span className="e-note">Texto circular: <E path="home.manifesto.ringText" /> · Palavra de fundo: <E path="home.manifesto.bigWord" /></span>}
          <div className="h-pillars">
            <EList path="home.manifesto.pillars" newItem={{ num: '04', name: 'Novo', text: 'Descrição.', href: '/', color: '#0B3B8C' }} addLabel="Pilar" render={(pp, p) => (
              <HrefLink path={p + '.href'} className="pill-row sr-l eitem" style={{ ['--c' as any]: pp.color }}>
                <E path={p + '.num'} className="pr-n" />
                <E path={p + '.name'} className="pn pr-name" />
                <E path={p + '.text'} className="pr-t" />
                <svg className="pa" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ transform: 'rotate(-45deg)' }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                <EColor path={p + '.color'} />
                <ItemTools />
              </HrefLink>
            )} />
          </div>
        </div>
      </Sec>

      {/* TÁTICA */}
      <Sec k="home.tactics" label="Tática" id="taticas" aria-labelledby="tat-h" className="h-tac">
        <div className="wrap h-tac-in">
          <figure className="sr h-tac-fig">
            <Pitch path="home.tactics.board" phase={pi} variant="home" />
            <E as="figcaption" path={`home.tactics.board.phases.${pi}.caption`} className="h-tac-cap" />
          </figure>
          <div className="h-tac-text">
            <E as="p" path="home.tactics.kicker" className="sr kicker acc" style={{ marginBottom: 18 }} />
            <h2 id="tat-h" className="sr display h-lg" style={{ color: '#fff' }}><E path="home.tactics.title" /><br /><E path="home.tactics.titleSerif" className="serif acc" /></h2>
            <E as="p" path="home.tactics.text" className="sr h-tac-p" multiline />
            <div className="sr h-modes" role="group" aria-label="Fase do jogo">
              {phases.map((ph: any, i: number) => (
                <button key={i} type="button" className={cx('mode', i === pi && 'on')} onClick={() => setPhase(i)} aria-pressed={i === pi}>
                  <E path={`home.tactics.board.phases.${i}.label`} />
                </button>
              ))}
            </div>
            <div className="h-notes">
              <EList path={`home.tactics.board.phases.${pi}.notes`} newItem={{ num: '0X', t: 'Título', d: 'Descrição.' }} addLabel="Nota" render={(_n, p) => (
                <div className="sr h-note eitem">
                  <E path={p + '.num'} className="h-note-n acc" />
                  <div>
                    <E as="div" path={p + '.t'} className="h-note-t" />
                    <E as="p" path={p + '.d'} className="h-note-d" />
                  </div>
                  <ItemTools />
                </div>
              )} />
            </div>
            <ELink path="home.tactics.link" className="ul ul0 lnk" style={{ display: 'inline-flex', marginTop: 28 }} />
          </div>
        </div>
      </Sec>

      {/* PLANTEL (faixa) */}
      <Sec k="home.squad" label="Faixa do plantel" aria-labelledby="sq-h" className="h-squad">
        <div className="wrap sr h-sechead" style={{ marginBottom: 36 }}>
          <h2 id="sq-h" className="display h-lg" style={{ color: '#fff' }}><E path="home.squad.title" /><br /><E path="home.squad.titleSerif" className="serif acc" /></h2>
          <ELink path="home.squad.cta" className="btn pill pill-acc" style={{ padding: '16px 24px' }}><Arrow /></ELink>
        </div>
        {ed.editing && <div className="wrap"><span className="e-note">Os jogadores desta faixa editam-se na página Plantel (opção "na faixa da homepage").</span></div>}
        <div className="marq-wrap">
          <div className="marq h-squad-in" style={{ animationDuration: '55s' }}>
            {squadList.map((s: any, i: number) => (
              <Link key={i} className="tile h-card" href="/plantel">
                {s.photo?.src ? <SafeImg src={s.photo.src} alt={s.name} className="cover" style={{ objectPosition: s.photo.pos }} /> : null}
                <span className="h-card-l">{s.name}<span className="acc">{c.plantel.posNames[s.pos] || s.pos}{s.captain ? ' · Capitão' : ''}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </Sec>

      {/* RADAR */}
      <Sec k="home.radar" label="Radar" id="radar" aria-labelledby="radar-h" className="h-radar">
        <div className="wrap">
          <div className="sr h-sechead" style={{ marginBottom: 56 }}>
            <div>
              <E as="p" path="home.radar.kicker" className="kicker" style={{ color: 'var(--red)', marginBottom: 14 }} />
              <h2 id="radar-h" className="display h-xl"><E path="home.radar.title" /><br /><E path="home.radar.titleSerif" className="serif" style={{ color: 'var(--red)' }} /></h2>
            </div>
            <div style={{ maxWidth: 380 }}>
              <E as="p" path="home.radar.text" className="h-radar-p" multiline />
              <ELink path="home.radar.cta" className="btn pill pill-ink" style={{ marginTop: 20, fontSize: 14, padding: '14px 22px' }}><Arrow size={16} /></ELink>
            </div>
          </div>
          <div className="h-radar-grid">
            <HrefLink path="home.radar.lead.href" className="card sr h-lead">
              <div className="clip-in h-lead-img">
                <EImg path="home.radar.lead.photo" className="big duo cover" />
                <E path="home.radar.lead.big" className="h-lead-big" aria-hidden="true" />
                <E path="home.radar.lead.photo.credit" className="credit" />
                <E path="home.radar.lead.badge" className="h-lead-badge" />
              </div>
              <div className="h-lead-body">
                <E as="h3" path="home.radar.lead.name" className="display h-lead-name" />
                <E as="p" path="home.radar.lead.text" className="h-lead-text" />
              </div>
            </HrefLink>
            <div className="h-side">
              <EList path="home.radar.side" newItem={{ name: 'Nome', pos: 'POS', tag: 'Etiqueta', bg: '#0B3B8C', photo: { src: '', alt: '', pos: '50% 30%' }, text: 'Descrição.', href: '/radar' }} addLabel="Cartão" render={(r, p) => (
                <HrefLink path={p + '.href'} className="card sr h-sidecard eitem">
                  <div className="h-sidecard-img" style={{ background: r.bg }}>
                    {(r.photo?.src || ed.editing) && <EImg path={p + '.photo'} className="big duo cover" label=" " />}
                    <E path={p + '.pos'} className="big h-sidecard-pos" aria-hidden="true" />
                    <EColor path={p + '.bg'} label="Fundo" />
                  </div>
                  <div className="h-sidecard-b">
                    <E path={p + '.tag'} className="h-sidecard-tag" />
                    <E as="h3" path={p + '.name'} className="display h-sidecard-name" />
                    <E as="p" path={p + '.text'} className="h-sidecard-text" />
                  </div>
                  <ItemTools />
                </HrefLink>
              )} />
            </div>
          </div>
        </div>
      </Sec>

      {/* HISTÓRIA */}
      <Sec k="home.history" label="História" id="historia" aria-labelledby="hist-h" className="h-hist">
        <div className="wrap">
          <E as="p" path="home.history.kicker" className="sr kicker acc" style={{ marginBottom: 14 }} />
          <h2 id="hist-h" className="sr display h-xl" style={{ color: '#fff', marginBottom: 72 }}><E path="home.history.title" /><br /><E path="home.history.titleSerif" className="serif acc" /></h2>
          <div className="h-hist-photos">
            <EList path="home.history.photos" newItem={{ photo: { src: '', alt: '', pos: '50% 50%', credit: '' }, caption: 'Legenda.' }} addLabel="Foto" render={(_f, p, i) => (
              <figure className={cx('ph clip-in eitem', i === 0 ? 'h-hist-a' : 'h-hist-b')}>
                <EImg path={p + '.photo'} />
                <E as="figcaption" path={p + '.caption'} className={i === 0 ? 'h-hist-cap' : 'h-hist-cap h-hist-cap-y'} />
                <E path={p + '.photo.credit'} className="credit" />
                <ItemTools />
              </figure>
            )} />
          </div>
          <div style={{ position: 'relative' }}>
            <div aria-hidden="true" className="h-tl-base" />
            <div className="grow h-tl-fill" aria-hidden="true" />
            <div className="h-tl">
              <EList path="home.history.timeline" newItem={{ y: 'Ano', d: 'Acontecimento.', dot: '#ffffff' }} addLabel="Marco" render={(e, p) => (
                <div className="tl sr h-tl-item eitem">
                  <div className="dot" aria-hidden="true" style={{ background: e.dot }} />
                  <E as="div" path={p + '.y'} className="yr" />
                  <E as="p" path={p + '.d'} className="h-tl-d" />
                  <EColor path={p + '.dot'} label="Ponto" />
                  <ItemTools />
                </div>
              )} />
            </div>
          </div>
        </div>
      </Sec>

      {/* DIÁSPORA */}
      <Sec k="home.diaspora" label="Diáspora" id="diaspora" aria-labelledby="dia-h" className="h-dia">
        <div className="wrap h-dia-in">
          <div className="sr h-dia-text">
            <figure className="ph h-dia-fig"><EImg path="home.diaspora.photo" /><E path="home.diaspora.photo.credit" className="credit" /></figure>
            <E as="p" path="home.diaspora.kicker" className="kicker acc" style={{ marginBottom: 14 }} />
            <h2 id="dia-h" className="display h-dia-t"><E path="home.diaspora.titlePre" /> <E path="home.diaspora.titleSerif" className="serif" style={{ color: 'var(--muted)' }} /> <E path="home.diaspora.titlePost" /></h2>
            <E as="p" path="home.diaspora.text" className="h-dia-p" multiline />
            <div className="h-chips">
              <EList path="home.diaspora.countries" newItem="País" addLabel="País" render={(_x, p) => <span className="chip-o eitem"><E path={p} /><ItemTools noDup /></span>} />
            </div>
            <ELink path="home.diaspora.link" className="ul ul0 lnk" style={{ display: 'inline-flex', marginTop: 26 }} />
          </div>
          <div className="h-dia-ig">
            <div className="sr h-dia-ighead">
              <span className="h-dia-iglabel"><E path="home.diaspora.igLabel" /> {rich(c.settings.instagram)}</span>
              <ELink path="home.diaspora.igLink" className="ul ul0 lnk" style={{ fontSize: 14 }} />
            </div>
            <div className="h-posts">
              <EList path="home.diaspora.posts" newItem={{ kicker: 'Tipo', title: 'Título do post', bg: '#0B3B8C', fg: '#ffffff' }} addLabel="Post" render={(po, p, i) => (
                <div className="tile sr h-post eitem" style={{ background: po.bg, color: po.fg, marginTop: i % 3 === 1 ? 36 : 0 }}>
                  <E path={p + '.kicker'} className="h-post-k" />
                  <E path={p + '.title'} className="h-post-t" />
                  <span style={{ display: 'flex', flexWrap: 'wrap' }}><EColor path={p + '.bg'} label="Fundo" /><EColor path={p + '.fg'} label="Texto" /></span>
                  <ItemTools />
                </div>
              )} />
            </div>
          </div>
        </div>
      </Sec>

      <Newsletter />

      <Footer>
        {c.settings.intro && (
          <button type="button" className="btn ghost-btn" onClick={() => { window.scrollTo({ top: 0 }); setIntro(false); setTimeout(() => setIntro(true), 40); setTimeout(() => setIntro(false), 5340); }}>
            <E path="settings.replayIntro" />
          </button>
        )}
      </Footer>
    </div>
  );
}
