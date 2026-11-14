'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { E, EImg, EList, ItemTools, EToggle, ESelect, EColor, HrefLink, useEditor, cx } from '@/components/editor/core';
import { Header, Footer, Arrow, Pitch } from '@/components/site/ui';
import { NotFoundBlock } from './NotFound';

const BLOCKS: [string, string, any][] = [
  ['p', 'Parágrafo', { type: 'p', text: 'Novo parágrafo.' }],
  ['h2', 'Título', { type: 'h2', num: '0X', text: 'Novo título' }],
  ['quote', 'Citação', { type: 'quote', text: '“Citação.”', cite: 'Autor' }],
  ['image', 'Imagem', { type: 'image', photo: { src: '', alt: '', pos: '50% 50%' }, caption: 'Legenda. Foto: [CRÉDITO]' }],
  ['phase', 'Botão do quadro tático', { type: 'phase', label: 'Ver no campo', phase: 0 }],
  ['lead', 'Parágrafo com capitular', { type: 'lead', text: 'Parágrafo de abertura.' }]
];

function Block({ b, p, setPhase, phases }: { b: any; p: string; setPhase: (i: number) => void; phases: any[] }) {
  const ed = useEditor();
  switch (b.type) {
    case 'lead':
      return <div className="eitem"><E as="p" path={p + '.text'} className="lead" multiline /><ItemTools /></div>;
    case 'h2':
      return <h2 className="sr a-h2 eitem"><E path={p + '.num'} className="a-h2-n" /> · <E path={p + '.text'} /><ItemTools /></h2>;
    case 'quote':
      return (
        <blockquote className="sr a-quote eitem">
          <E as="p" path={p + '.text'} />
          <E as="footer" path={p + '.cite'} />
          <ItemTools />
        </blockquote>
      );
    case 'image':
      return (
        <figure className="sr ph a-fig eitem">
          <EImg path={p + '.photo'} className="cover" />
          <E as="figcaption" path={p + '.caption'} />
          <ItemTools />
        </figure>
      );
    case 'phase':
      return (
        <p className="eitem" style={{ marginBottom: 0 }}>
          <button type="button" className="show" onClick={() => { setPhase(Number(b.phase) || 0); if (window.innerWidth < 980) document.getElementById('quadro')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
            <E path={p + '.label'} /> <Arrow size={16} />
          </button>
          <ESelect path={p + '.phase'} label="Fase" options={phases.map((ph: any, i: number) => [String(i), ph.label])} />
          <ItemTools />
        </p>
      );
    default:
      return <div className="eitem"><E as="p" path={p + '.text'} multiline /><ItemTools /></div>;
  }
}

export default function ArticlePage({ slug }: { slug: string }) {
  const ed = useEditor();
  const idx = ed.content.articles.findIndex((a: any) => a.slug === slug);
  const [phase, setPhase] = useState(0);
  if (idx < 0) return <NotFoundBlock />;
  const a = ed.content.articles[idx];
  const P = `articles.${idx}`;
  const phases = a.board?.phases || [];
  const pi = Math.min(phase, Math.max(0, phases.length - 1));
  const lines = String(a.titleLines || '').split('\n');

  return (
    <div className="article" style={{ ['--mbase' as any]: '.2s', ['--base' as any]: '.4s' }}>
      <div className="prog" aria-hidden="true" />
      <Header theme="light" mark="#0F5A3A" />
      {ed.editing && (
        <div className="wrap e-meta">
          <EToggle path={P + '.published'} label="Publicado" />
          <ESelect path={P + '.pillar'} label="Pilar" options={[['relvado', 'Relvado'], ['pessoas', 'Pessoas'], ['raizes', 'Raízes']]} />
          <span className="e-note">Resumo (para listagens e Google): <E path={P + '.summary'} /></span>
        </div>
      )}
      <article id="top">
        <header className="wrap a-head">
          <p className="fade a-meta" style={{ ['--i' as any]: 0 }}><E path={P + '.kicker'} className="a-meta-k" /><E path={P + '.read'} /></p>
          <h1 className="display a-title">
            {ed.editing ? (
              <span className="a-t1"><E path={P + '.titleLines'} multiline /></span>
            ) : lines.map((l, i) => <span key={i} className="mask a-t1" style={{ ['--i' as any]: i }}><span>{l}</span></span>)}
            <span className="mask a-t2" style={{ ['--i' as any]: lines.length }}><E path={P + '.titleSerif'} className="serif" /></span>
          </h1>
          <div className="a-headrow">
            <E as="p" path={P + '.deck'} className="fade a-deck" style={{ ['--i' as any]: 4 }} multiline />
            <p className="fade a-by" style={{ ['--i' as any]: 5 }}>Por <strong><E path={P + '.author'} /></strong><br /><E path={P + '.date'} /></p>
          </div>
        </header>

        <figure className="reveal ph a-cover">
          <div className="par a-cover-img"><EImg path={P + '.cover'} className="cover" /></div>
          <figcaption className="wrap a-cover-cap"><E path={P + '.coverCaption'} /></figcaption>
        </figure>

        <div className="wrap a-bodyrow">
          <div className="prose">
            <EList path={P + '.body'} render={(b, p) => <Block b={b} p={p} setPhase={setPhase} phases={phases} />} />
            {ed.editing && (
              <div className="e-addbar">
                <span className="e-note">Adicionar bloco:</span>
                {BLOCKS.map(([k, label, tpl]) => (
                  <button key={k} type="button" className="e-add" onClick={() => ed.insert(P + '.body', a.body.length, JSON.parse(JSON.stringify(tpl)))}>+ {label}</button>
                ))}
              </div>
            )}
            <div className="a-tags">
              <EList path={P + '.tags'} newItem="Etiqueta" addLabel="Etiqueta" render={(_t, p) => <span className="a-tag eitem"><E path={p} /><ItemTools noDup /></span>} />
            </div>
          </div>

          {(phases.length > 0 || ed.editing) && (
            <aside id="quadro" className="aside-pitch" aria-label="Campo tático interativo">
              <div className="a-board">
                <div className="a-board-h">
                  <E path={P + '.boardKicker'} className="a-board-k" />
                  <span className="a-board-t">{phases[pi]?.title}</span>
                </div>
                {phases.length > 0 && <Pitch path={P + '.board'} phase={pi} variant="article" />}
                <div role="group" aria-label="Fase" className="a-tabs">
                  {phases.map((ph: any, i: number) => (
                    <button key={i} type="button" onClick={() => setPhase(i)} aria-pressed={i === pi} className={cx('a-tab', i === pi && 'on')}><E path={`${P}.board.phases.${i}.label`} /></button>
                  ))}
                </div>
                {phases[pi] && <E as="p" path={`${P}.board.phases.${pi}.caption`} className="a-board-p" />}
                {ed.editing && (
                  <div className="e-addbar">
                    {phases[pi] && <span className="e-note">Título da fase: <E path={`${P}.board.phases.${pi}.title`} /></span>}
                    <button type="button" className="e-add" onClick={() => { const src = phases[pi] || { players: [] }; ed.insert(P + '.board.phases', phases.length, { ...JSON.parse(JSON.stringify(src)), key: 'f' + Date.now(), label: 'Nova fase', title: 'Nova fase', caption: 'Descrição.' }); setPhase(phases.length); }}>+ Fase (copia a atual)</button>
                    {phases.length > 1 && <button type="button" className="e-add" onClick={() => { if (window.confirm('Apagar esta fase?')) { ed.remove(P + '.board.phases', pi); setPhase(0); } }}>Apagar fase</button>}
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </article>

      <section aria-labelledby="rel-h" className="a-rel">
        <div className="wrap">
          <h2 id="rel-h" className="sr display h-md" style={{ marginBottom: 36 }}><E path={P + '.relatedTitle'} /> <E path={P + '.relatedSerif'} className="serif" style={{ color: '#F7D116' }} /></h2>
          <div className="a-rel-grid">
            <EList path={P + '.related'} newItem={{ name: 'Nome', label: 'Papel', href: '/plantel', bg: '#0B3B8C', photo: { src: '', alt: '', pos: '50% 20%' } }} addLabel="Cartão" render={(r, p) => (
              <HrefLink path={p + '.href'} className="rel sr ph eitem" style={{ background: r.bg }}>
                <EImg path={p + '.photo'} className="cover" alt="" label=" " />
                <span className="a-rel-l"><E path={p + '.name'} /><E path={p + '.label'} className="a-rel-s" /></span>
                <EColor path={p + '.bg'} label="Fundo" />
                <ItemTools />
              </HrefLink>
            )} />
          </div>
        </div>
      </section>

      <footer className="a-foot">
        <div className="wrap a-foot-in">
          <Link href="/" className="ul ft-back">← Voltar à homepage</Link>
          <E path={P + '.credits'} className="ft-credits" multiline />
        </div>
      </footer>
    </div>
  );
}
