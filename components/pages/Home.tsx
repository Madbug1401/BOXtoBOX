'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { E, ELink, EImg, EVideo, EList, ItemTools, EColor, EToggle, Sec, HrefLink, useEditor, SafeImg, useAccent, cx, rich } from '@/components/editor/core';
import { Header, Footer, Arrow, Star, Ball, Pitch, submitForm } from '@/components/site/ui';
import { Score, record } from '@/components/pages/Matches';

const ring = (n: number, size: string, delay0: number, step: number) =>
  Array.from({ length: n }, (_, i) => ({
    style: { position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(${i * 36}deg) translateY(calc(${size} * -0.46))` } as React.CSSProperties,
    delay: (delay0 + i * step).toFixed(2) + 's'
  }));

// Faixas da bandeira: [topo %, altura %, cor] (azul 6 : branco 1 : vermelho 1 : branco 1 : azul 3).
const FLAG: [number, number, string][] = [[0, 50, '#0B3B8C'], [50, 8.34, '#ffffff'], [58.33, 8.34, '#D7282F'], [66.66, 8.34, '#ffffff'], [75, 25, '#0B3B8C']];
// Duração total da abertura (ms): tem de bater com o fim de .intro em home.css (5.95s + 1.05s).
const INTRO_MS = 7050;

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
        <div className="i-mark" style={{ position: 'relative' }}>
          <div className="i-word">
            <span className="i-boxL">Box</span>
            <span className="serif i-to" style={{ color: accent }}>to</span>
            <span className="i-boxR">Box</span>
          </div>
          <svg viewBox="0 0 100 100" aria-hidden="true" className="i-svg">
            <circle className="i-cc" cx="50" cy="50" r="15" fill="none" stroke="#ffffff" strokeOpacity=".38" strokeWidth=".45" pathLength={1} />
            <circle className="i-wave" cx="50" cy="50" r="10" fill="none" stroke="#F7D116" strokeWidth=".8" />
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
      {/* Ato 2: a bandeira de Cabo Verde cobre o ecrã entre o nome e o logótipo. */}
      <div className="i-flag" aria-hidden="true">
        {FLAG.map((b, i) => <div key={i} className="i-fb" style={{ top: b[0] + '%', height: b[1] + '%', background: b[2], ['--d' as any]: i }} />)}
        <div className="i-fring">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="i-fstar" style={{ ['--a' as any]: i * 36 + 'deg', ['--d' as any]: i }}><Star size={24} fill="#F7D116" /></span>
          ))}
        </div>
      </div>
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
  const [rp, setRp] = useState(1);
  // Decide uma só vez se a abertura passa (o React em desenvolvimento corre os efeitos duas vezes).
  const introFirst = useRef<boolean | null>(null);

  useEffect(() => {
    if (!c.settings.intro || ed.editing) return setIntro(false);
    if (introFirst.current === null) {
      let seen = false;
      try { seen = sessionStorage.getItem('b2b-intro') === '1'; sessionStorage.setItem('b2b-intro', '1'); } catch {}
      introFirst.current = !seen;
    }
    if (!introFirst.current) return setIntro(false);
    const t = setTimeout(() => setIntro(false), INTRO_MS + 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ed.editing]);

  const showIntro = intro && !ed.editing && c.settings.intro;
  const base = showIntro ? '6.15s' : '.15s';
  const gTeam = c.jogos?.team || 'Cabo Verde';
  const allMatches: any[] = c.matches || [];
  const finals = allMatches.filter((m) => m.status === 'final');
  const lastMatch = finals[0];
  const nextMatch = allMatches.find((m) => m.status !== 'final');
  const gRec = record(allMatches, gTeam);
  const relLead = (c.articles || []).find((a: any) => (a.pillar || 'relvado') === 'relvado');
  const relIdx = relLead ? c.articles.indexOf(relLead) : -1;
  const relPhases = relLead?.board?.phases || [];
  const today = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const ticker = ed.editing ? h.ticker : [...h.ticker, ...h.ticker];
  const tags = ed.editing ? h.tags : [...h.tags, ...h.tags];

  const news: any[] = h.news?.items || [];
  const newsCard = (n: any, p: string, i: number) => (
    <HrefLink key={p} path={p + '.href'} className={cx('hf-n eitem', i === 0 ? 'hf-lead' : 'hf-item')} style={{ ['--i' as any]: i }}>
      <span className="hf-img ph">
        {n.video?.src ? (
          <video src={n.video.src} poster={n.video.poster || undefined} muted loop playsInline autoPlay preload="metadata" aria-label={n.title} />
        ) : n.photo?.src || ed.editing ? (
          <EImg path={p + '.photo'} className="cover" label=" " />
        ) : (
          <span className="hf-ph" aria-hidden="true"><Star size={i === 0 ? 64 : 28} fill={accent} /></span>
        )}
        {n.video?.src && <span className="hf-play" aria-hidden="true">▶ Vídeo</span>}
      </span>
      {i === 0 && !ed.editing && (
        // Selo: a revista assina a capa. O texto gira devagar; a bola fica parada no centro.
        <span className="hf-seal" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs><path id="hf-seal-c" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
            <circle cx="60" cy="60" r="58" fill="#061633" />
            <circle cx="60" cy="60" r="55" fill="none" stroke={accent} strokeWidth="1" />
            <g className="hf-seal-txt">
              <text fill="#ffffff" fontSize="8.6" fontWeight="800" letterSpacing="1.6" textLength="272" lengthAdjust="spacing"><textPath href="#hf-seal-c">BOX TO BOX · REVISTA DOS TUBARÕES AZUIS ·</textPath></text>
            </g>
            <g transform="translate(60 60) scale(1.55)"><Ball fill={accent} ink="#061633" id="hfs" /></g>
          </svg>
        </span>
      )}
      <span className="hf-b">
        {i > 0 && <span className="hf-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>}
        <E path={p + '.kicker'} className="hf-k" />
        <E path={p + '.title'} className="hf-t" />
        <E path={p + '.text'} className="hf-p" />
        {i === 0 && !ed.editing ? <span className="hf-go">Ler a notícia <Arrow size={16} /></span> : <E path={p + '.date'} className="hf-d" />}
      </span>
      <ItemTools />
    </HrefLink>
  );

  return (
    <div className="home" style={{ ['--base' as any]: base, ['--mbase' as any]: base }}>
      {showIntro && <Intro onSkip={() => setIntro(false)} />}
      <Header />

      {/* PRIMEIRA PÁGINA: notícias */}
      <Sec k="home.news" label="Notícias" id="top" aria-labelledby="news-h" className="hf">
        <div className="wrap">
          <div className="hf-mast fade" style={{ ['--i' as any]: 0 }}>
            <E as="p" path="home.news.kicker" className="kicker acc" />
            <span className="hf-date" suppressHydrationWarning>{today}</span>
            <nav aria-label="Secções" className="hf-sections">
              <a href="#jogos-w">Jogos</a><a href="#relvado-w">Relvado</a><a href="#rubricas-w">Rubricas</a>
            </nav>
          </div>
          {ed.editing ? (
            <div className="hf-grid">
              <div className="hf-head">
                <h1 id="news-h" className="display hf-title"><E path="home.news.title" /> <E path="home.news.titleSerif" className="serif" /></h1>
              </div>
              <EList path="home.news.items" newItem={{ kicker: 'Secção', title: 'Título da notícia', text: 'Resumo curto.', href: '/', date: '[DATA]', photo: { src: '', alt: '', pos: '50% 50%', credit: '' } }} addLabel="Notícia" render={(n, p, i) => newsCard(n, p, i)} />
            </div>
          ) : (
            <div className="hf-grid">
              {news[0] && newsCard(news[0], 'home.news.items.0', 0)}
              <aside className="hf-panel" aria-labelledby="news-h">
                <div className="hf-head">
                  <h1 id="news-h" className="display hf-title"><span className="mask"><span><E path="home.news.title" /></span></span><span className="mask" style={{ ['--i' as any]: 1 }}><span><E path="home.news.titleSerif" className="serif" /></span></span></h1>
                  <span className="hf-head-n" aria-hidden="true">{Math.max(0, news.length - 1)} histórias desta semana</span>
                </div>
                <div className="hf-list">
                  {news.slice(1).map((n: any, k: number) => newsCard(n, `home.news.items.${k + 1}`, k + 1))}
                </div>
              </aside>
            </div>
          )}
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

      {/* JOGOS (resumo) */}
      <Sec k="home.gamesW" label="Jogos" id="jogos-w" aria-labelledby="gw-h" className="hw-games">
        <div className="wrap">
          <div className="sr h-sechead" style={{ marginBottom: 36 }}>
            <div>
              <E as="p" path="home.gamesW.kicker" className="kicker" style={{ color: 'var(--muted3)', marginBottom: 14 }} />
              <h2 id="gw-h" className="display h-xl" style={{ color: '#fff' }}><E path="home.gamesW.title" /><br /><E path="home.gamesW.titleSerif" className="serif acc" /></h2>
            </div>
            <ELink path="home.gamesW.cta" className="btn pill pill-acc"><Arrow /></ELink>
          </div>
          <div className="hw-g-grid">
            {lastMatch && (
              <Link href={'/jogos/' + lastMatch.slug} className="hw-g-last sr">
                <span className="kicker acc">Último jogo · {rich(lastMatch.comp)}</span>
                <span className="hw-g-stage">{rich(lastMatch.stage)}{lastMatch.extra ? ` · ${lastMatch.extra}` : ''}</span>
                <Score m={lastMatch} team={gTeam} />
                <span className="hw-g-sum">{rich(lastMatch.summary)}</span>
                <span className="hw-g-go">Ficha do jogo <Arrow size={16} /></span>
              </Link>
            )}
            <div className="hw-g-list sr">
              {finals.slice(1, 4).map((m: any) => (
                <Link key={m.slug} href={'/jogos/' + m.slug} className="hw-g-row"><span className="hw-g-rs">{rich(m.stage)}</span><Score m={m} team={gTeam} /></Link>
              ))}
            </div>
            <div className="hw-g-side sr">
              <div className="hw-g-rec">
                {[['J', gRec.j], ['V', gRec.v], ['E', gRec.e], ['D', gRec.d], ['GM', gRec.gm], ['GS', gRec.gs]].map(([l, v]) => <div key={l as string}><strong>{v}</strong><span>{l}</span></div>)}
              </div>
              {nextMatch && (
                <Link href={'/jogos/' + nextMatch.slug} className="hw-g-next">
                  <span className="kicker acc">Próximo jogo</span>
                  <Score m={nextMatch} team={gTeam} />
                  <span className="hw-g-stage">{rich(nextMatch.date)} · {rich(nextMatch.city)}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Sec>

      {/* RELVADO (resumo) */}
      {relLead && (
        <Sec k="home.relvadoW" label="Relvado" id="relvado-w" aria-labelledby="rw-h" className="hw-rel">
          <div className="wrap hw-rel-in">
            <div className="hw-rel-text">
              <E as="p" path="home.relvadoW.kicker" className="sr kicker acc" style={{ marginBottom: 14 }} />
              <h2 id="rw-h" className="sr display h-xl" style={{ color: '#fff' }}><E path="home.relvadoW.title" /><br /><E path="home.relvadoW.titleSerif" className="serif acc" /></h2>
              <Link href={'/relvado/' + relLead.slug} className="sr hw-rel-a">
                <strong>{String(relLead.titleLines).replace(/\n/g, ' ')} <span className="serif">{relLead.titleSerif}</span></strong>
                <span>{relLead.summary || relLead.deck}</span>
              </Link>
              <div className="sr hw-rel-ms" role="group" aria-label="Momentos do jogo">
                {relPhases.map((ph: any, i: number) => (
                  <button key={i} type="button" className={cx('hw-rel-m', i === rp && 'on')} onClick={() => setRp(i)} aria-pressed={i === rp}><b>{String(i + 1).padStart(2, '0')}</b>{ph.label}</button>
                ))}
              </div>
              <p className="sr hw-rel-cap">{relPhases[rp]?.caption}</p>
              <ELink path="home.relvadoW.cta" className="btn pill pill-acc sr" style={{ marginTop: 24 }}><Arrow /></ELink>
            </div>
            <div className="sr hw-rel-board">
              {relPhases.length > 0 && <Pitch path={`articles.${relIdx}.board`} phase={Math.min(rp, relPhases.length - 1)} variant="home" />}
            </div>
          </div>
        </Sec>
      )}

      {/* RADAR */}
      <Sec k="home.radar" label="Rubricas" id="rubricas-w" aria-labelledby="radar-h" className="h-radar">
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
            <HrefLink path="home.radar.lead.href" className="card sr h-rlead">
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
              <EList path="home.radar.side" newItem={{ name: 'Nome', pos: 'POS', tag: 'Etiqueta', bg: '#0B3B8C', photo: { src: '', alt: '', pos: '50% 30%' }, text: 'Descrição.', href: '/rubricas' }} addLabel="Cartão" render={(r, p) => (
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

      <Newsletter />

      <Footer>
        {c.settings.intro && (
          <button type="button" className="btn ghost-btn" onClick={() => { window.scrollTo({ top: 0 }); setIntro(false); setTimeout(() => setIntro(true), 40); setTimeout(() => setIntro(false), INTRO_MS + 140); }}>
            <E path="settings.replayIntro" />
          </button>
        )}
      </Footer>
    </div>
  );
}
