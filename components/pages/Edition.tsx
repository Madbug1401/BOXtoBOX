'use client';
import React from 'react';
import Link from 'next/link';
import { E, EImg, EList, ItemTools, EToggle, CardLink, useEditor, SafeImg, cx } from '@/components/editor/core';
import { LogoMark } from '@/components/site/ui';
import { NotFoundBlock } from './NotFound';

export default function EditionPage({ slug }: { slug: string }) {
  const ed = useEditor();
  const c = ed.content;
  const x = c.edicao;
  const idx = c.editions.findIndex((e: any) => e.slug === slug);
  if (idx < 0) return <NotFoundBlock />;
  const e = c.editions[idx];
  const P = `editions.${idx}`;
  const others = c.editions.filter((o: any) => o.slug !== slug);

  return (
    <div className="edition">
      {!ed.editing && <div key={slug} className="wipe" aria-hidden="true"><div className="wipe-mark">N.º {e.num}</div></div>}

      <div className="ed-brand">
        <div className="sheet ed-brand-in">
          <Link href="/rubricas" className="ed-brand-a"><E path="edicao.back" /></Link>
          <nav aria-label="Secções" className="ed-brand-nav">
            <Link href="/">Home</Link>
            <Link href="/jogos">Jogos</Link>
            <Link href="/relvado">Relvado</Link>
            <Link href="/rubricas#jogadores">Jogadores</Link>
          </nav>
          <E path="edicao.demoBadge" className="ed-demo" />
        </div>
      </div>

      <div className="sheet paper">
        {ed.editing && (
          <div className="e-meta" style={{ paddingTop: 0, marginBottom: 12 }}>
            <EToggle path={P + '.published'} label="Publicado" />
            <span className="e-note">N.º <E path={P + '.num'} /> · Nome curto: <E path={P + '.name'} /> · Nome completo: <E path={P + '.fullName'} /> · Resumo no arquivo: <E path={P + '.summary'} /></span>
          </div>
        )}
        <header className="ed-mast">
          <div className="fade hide-sm ed-box" style={{ ['--i' as any]: 0 }}>
            <E as="div" path="edicao.inThis" className="lbl" style={{ color: 'var(--red)' }} />
            <div className="ed-box-name">{e.name}</div>
            <E as="div" path={P + '.posLong'} className="ed-box-sub" />
          </div>
          <div className="ed-mast-c">
            <div className="fade lbl ed-presents" style={{ ['--i' as any]: 1 }}>
              <LogoMark size={22} stroke="#141414" fill="#B3261E" ink="#F1ECDF" /><E path="edicao.presents" />
            </div>
            <h1 className="ed-title"><span className="mask"><E path="edicao.title" /></span></h1>
            <E as="div" path="edicao.sub" className="fade ed-sub" style={{ ['--i' as any]: 3 }} />
          </div>
          <div className="fade hide-sm ed-box" style={{ ['--i' as any]: 2, textAlign: 'right' }}>
            <div className="lbl">N.º {e.num}</div>
            <div className="ed-box-date"><E path={P + '.date'} /></div>
            <E as="div" path="edicao.freq" className="ed-box-sub" />
          </div>
        </header>
        <div className="rule2 draw" style={{ ['--d' as any]: '.3s', marginTop: 22 }} />
        <div className="fade ed-strip" style={{ ['--i' as any]: 4 }}>
          <E path="edicao.section" className="lbl" />
          <E path={P + '.dateline'} className="lbl" />
          <E path="edicao.right" className="lbl" style={{ color: 'var(--red)' }} />
        </div>
        <div className="rule draw" style={{ ['--d' as any]: '.45s' }} />

        <nav aria-label="Edições do Radar" className="ed-tabs">
          {c.editions.map((o: any) => {
            const on = o.slug === slug;
            return (
              <Link key={o.slug} href={'/rubricas/' + o.slug} className={cx('tab', on && 'on')} aria-current={on ? 'page' : undefined} scroll>
                <span className="tab-av"><SafeImg src={o.photo?.src} alt="" style={{ objectPosition: o.photo?.pos }} fallback={<span>{o.mono || o.plate || o.num}</span>} /></span>
                <span className="tn"><span className="lbl" style={{ color: on ? '#F7D116' : 'var(--red)' }}>N.º {o.num}</span><span className="tab-name">{o.name}</span></span>
              </Link>
            );
          })}
        </nav>

        <div className="ed-front">
          <article className="ed-main" aria-labelledby="hl">
            <E as="div" path={P + '.kicker'} className="fade lbl" style={{ ['--i' as any]: 5, color: 'var(--red)' }} />
            <h2 id="hl" className="ed-hl"><span className="mask" style={{ ['--i' as any]: 2 }}><E path={P + '.headline'} /></span></h2>
            <E as="p" path={P + '.deck'} className="fade ed-deck" style={{ ['--i' as any]: 6 }} multiline />
            <div className="fade ed-byline" style={{ ['--i' as any]: 7 }}>
              <span className="lbl"><E path="edicao.byPrefix" /> <E path={P + '.author'} /></span>
              <E path="edicao.desk" className="lbl" />
              <span className="lbl"><E path="edicao.readPrefix" /> <E path={P + '.read'} /></span>
            </div>

            <figure className="fade ed-fig" style={{ ['--i' as any]: 8 }}>
              {e.photo?.src || ed.editing ? (
                <div className="ht" style={{ aspectRatio: '16 / 9' }}><EImg path={P + '.photo'} /></div>
              ) : null}
              {!e.photo?.src && (
                <div className="ed-plate">
                  <E path={P + '.plate'} className="ed-plate-n" placeholder="Texto grande" />
                  <E path={P + '.plateSub'} className="lbl" style={{ color: '#F7D116' }} />
                  <span className="ed-plate-note">[Foto a obter com licença]</span>
                </div>
              )}
              <figcaption className="ed-cap">
                <E path={P + '.caption'} />
                <E path={P + '.photo.credit'} className="ed-credit" />
              </figcaption>
            </figure>

            <div className="cols">
              <EList path={P + '.body'} newItem="Novo parágrafo." addLabel="Parágrafo" render={(_t, p) => (
                <div className="eitem"><E as="p" path={p} multiline /><ItemTools /></div>
              )} />
            </div>

            <blockquote className="sr ed-quote">
              <span aria-hidden="true" className="ed-quote-mark">“</span>
              <div>
                <E as="p" path={P + '.quote'} className="ed-quote-t" />
                <footer className="lbl" style={{ marginTop: 12, fontSize: 12 }}>— {e.name}, <E path="edicao.quoteSuffix" /></footer>
              </div>
            </blockquote>

            <section className="sr" aria-labelledby="mom-h" style={{ marginTop: 34 }}>
              <div className="ed-sech">
                <E as="h3" path="edicao.momentsTitle" id="mom-h" className="ed-h3" />
                <E path="edicao.momentsTag" className="lbl" style={{ fontSize: 12, color: 'var(--red)' }} />
              </div>
              <div className="ed-moments">
                <EList path={P + '.moments'} newItem={{ n: '0X', t: 'Momento', d: 'Descrição.' }} addLabel="Momento" render={(_m, p) => (
                  <div className="ed-moment eitem">
                    <E as="div" path={p + '.n'} className="ed-moment-n" />
                    <E as="div" path={p + '.t'} className="lbl" style={{ marginTop: 8 }} />
                    <E as="p" path={p + '.d'} className="ed-moment-d" />
                    <ItemTools />
                  </div>
                )} />
              </div>
            </section>
          </article>

          <aside className="ed-side" aria-label="Caixas laterais">
            <section className="fade ed-ficha" style={{ ['--i' as any]: 6 }} aria-labelledby="ficha-h">
              <E as="h3" path="edicao.fichaTitle" id="ficha-h" className="lbl ed-ficha-h" />
              <dl>
                <EList path={P + '.ficha'} newItem={{ k: 'Campo', v: 'Valor' }} addLabel="Linha" render={(_f, p) => (
                  <div className="ed-ficha-row eitem"><E as="dt" path={p + '.k'} className="lbl" style={{ fontSize: 12 }} /><E as="dd" path={p + '.v'} /><ItemTools noDup /></div>
                )} />
              </dl>
            </section>

            <section className="sr" aria-labelledby="num-h">
              <E as="h3" path="edicao.numbersTitle" id="num-h" className="ed-h3 ed-h3-rule" />
              <EList path={P + '.numbers'} newItem={{ n: '0', l: 'descrição' }} addLabel="Número" render={(_n, p) => (
                <div className="ed-num eitem"><E path={p + '.n'} className="ed-num-n" /><E path={p + '.l'} className="ed-num-l" /><ItemTools noDup /></div>
              )} />
            </section>

            <section className="sr ed-route" aria-labelledby="route-h">
              <E as="h3" path="edicao.routeTitle" id="route-h" className="lbl" style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--red)' }} />
              <ol>
                <EList path={P + '.route'} newItem={{ p: 'Lugar', d: 'descrição' }} addLabel="Etapa" render={(_r, p, i) => (
                  <li className="eitem">
                    <span aria-hidden="true" className="ed-route-dot" style={{ background: i === e.route.length - 1 ? '#B3261E' : '#F1ECDF' }} />
                    <E as="div" path={p + '.p'} className="ed-route-p" />
                    <E as="div" path={p + '.d'} className="ed-route-d" />
                    <ItemTools noDup />
                  </li>
                )} />
              </ol>
            </section>

            <section className="sr ed-op" aria-labelledby="op-h">
              <E as="h3" path="edicao.opinionTitle" id="op-h" className="lbl" style={{ margin: 0, fontSize: 13 }} />
              <E as="p" path={P + '.opinion'} className="ed-op-t" multiline />
              <E as="p" path="edicao.opinionBy" className="lbl" style={{ margin: '10px 0 0', fontSize: 12, textAlign: 'right' }} />
            </section>

            <CardLink href="/rubricas#sugerir" className="sr ed-ad">
              <E path="edicao.adKicker" className="lbl" style={{ color: 'var(--red)' }} />
              <E path="edicao.adTitle" className="ed-ad-t" />
              <E path="edicao.adText" className="ed-ad-p" />
            </CardLink>
          </aside>
        </div>

        {others.length > 0 && (
          <section aria-labelledby="also-h" style={{ marginTop: 44 }}>
            <div className="rule2" />
            <div className="ed-also-h">
              <E as="h3" path="edicao.alsoTitle" id="also-h" className="ed-h3" />
              <E path="edicao.alsoHint" className="lbl" style={{ fontSize: 12 }} />
            </div>
            <div className="rule" />
            <div className="ed-also">
              {others.map((o: any) => (
                <Link key={o.slug} href={'/rubricas/' + o.slug} className="mini">
                  <span className="ht mini-img"><SafeImg src={o.photo?.src} alt="" style={{ objectPosition: o.photo?.pos }} fallback={<span className="mini-plate">{o.plate || o.mono || o.num}</span>} /></span>
                  <span className="mini-b">
                    <span className="lbl" style={{ fontSize: 12, color: 'var(--red)' }}>N.º {o.num} · {o.name}</span>
                    <span className="mh">{o.headline}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="rule" />
          </section>
        )}

        <footer className="ed-folio">
          <span className="lbl" style={{ fontSize: 12 }}>{c.settings.siteName} · {x.title} · N.º {e.num}</span>
          <E path="edicao.footnote" className="ed-folio-t" multiline />
        </footer>
      </div>
    </div>
  );
}
