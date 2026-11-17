'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { E, useEditor, cx, rich } from '@/components/editor/core';
import { Header, Footer, Arrow } from '@/components/site/ui';

export const matchTemplate = (slug: string) => ({
  slug, published: false, status: 'agendado', comp: '[COMPETIÇÃO]', stage: '[FASE]', date: '[DATA]', time: '[HORA]',
  venue: '[ESTÁDIO]', city: '[CIDADE]', attendance: '', home: 'Cabo Verde', away: '[ADVERSÁRIO]', hs: '', as: '', extra: '',
  summary: 'Resumo do jogo.', events: [], analysis: '',
  stats: ['Posse de bola (%)', 'Remates', 'Remates enquadrados', 'Cantos', 'Faltas', 'Cartões amarelos'].map((label) => ({ label, home: '[—]', away: '[—]' }))
});

/** Balanço calculado dos jogos terminados (nada inventado: só soma resultados). */
export function record(matches: any[], team: string) {
  const r = { j: 0, v: 0, e: 0, d: 0, gm: 0, gs: 0, inv90: 0 };
  matches.filter((m) => m.status === 'final').forEach((m) => {
    const home = m.home === team, away = m.away === team;
    if (!home && !away) return;
    const a = parseInt(m.hs, 10), b = parseInt(m.as, 10);
    if (!isFinite(a) || !isFinite(b)) return;
    const gm = home ? a : b, gs = home ? b : a;
    r.j++; r.gm += gm; r.gs += gs;
    if (gm > gs) r.v++; else if (gm === gs) r.e++; else r.d++;
    if (gm >= gs || m.extra) r.inv90++; // empate ou vitória, ou decidido só no prolongamento/penáltis
  });
  return r;
}

export function Score({ m, team }: { m: any; team: string }) {
  return (
    <span className="mt-score">
      <span className={cx('mt-team mt-home', m.home === team && 'is-us')}>{rich(m.home)}</span>
      <span className="mt-sc">{m.status === 'final' ? <>{m.hs}<i />{m.as}</> : <em>vs</em>}</span>
      <span className={cx('mt-team', m.away === team && 'is-us')}>{rich(m.away)}</span>
    </span>
  );
}

export default function MatchesPage() {
  const ed = useEditor();
  const router = useRouter();
  const c = ed.content;
  const j = c.jogos;
  const team = j.team || 'Cabo Verde';
  const all: any[] = c.matches || [];
  const comps = Array.from(new Set(all.filter((m) => m.status === 'final').map((m) => m.comp)));
  const [comp, setComp] = useState('all');
  const list = all.filter((m) => comp === 'all' || m.comp === comp);
  const next = all.find((m) => m.status !== 'final');
  const results = list.filter((m) => m.status === 'final');
  const rec = record(all, team);

  const addMatch = () => {
    const slug = 'jogo-' + Date.now().toString(36);
    ed.insert('matches', 0, matchTemplate(slug));
    router.push('/jogos/' + slug);
  };

  return (
    <div className="jogos">
      <Header />
      <section className="mt-hero" aria-labelledby="mt-h">
        <div className="wrap">
          <E as="p" path="jogos.kicker" className="fade kicker acc" style={{ marginBottom: 18 }} />
          <h1 id="mt-h" className="display mt-title"><span className="mask"><span><E path="jogos.title" /></span></span><span className="mask" style={{ ['--i' as any]: 1 }}><span><E path="jogos.titleSerif" className="serif acc" /></span></span></h1>
          <E as="p" path="jogos.intro" className="fade mt-intro" style={{ ['--i' as any]: 3 }} multiline />
        </div>
      </section>

      <section className="mt-top" aria-label="Resumo">
        <div className="wrap mt-top-in">
          {next && (
            <Link href={'/jogos/' + next.slug} className="mt-next sr">
              <span className="kicker acc"><E path="jogos.nextLabel" /></span>
              <Score m={next} team={team} />
              <span className="mt-meta">{rich(next.comp)} · {rich(next.stage)}</span>
              <span className="mt-meta">{rich(next.date)} · {rich(next.time)} · {rich(next.city)}</span>
            </Link>
          )}
          <div className="mt-rec sr" aria-label="Balanço dos jogos terminados">
            <span className="kicker"><E path="jogos.recordLabel" /></span>
            <div className="mt-rec-grid">
              {[['Jogos', rec.j], ['Vitórias', rec.v], ['Empates', rec.e], ['Derrotas', rec.d], ['Golos marcados', rec.gm], ['Golos sofridos', rec.gs]].map(([l, v]) => (
                <div key={l as string}><strong>{v}</strong><span>{l}</span></div>
              ))}
            </div>
            <p className="mt-rec-note">{rec.inv90 === rec.j && rec.j > 0 ? `Invicto nos 90 minutos em ${rec.j} jogos.` : `${rec.inv90} de ${rec.j} jogos sem perder nos 90 minutos.`} Derrotas no prolongamento contam como derrotas.</p>
          </div>
        </div>
      </section>

      <section className="mt-list" aria-labelledby="res-h">
        <div className="wrap">
          <div className="mt-list-h">
            <h2 id="res-h" className="display h-lg"><E path="jogos.resultsLabel" /></h2>
            <div role="group" aria-label="Competição" className="mt-chips">
              {['all', ...comps].map((k) => (
                <button key={k} type="button" aria-pressed={comp === k} className={cx('mt-chip', comp === k && 'on')} onClick={() => setComp(k)}>{k === 'all' ? 'Todos' : rich(k)}</button>
              ))}
            </div>
          </div>
          {ed.editing && <button type="button" className="e-add" onClick={addMatch}>+ Novo jogo</button>}
          <div className="mt-rows">
            {results.map((m, i) => (
              <Link key={m.slug} href={'/jogos/' + m.slug} className="mt-row row sr" style={{ ['--i' as any]: i }}>
                <span className="mt-row-tag">{rich(m.comp)}<br /><span>{rich(m.stage)}</span></span>
                <Score m={m} team={team} />
                <span className="mt-row-x">{m.extra && <b>{m.extra}</b>}{rich(m.city)}</span>
                <span className="mt-row-go" aria-hidden="true"><Arrow /></span>
              </Link>
            ))}
            {!results.length && <p className="mt-empty">Ainda não há resultados nesta competição.</p>}
          </div>
          <div className="mt-links">
            <Link href={j.plantelCta?.href || '/plantel'} className="btn pill pill-acc">{j.plantelCta?.label || 'Ver o plantel'} <Arrow /></Link>
            <Link href="/relvado" className="btn pill pill-ghost">Análises no Relvado <Arrow /></Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
