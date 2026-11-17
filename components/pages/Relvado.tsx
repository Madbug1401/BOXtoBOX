'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { E, EList, ItemTools, useEditor, SafeImg, cx } from '@/components/editor/core';
import { Header, Footer, Arrow, Pitch } from '@/components/site/ui';
import { templates } from '@/lib/seed';
import { slugify } from '@/lib/paths';

export default function RelvadoPage() {
  const ed = useEditor();
  const router = useRouter();
  const c = ed.content;
  const r = c.relvado;
  const list = (c.articles || []).filter((a: any) => (a.pillar || 'relvado') === 'relvado');
  const lead = list[0];
  const li = lead ? c.articles.indexOf(lead) : -1;
  const [mom, setMom] = useState(1);
  const phases = lead?.board?.phases || [];

  const create = () => {
    const title = window.prompt('Título da nova análise:');
    if (!title) return;
    const slug = slugify(title);
    const a: any = templates.article(slug);
    a.titleLines = title;
    ed.insert('articles', 0, a);
    router.push('/relvado/' + slug);
  };

  return (
    <div className="relvado-p">
      <Header />
      <section className="rl-hero" aria-labelledby="rl-h">
        <div className="wrap rl-hero-in">
          <div>
            <E as="p" path="relvado.kicker" className="fade kicker acc" style={{ marginBottom: 18 }} />
            <h1 id="rl-h" className="display rl-title"><span className="mask"><span><E path="relvado.title" /></span></span><span className="mask" style={{ ['--i' as any]: 1 }}><span><E path="relvado.titleSerif" className="serif acc" /></span></span></h1>
            <E as="p" path="relvado.intro" className="fade rl-intro" style={{ ['--i' as any]: 3 }} multiline />
          </div>
          {lead && phases.length > 0 && (
            <div className="fade rl-board" style={{ ['--i' as any]: 4 }}>
              <Pitch path={`articles.${li}.board`} phase={Math.min(mom, phases.length - 1)} variant="article" />
              <p className="rl-board-cap">{phases[Math.min(mom, phases.length - 1)]?.caption}</p>
            </div>
          )}
        </div>
      </section>

      <section className="rl-moments" aria-labelledby="rl-m">
        <div className="wrap">
          <h2 id="rl-m" className="sr-only">Os cinco momentos do jogo</h2>
          <div className="rl-mgrid">
            <EList path="relvado.moments" newItem={{ n: '0X', t: 'Momento', d: 'Descrição.' }} addLabel="Momento" render={(m, p, i) => (
              <button type="button" className={cx('rl-m sr eitem', mom === i && 'on')} onMouseEnter={() => setMom(i)} onFocus={() => setMom(i)} onClick={() => setMom(i)} aria-pressed={mom === i}>
                <E path={p + '.n'} className="rl-m-n" />
                <E path={p + '.t'} className="rl-m-t" />
                <E path={p + '.d'} className="rl-m-d" />
                <ItemTools />
              </button>
            )} />
          </div>
        </div>
      </section>

      <section className="rl-list" aria-labelledby="rl-l">
        <div className="wrap">
          <div className="rl-list-h">
            <h2 id="rl-l" className="display h-lg"><E path="relvado.listTitle" /></h2>
            {ed.editing && <button type="button" className="e-add" onClick={create}>+ Nova análise</button>}
          </div>
          {lead && (
            <Link href={'/relvado/' + lead.slug} className="rl-lead sr">
              <span className="rl-lead-img ph">{lead.cover?.src && <SafeImg src={lead.cover.src} alt="" style={{ objectPosition: lead.cover.pos }} />}</span>
              <span className="rl-lead-b">
                <span className="kicker acc">{lead.kicker}</span>
                <strong className="display">{String(lead.titleLines).replace(/\n/g, ' ')} <span className="serif">{lead.titleSerif}</span></strong>
                <span className="rl-lead-p">{lead.summary || lead.deck}</span>
                <span className="rl-lead-ms">{phases.map((ph: any, i: number) => <span key={i}>{String(i + 1).padStart(2, '0')} {ph.label}</span>)}</span>
                <span className="rl-lead-go">Ler a análise <Arrow size={16} /></span>
              </span>
            </Link>
          )}
          <div className="rl-grid">
            {list.slice(1).map((a: any) => (
              <Link key={a.slug} href={'/relvado/' + a.slug} className="rl-card sr">
                <span className="rl-card-img ph">{a.cover?.src && <SafeImg src={a.cover.src} alt="" style={{ objectPosition: a.cover.pos }} />}</span>
                <span className="kicker acc">{a.kicker}</span>
                <strong>{String(a.titleLines).replace(/\n/g, ' ')} {a.titleSerif}</strong>
                {!a.published && <span className="ph-note">Rascunho</span>}
              </Link>
            ))}
          </div>
          {!list.length && <p className="mt-empty">Ainda não há análises publicadas.</p>}
        </div>
      </section>
      <Footer />
    </div>
  );
}
