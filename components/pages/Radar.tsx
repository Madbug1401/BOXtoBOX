'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { E, ELink, EImg, EList, ItemTools, EColor, ESelect, Sec, HrefLink, CardLink, useEditor, SafeImg, cx, rich } from '@/components/editor/core';
import { Header, Footer, Arrow, Star, submitForm } from '@/components/site/ui';
import { withScoutFallback } from '@/lib/tactics';
import { seed } from '@/lib/seed';

function Suggest() {
  const ed = useEditor();
  const s = ed.content.rubrica.suggest;
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [why, setWhy] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ed.editing) return;
    setBusy(true);
    setErr('');
    try {
      await submitForm({ type: 'sugestao', name, why, website: (e.target as any).website?.value || '' });
      setSent(true);
      setName('');
      setWhy('');
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sec k="radar.suggest" label="Sugerir um nome" id="sugerir" aria-labelledby="sug-h" className="r-sug">
      <div className="wrap r-sug-in">
        <div className="sr r-sug-text">
          <E as="p" path="rubrica.suggest.kicker" className="kicker" style={{ marginBottom: 16 }} />
          <h2 id="sug-h" className="display r-sug-t"><E path="rubrica.suggest.title" multiline /> <E path="rubrica.suggest.titleSerif" className="serif" /></h2>
          <E as="p" path="rubrica.suggest.text" className="r-sug-p" multiline />
        </div>
        <div className="sr r-sug-form">
          {sent && !ed.editing ? (
            <div className="in r-sent" role="status">
              <span className="r-sent-t">{s.thanksTitle}</span>
              <span className="r-sent-p">{s.thanksText}</span>
              <button type="button" onClick={() => setSent(false)} className="r-again">{s.again}</button>
            </div>
          ) : (
            <form onSubmit={send} className="r-form">
              <label htmlFor="sg-name"><E path="rubrica.suggest.nameLabel" /></label>
              <input id="sg-name" type="text" required maxLength={120} placeholder={s.namePh} value={name} onChange={(e) => setName(e.target.value)} />
              <label htmlFor="sg-why" style={{ marginTop: 6 }}><E path="rubrica.suggest.whyLabel" /></label>
              <textarea id="sg-why" rows={4} maxLength={2000} placeholder={s.whyPh} value={why} onChange={(e) => setWhy(e.target.value)} />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
              <button type="submit" className="btn r-send" disabled={busy}><E path="rubrica.suggest.button" /> <Arrow /></button>
              {err && <p className="r-err" role="alert">{err}</p>}
              {ed.editing && (
                <span className="e-note">
                  Placeholders: <E path="rubrica.suggest.namePh" /> · <E path="rubrica.suggest.whyPh" /><br />
                  Depois de enviar: <E path="rubrica.suggest.thanksTitle" /> <E path="rubrica.suggest.thanksText" /> · <E path="rubrica.suggest.again" /><br />
                  As sugestões recebidas aparecem em "Caixa" na barra do admin.
                </span>
              )}
            </form>
          )}
        </div>
      </div>
    </Sec>
  );
}

const GROUPS: [string, string][] = [['all', 'Todos'], ['gr', 'Baliza'], ['def', 'Defesa'], ['med', 'Meio-campo'], ['av', 'Ataque']];
const POS_LABEL: Record<string, string> = { gr: 'Guarda-redes', def: 'Defesa', med: 'Médio', av: 'Avançado' };

