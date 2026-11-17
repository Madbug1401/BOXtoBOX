'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { E, EList, ItemTools, ESelect, EToggle, useEditor, cx, rich, SafeImg } from '@/components/editor/core';
import { Header, Footer, Arrow } from '@/components/site/ui';
import { NotFoundBlock } from './NotFound';

const num = (v: any) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };

function StatRow({ s, p }: { s: any; p: string }) {
  const a = num(s.home), b = num(s.away);
  const known = a !== null && b !== null && a + b > 0;
  const pa = known ? (a! / (a! + b!)) * 100 : 50;
  return (
    <div className="ms-stat eitem">
      <div className="ms-stat-h">
        <E path={p + '.home'} className={cx('ms-v', !known && 'ms-ph')} />
        <E path={p + '.label'} className="ms-l" />
        <E path={p + '.away'} className={cx('ms-v ms-v-r', !known && 'ms-ph')} />
      </div>
      <div className={cx('ms-bar', !known && 'is-ph')} aria-hidden="true">
        <span style={{ width: pa + '%' }} /><span style={{ width: 100 - pa + '%' }} />
      </div>
      <ItemTools />
    </div>
  );
}

export default function MatchPage({ slug }: { slug: string }) {
  const ed = useEditor();
  const router = useRouter();
  const c = ed.content;
  const idx = (c.matches || []).findIndex((m: any) => m.slug === slug);
  if (idx < 0) return <NotFoundBlock />;
  const m = c.matches[idx];
  const P = `matches.${idx}`;
  const team = c.jogos.team || 'Cabo Verde';
  const final = m.status === 'final';
  const article = m.analysis ? (c.articles || []).find((a: any) => a.slug === m.analysis) : null;
  const xi = (c.players || []).filter((p: any) => p.xi);
  const posOrder = ['gr', 'def', 'med', 'av'];
  const posNames = c.plantel?.posNames || {};

  return (
    <div className="jogos jogo">
      <Header />
      {ed.editing && (
        <div className="wrap e-meta">
          <EToggle path={P + '.published'} label="Publicado" />
          <ESelect path={P + '.status'} label="Estado" options={[['final', 'Terminado'], ['agendado', 'Agendado']]} />
          <span className="e-note">Endereço: /jogos/<E path={P + '.slug'} /> · Prolongamento/penáltis: <E path={P + '.extra'} placeholder="ex.: a.p." /></span>
          <ESelect path={P + '.analysis'} label="Análise" options={[['', '—'], ...(c.articles || []).map((a: any) => [a.slug, String(a.titleLines).replace(/\n/g, ' ')])]} />
          <button type="button" className="e-add" onClick={() => { if (window.confirm('Apagar este jogo?')) { ed.remove('matches', idx); router.push('/jogos'); } }}>Apagar jogo</button>
        </div>
      )}

      <section className="ms-head" aria-labelledby="ms-h">
        <div className="wrap">
          <Link href="/jogos" className="ul ul0 ms-back">← Todos os jogos</Link>
          <p className="kicker acc ms-k fade"><E path={P + '.comp'} /> · <E path={P + '.stage'} /></p>
          <h1 id="ms-h" className="ms-board fade" style={{ ['--i' as any]: 1 }}>
            <span className={cx('ms-team', m.home === team && 'is-us')}><E path={P + '.home'} /></span>
            <span className="ms-score">
              {final || ed.editing ? <><E path={P + '.hs'} placeholder="0" /><i aria-hidden="true" /><E path={P + '.as'} placeholder="0" /></> : <em>vs</em>}
            </span>
            <span className={cx('ms-team', m.away === team && 'is-us')}><E path={P + '.away'} /></span>
          </h1>
          {m.extra && final && <p className="ms-extra fade">{m.extra === 'a.p.' ? 'Após prolongamento' : m.extra}</p>}
          <ul className="ms-meta fade" style={{ ['--i' as any]: 2 }}>
            <li><span>Data</span><E path={P + '.date'} /></li>
            <li><span>Hora</span><E path={P + '.time'} placeholder="—" /></li>
            <li><span>Estádio</span><E path={P + '.venue'} /></li>
            <li><span>Cidade</span><E path={P + '.city'} /></li>
            {(m.attendance || ed.editing) && <li><span>Público</span><E path={P + '.attendance'} placeholder="—" /></li>}
          </ul>
          <E as="p" path={P + '.summary'} className="ms-sum fade" style={{ ['--i' as any]: 3 }} multiline />
        </div>
      </section>

      <section className="ms-body" aria-label="Ficha do jogo">
        <div className="wrap ms-grid">
          <div className="ms-col">
            <h2 className="display ms-h2"><E path="jogos.eventsTitle" /></h2>
            <ol className="ms-events">
              <EList path={P + '.events'} newItem={{ min: "0'", team: 'away', type: 'golo', player: 'Jogador', detail: '' }} addLabel="Momento" render={(e, p) => (
                <li className={cx('ms-ev eitem sr', e.team === 'home' ? 'is-home' : 'is-away')}>
                  <E path={p + '.min'} className="ms-ev-min" />
                  <span className="ms-ev-ic" aria-hidden="true">{e.type === 'cartão' ? '▮' : e.type === 'substituição' ? '⇄' : '●'}</span>
                  <span className="ms-ev-b"><E path={p + '.player'} className="ms-ev-p" /><E path={p + '.detail'} className="ms-ev-d" placeholder="" /></span>
                  <span className="ms-ev-t">{rich(e.team === 'home' ? m.home : m.away)}</span>
                  {ed.editing && <><ESelect path={p + '.team'} label="Equipa" options={[['home', 'Casa'], ['away', 'Fora']]} /><ESelect path={p + '.type'} label="Tipo" options={[['golo', 'Golo'], ['cartão', 'Cartão'], ['substituição', 'Substituição']]} /></>}
                  <ItemTools />
                </li>
              )} />
            </ol>
            {!m.events?.length && !ed.editing && <p className="mt-empty">{final ? 'Sem golos neste jogo.' : 'O jogo ainda não se realizou.'}</p>}

            {article && (
              <Link href={'/relvado/' + article.slug} className="ms-analysis sr">
                {article.cover?.src && <SafeImg src={article.cover.src} alt="" style={{ objectPosition: article.cover.pos }} />}
                <span className="ms-analysis-b">
                  <span className="kicker acc">Relvado · 5 momentos</span>
                  <strong>{String(article.titleLines).replace(/\n/g, ' ')} {article.titleSerif}</strong>
                  <span className="ul0"><E path="jogos.analysisCta" /> →</span>
                </span>
              </Link>
            )}
          </div>

          <div className="ms-col">
            <h2 className="display ms-h2"><E path="jogos.statsTitle" /></h2>
            <div className="ms-stats-h"><span>{rich(m.home)}</span><span>{rich(m.away)}</span></div>
            <div className="ms-stats">
              <EList path={P + '.stats'} newItem={{ label: 'Estatística', home: '[—]', away: '[—]' }} addLabel="Estatística" render={(s, p) => <StatRow s={s} p={p} />} />
            </div>
            {(m.stats || []).some((s: any) => num(s.home) === null) && <p className="ms-note">Valores entre [ ] por confirmar com a ficha oficial do jogo.</p>}

            <h2 className="display ms-h2" style={{ marginTop: 48 }}><E path="jogos.lineupTitle" /></h2>
            <div className="ms-xi">
              {posOrder.map((g) => {
                const ps = xi.filter((p: any) => p.pos === g);
                if (!ps.length) return null;
                return (
                  <div key={g} className="ms-xi-g">
                    <span className="ms-xi-l">{posNames[g] || g}</span>
                    {ps.map((p: any) => (
                      <span key={p.id} className="ms-xi-p">
                        <span className="ms-xi-f">{p.photo?.src ? <SafeImg src={p.photo.src} alt="" style={{ objectPosition: p.photo.pos }} /> : p.ini}</span>
                        {p.name}{p.num ? <b> {p.num}</b> : null}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
            <E as="p" path="jogos.lineupNote" className="ms-note" />
            <Link href="/rubricas#jogadores" className="ul ul0 lnk" style={{ display: 'inline-flex', marginTop: 16 }}>Ver os jogadores <Arrow size={16} /></Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