/** Todos os jogadores do plantel, cada um com a sua ficha e a ligação à rubrica (quando já existe). */
function Players() {
  const ed = useEditor();
  const c = ed.content;
  const [g, setG] = useState('all');
  const players: any[] = withScoutFallback(c.players || [], seed.players).filter((p: any) => g === 'all' || p.pos === g);
  const edition = (slug: string) => (c.editions || []).find((e: any) => e.slug === slug && (e.published || ed.editing));
  const best = (p: any) => Object.entries(p.attrs || {}).map(([k, v]) => [k, parseFloat(String(v))] as [string, number]).filter(([, v]) => isFinite(v) && v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return (
    <section className="r-pl" id="jogadores" aria-labelledby="rpl-h">
      <div className="wrap">
        <div className="r-pl-h">
          <div>
            <p className="kicker acc" style={{ marginBottom: 14 }}>O plantel · {(c.players || []).length} jogadores</p>
            <h2 id="rpl-h" className="display h-xl">Os <span className="serif acc">jogadores.</span></h2>
          </div>
          <div role="group" aria-label="Filtrar por setor" className="mt-chips">
            {GROUPS.map(([k, l]) => <button key={k} type="button" aria-pressed={g === k} className={cx('mt-chip', g === k && 'on')} onClick={() => setG(k)}>{l}</button>)}
          </div>
        </div>
        {ed.editing && <span className="e-note">Os jogadores editam-se na página /plantel (só o admin a vê). Os atributos editam-se no laboratório tático do Relvado.</span>}
        <ul className="r-pl-grid">
          {players.map((p) => {
            const e = p.radar ? edition(p.radar) : null;
            const attrs = best(p);
            const body = (
              <>
                <span className="r-pl-img" style={{ background: e?.bg || '#0B3B8C' }}>
                  {p.photo?.src ? <SafeImg src={p.photo.src} alt="" style={{ objectPosition: p.photo.pos }} /> : <span className="r-pl-ini" aria-hidden="true">{p.ini}</span>}
                  {p.num && <span className="r-pl-num">{p.num}</span>}
                  {p.captain && <span className="r-pl-cap">Capitão</span>}
                </span>
                <span className="r-pl-b">
                  <span className="r-pl-pos">{(p.positions || []).join(' · ') || POS_LABEL[p.pos]}</span>
                  <strong className="r-pl-name">{p.name}</strong>
                  <span className="r-pl-tag">{p.tag}</span>
                  {attrs.length > 0 && (
                    <span className="r-pl-attrs" aria-label={'Melhores atributos: ' + attrs.map(([k, v]) => `${k} ${v}`).join(', ')}>
                      {attrs.map(([k, v]) => <span key={k}><i style={{ transform: `scaleX(${v / 20})` }} /><em>{k}</em><b>{v}</b></span>)}
                    </span>
                  )}
                  <span className={cx('r-pl-go', !e && 'off')}>{e ? <>Ler a rubrica <Arrow size={14} /></> : 'Rubrica em breve'}</span>
                </span>
              </>
            );
            return <li key={p.id}>{e ? <Link href={'/rubricas/' + e.slug} className="r-pl-card is-link">{body}</Link> : <div className="r-pl-card">{body}</div>}</li>;
          })}
        </ul>
      </div>
    </section>
  );
}

export default function RadarPage() {
  const ed = useEditor();
  const c = ed.content;
  const r = c.rubrica;
  const [filter, setFilter] = useState('all');
  const [lb, setLb] = useState(-1);
  const editions = c.editions;
  const fi = Math.max(0, editions.findIndex((e: any) => e.slug === r.featured));
  const feat = editions[fi];
  const FP = `editions.${fi}`;
  // Faixa e radar usam listas próprias da rubrica (como no design); se faltarem, cai para os jogadores da faixa da homepage.
  const byId = (ids: string[] | undefined) => (ids || []).map((id) => c.players.find((p: any) => p.id === id)).filter((p: any) => p && p.photo?.src);
  const stripIds = byId(r.stripIds);
  const strip = stripIds.length ? stripIds : c.players.filter((p: any) => p.strip && p.photo?.src);
  const blipIds = byId(r.blipIds);
  const blips = (blipIds.length ? blipIds : editions.filter((e: any) => e.photo?.src)).slice(0, 4);
  const blipPos = [[70, 30, 64, 1.0], [28, 64, 56, 1.3], [72, 72, 52, 1.6], [34, 26, 46, 1.9]];
  const list = editions.map((e: any, i: number) => ({ e, i })).filter(({ e }: any) => filter === 'all' || e.group === filter);
  const G = r.gallery.length;

  useEffect(() => {
    if (lb < 0) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLb(-1);
      if (e.key === 'ArrowRight') setLb((x) => (x + 1) % G);
      if (e.key === 'ArrowLeft') setLb((x) => (x - 1 + G) % G);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [lb, G]);

  const lbItem = lb >= 0 ? r.gallery[lb] : null;

  return (
    <div className="radar" style={{ ['--mbase' as any]: '.55s', ['--base' as any]: '.7s' }}>
      <Header theme="light" ctaPath="rubrica.suggestCta" />

      {/* MASTHEAD */}
      <section aria-labelledby="rb-h" className="r-mast">
        <div className="wrap" style={{ position: 'relative' }}>
          <div className="fade r-mast-bar" style={{ ['--i' as any]: 0 }}>
            <E path="rubrica.kicker" />
            <E path="rubrica.schedule" className="hide-sm" />
            <E path="rubrica.editionLabel" style={{ color: 'var(--red)' }} />
          </div>
          <div className="r-mast-row">
            <h1 id="rb-h" className="display r-mast-h">
              <span className="mask r-mast-t1" style={{ ['--i' as any]: 0 }}><E path="rubrica.title" /></span>
              <span className="mask r-mast-t2" style={{ ['--i' as any]: 2 }}><span><E path="rubrica.subPre" /> <E path="rubrica.subSerif" className="serif" style={{ color: 'var(--red)' }} /></span></span>
            </h1>
            <div className="fade r-scope-wrap" aria-hidden="true" style={{ ['--i' as any]: 3 }}>
              <div className="r-scope">
                <div className="r-scope-ring" style={{ inset: '16%' }} />
                <div className="r-scope-ring" style={{ inset: '33%' }} />
                <div className="r-scope-v" />
                <div className="r-scope-h" />
                <div className="r-sweep"><div /></div>
                {blips.map((b: any, i: number) => {
                  const [x, y, s, d] = blipPos[i];
                  return (
                    <div key={i} style={{ position: 'absolute', left: x + '%', top: y + '%', width: s, height: s, transform: 'translate(-50%, -50%)' }}>
                      <div className="ping" style={{ animationDelay: d + 's' }} />
                      <div className="blip" style={{ animationDelay: d + 's' }}><SafeImg src={b.photo.src} alt="" style={{ objectPosition: b.photo.pos }} /></div>
                    </div>
                  );
                })}
                <div className="r-scope-c" />
              </div>
            </div>
          </div>
          <div className="r-flagbar" aria-hidden="true"><div style={{ flex: 1, background: '#061633' }} /><div style={{ flex: '0 0 18%', background: '#fff' }} /><div style={{ flex: '0 0 12%', background: '#E03A3E' }} /><div style={{ flex: '0 0 18%', background: '#fff' }} /><div style={{ flex: 1, background: '#061633' }} /></div>
        </div>
      </section>

      {/* MARQUEE FOTOS */}
      <Sec k="radar.strip" label="Faixa de fotos" aria-label={r.stripLabel} className="r-strip">
        <div className="wrap r-strip-h">
          <E as="p" path="rubrica.stripLabel" className="kicker" />
          <E as="p" path="rubrica.stripHint" className="r-strip-hint" />
        </div>
        {ed.editing && <div className="wrap"><span className="e-note">As fotos desta faixa vêm do Plantel (jogadores com "na faixa da homepage").</span></div>}
        <div className="marq-wrap" style={{ overflow: 'hidden' }}>
          <div className="marq" style={{ gap: 14, paddingRight: 14, animationDuration: '60s' }}>
            {(ed.editing ? strip : [...strip, ...strip]).map((s: any, i: number) => (
              <figure key={i} className="ph duo-h r-strip-f">
                <SafeImg src={s.photo.src} alt={s.name} style={{ objectPosition: s.photo.pos }} />
                <figcaption>{s.name}<span>{c.plantel.posNames[s.pos] || ''}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Sec>

      {/* REGRAS */}
      <Sec k="radar.rules" label="Como funciona" aria-labelledby="rules-h" className="r-rules">
        <div className="wrap r-rules-in">
          <div className="sr r-rules-l">
            <E as="p" path="rubrica.rulesKicker" className="kicker" style={{ color: 'var(--red)', marginBottom: 16 }} />
            <E as="h2" path="rubrica.rulesTitle" id="rules-h" className="r-rules-t" />
          </div>
          <ol className="r-rules-list">
            <EList path="rubrica.rules" newItem={{ n: '0X', t: 'Regra', d: 'Descrição.' }} addLabel="Regra" render={(_x, p) => (
              <li className="sr eitem">
                <E path={p + '.n'} className="r-rule-n" />
                <div>
                  <E as="div" path={p + '.t'} className="r-rule-t" />
                  <E as="p" path={p + '.d'} className="r-rule-d" />
                </div>
                <ItemTools />
              </li>
            )} />
          </ol>
        </div>
      </Sec>

      {/* DESTAQUE */}
      {feat && (
        <Sec k="radar.featured" label="Edição em destaque" aria-labelledby="feat-h" className="r-feat">
          <div className="wrap">
            <E as="p" path="rubrica.featuredKicker" className="sr kicker acc" style={{ marginBottom: 28 }} />
            {ed.editing && <ESelect path="rubrica.featured" label="Edição em destaque" options={editions.map((e: any) => [e.slug, `#${e.num} · ${e.name}`])} />}
            <CardLink className="feat r-feat-card" href={'/rubricas/' + feat.slug}>
              <div className="clip-in r-feat-img">
                <EImg path={`${FP}.photo`} className="cover r-feat-photo" />
                <span className="big r-feat-num" aria-hidden="true">{feat.num}</span>
                <div aria-hidden="true" className="r-feat-flag"><span /><span style={{ background: '#E03A3E' }} /><span /></div>
                <div className="r-feat-badgebox">
                  <E path={`${FP}.featured.badge`} className="r-feat-badge" />
                  <E path={`${FP}.photo.credit`} className="r-feat-credit" />
                </div>
              </div>
              <div className="r-feat-body">
                <p className="sr r-feat-k">Radar #{feat.num} · {feat.fullName}</p>
                <h2 id="feat-h" className="sr display r-feat-t"><E path={`${FP}.featured.title`} /><br /><E path={`${FP}.featured.titleSerif`} className="serif acc" /></h2>
                <E as="p" path={`${FP}.featured.text`} className="sr r-feat-p" multiline />
                <div className="sr r-facts">
                  <EList path={`${FP}.featured.facts`} newItem={{ k: 'Dado', v: '—' }} addLabel="Dado" render={(_f, p) => (
                    <div className="r-fact eitem"><E as="div" path={p + '.k'} className="r-fact-k" /><E as="div" path={p + '.v'} className="r-fact-v" /><ItemTools noDup /></div>
                  )} />
                </div>
                <div className="sr r-feat-cta">
                  <span className="btn btn-y pill pill-acc"><E path="rubrica.featuredCta" /> <Arrow /></span>
                  <E path={`${FP}.featured.readTime`} className="r-feat-rt" />
                </div>
              </div>
            </CardLink>
          </div>
        </Sec>
      )}

      {/* TICKER */}
      <div aria-hidden={ed.editing ? undefined : true} className="r-ticker">
        <div className="marq r-ticker-in">
          {ed.editing ? (
            <EList path="rubrica.ticker" newItem="Frase" addLabel="Frase" render={(_t, p) => <span className="eitem r-tick"><E path={p} /><Star size={18} fill="#F7D116" /><ItemTools noDup /></span>} />
          ) : [...r.ticker, ...r.ticker].map((t: string, i: number) => <span key={i} className="r-tick">{t}<Star size={18} fill="#F7D116" /></span>)}
        </div>
      </div>

      {/* ARQUIVO */}
      <Sec k="radar.archive" label="Arquivo" id="arquivo" aria-labelledby="arq-h" className="r-arch">
        <div className="wrap">
          <div className="sr h-sechead" style={{ marginBottom: 36 }}>
            <h2 id="arq-h" className="display h-xl"><E path="rubrica.archiveTitle" /><br /><E path="rubrica.archiveSerif" className="serif" style={{ color: 'var(--red)' }} /></h2>
            <div role="group" aria-label="Filtrar por posição" className="chips">
              {Object.entries(r.filters).map(([k]) => (
                <button key={k} type="button" className={cx('chip r-chip', filter === k && 'on')} onClick={() => setFilter(k)} aria-pressed={filter === k}><E path={'rubrica.filters.' + k} /></button>
              ))}
            </div>
          </div>
          <p className="r-count" aria-live="polite">{list.length} {list.length === 1 ? 'edição' : 'edições'}</p>
          {ed.editing && <span className="e-note">Para criar, apagar ou reordenar edições usa "Conteúdos" na barra do admin. Aqui editas o texto do arquivo.</span>}
          <div className="r-ed-list">
            {list.map(({ e, i }: any, k: number) => (
              <CardLink key={e.slug} href={'/rubricas/' + e.slug} className="ed in r-ed" style={{ animationDelay: (k * 0.07).toFixed(2) + 's' }}>
                <span className="r-ed-num">#{e.num}</span>
                <div className="ed-t r-ed-thumb" style={{ background: e.bg }}>
                  <SafeImg src={e.photo?.src} alt="" style={{ objectPosition: e.photo?.pos }} fallback={<span>{e.mono || e.num}</span>} />
                </div>
                <span className="ed-n r-ed-name">{e.fullName}</span>
                <span className="r-ed-pos" style={{ background: e.bg }}>{e.groupLabel}</span>
                <E path={`editions.${i}.summary`} className="ed-sub r-ed-sub" />
                {ed.editing && <span style={{ display: 'flex', flexWrap: 'wrap' }}><ESelect path={`editions.${i}.group`} label="Filtro" options={[['def', 'Defesa'], ['mid', 'Meio-campo'], ['atk', 'Ataque']]} /><EColor path={`editions.${i}.bg`} label="Cor" /></span>}
                <svg className="ed-a" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </CardLink>
            ))}
          </div>
        </div>
      </Sec>

      <Players />

      {/* GALERIA */}
      <Sec k="radar.gallery" label="Galeria" aria-labelledby="gal-h" className="r-gal">
        <div className="wrap">
          <div className="sr h-sechead">
            <h2 id="gal-h" className="display h-xl" style={{ color: '#fff' }}><E path="rubrica.galleryTitle" /><br /><E path="rubrica.gallerySerif" className="serif acc" /></h2>
            <E as="p" path="rubrica.galleryHint" className="r-gal-hint" />
          </div>
          <div className="r-gal-grid">
            <EList path="rubrica.gallery" newItem={{ photo: { src: '', alt: '', pos: '50% 50%', credit: '' }, cap: 'Legenda', c: 1, r: 1 }} addLabel="Foto" render={(g, p, i) => (
              <div className="gal ph sr eitem" style={{ gridColumn: `span ${g.c || 1}`, gridRow: `span ${g.r || 1}` }}>
                <EImg path={p + '.photo'} />
                {!ed.editing && <button type="button" className="gal-open" onClick={() => setLb(i)} aria-label={'Abrir foto: ' + g.cap} />}
                <E path={p + '.cap'} className="cap" />
                {ed.editing && (
                  <span style={{ position: 'absolute', left: 8, bottom: 52, zIndex: 31, display: 'flex', flexWrap: 'wrap' }}>
                    <ESelect path={p + '.c'} label="Largura" options={[['1', '1'], ['2', '2']]} />
                    <ESelect path={p + '.r'} label="Altura" options={[['1', '1'], ['2', '2']]} />
                    <span className="e-ctl">Crédito: <E path={p + '.photo.credit'} /></span>
                  </span>
                )}
                <ItemTools />
              </div>
            )} />
          </div>
        </div>
      </Sec>

      {lbItem && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={lbItem.cap} onClick={(e) => e.target === e.currentTarget && setLb(-1)}>
          <SafeImg className="lb-img" src={lbItem.photo.src} alt={lbItem.photo.alt} />
          <div className="lb-meta">
            <span className="lb-cap">{lbItem.cap}</span>
            <span className="lb-credit">{lbItem.photo.credit}</span>
            <span className="lb-count">{lb + 1} / {G}</span>
          </div>
          <div className="lb-nav">
            <button type="button" onClick={() => setLb((lb - 1 + G) % G)} aria-label="Foto anterior"><Arrow size={20} dir="left" /></button>
            <button type="button" className="lb-close" onClick={() => setLb(-1)}>Fechar</button>
            <button type="button" onClick={() => setLb((lb + 1) % G)} aria-label="Foto seguinte"><Arrow size={20} /></button>
          </div>
        </div>
      )}

      <Suggest />

      {/* CONTINUA A LER */}
      <Sec k="radar.more" label="Continua a ler" aria-labelledby="oth-h" className="r-more">
        <div className="wrap">
          <h2 id="oth-h" className="sr display h-md" style={{ marginBottom: 40 }}><E path="rubrica.moreTitle" /> <E path="rubrica.moreSerif" className="serif acc" /></h2>
          <div className="r-more-grid">
            <EList path="rubrica.more" newItem={{ kicker: 'Secção', title: 'Título', titleSerif: 'em itálico', text: 'Descrição.', href: '/', bg: '#0B3B8C', photo: { src: '', alt: '', pos: '50% 50%' } }} addLabel="Cartão" render={(m, p, i) => (
              <HrefLink path={p + '.href'} className={cx('other ph sr eitem r-more-card', i === 0 && 'r-more-wide')} style={{ background: m.bg }}>
                <EImg path={p + '.photo'} className="cover r-more-img" alt="" label=" " />
                <div className="r-more-b">
                  <E path={p + '.kicker'} className="r-more-k" />
                  <span className="r-more-t"><E path={p + '.title'} /><br /><E path={p + '.titleSerif'} className="serif" /></span>
                  <E path={p + '.text'} className="r-more-p" />
                </div>
                <EColor path={p + '.bg'} label="Fundo" />
                <ItemTools />
              </HrefLink>
            )} />
          </div>
        </div>
      </Sec>

      <Footer big="Radar" back />
    </div>
  );
}
