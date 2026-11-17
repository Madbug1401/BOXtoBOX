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
  const next = all.find((m) => m.status !== 'final');
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

      <Calendar all={all} team={team} onAdd={ed.editing ? addMatch : undefined} />
      <Stats all={all} team={team} />

      <section className="mt-links-s" aria-label="Mais">
        <div className="wrap mt-links">
          <Link href={j.plantelCta?.href || '/rubricas#jogadores'} className="btn pill pill-acc">{j.plantelCta?.label || 'Ver os jogadores'} <Arrow /></Link>
          <Link href="/relvado" className="btn pill pill-ghost">Análises no Relvado <Arrow /></Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
type Res = 'V' | 'E' | 'D';
const RES_NAME: Record<Res, string> = { V: 'Vitória', E: 'Empate', D: 'Derrota' };
/** Resultado do ponto de vista da seleção (só lê o marcador, nada inventado). */
export function resultOf(m: any, team: string): { r: Res; gm: number; gs: number } | null {
  if (m.status !== 'final') return null;
  const a = parseInt(m.hs, 10), b = parseInt(m.as, 10);
  if (!isFinite(a) || !isFinite(b) || (m.home !== team && m.away !== team)) return null;
  const gm = m.home === team ? a : b, gs = m.home === team ? b : a;
  return { r: gm > gs ? 'V' : gm === gs ? 'E' : 'D', gm, gs };
}
const known = (v: string) => !!v && String(v).trim()[0] !== '[';
const dateBits = (d: string) => {
  const t = Date.parse(d);
  if (!known(d) || !isFinite(t)) return null;
  const x = new Date(t);
  return { day: x.getDate(), mon: x.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', ''), wd: x.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '') };
};

function Calendar({ all, team, onAdd }: { all: any[]; team: string; onAdd?: () => void }) {
  // Os jogos estão guardados do mais recente para o mais antigo; o calendário lê-se em ordem cronológica.
  const chron = all.slice().reverse();
  const comps = Array.from(new Set(chron.map((m) => m.comp)));
  const [comp, setComp] = useState('all');
  const [st, setSt] = useState<'all' | 'next' | 'done'>('all');
  const list = chron.filter((m) => (comp === 'all' || m.comp === comp) && (st === 'all' || (st === 'next' ? m.status !== 'final' : m.status === 'final')));
  const groups: { comp: string; items: any[] }[] = [];
  list.forEach((m) => { const g = groups[groups.length - 1]; if (g && g.comp === m.comp) g.items.push(m); else groups.push({ comp: m.comp, items: [m] }); });
  return (
    <section className="mt-cal" aria-labelledby="cal-h" id="calendario">
      <div className="wrap">
        <div className="mt-list-h">
          <h2 id="cal-h" className="display h-lg">Calendário <span className="serif acc">da seleção.</span></h2>
          <div className="mt-filters">
            <div role="group" aria-label="Estado" className="mt-chips">
              {([['all', 'Todos'], ['next', 'Por jogar'], ['done', 'Terminados']] as const).map(([k, l]) => (
                <button key={k} type="button" aria-pressed={st === k} className={cx('mt-chip', st === k && 'on')} onClick={() => setSt(k)}>{l}</button>
              ))}
            </div>
            <div role="group" aria-label="Competição" className="mt-chips">
              {['all', ...comps].map((k) => (
                <button key={k} type="button" aria-pressed={comp === k} className={cx('mt-chip', comp === k && 'on')} onClick={() => setComp(k)}>{k === 'all' ? 'Todas as provas' : rich(k)}</button>
              ))}
            </div>
          </div>
        </div>
        {onAdd && <button type="button" className="e-add" onClick={onAdd}>+ Novo jogo</button>}
        {groups.map((g, gi) => (
          <div key={gi} className="mt-cal-g">
            <div className="mt-cal-gh"><span>{rich(g.comp)}</span><i /><em>{g.items.length} jogo{g.items.length > 1 ? 's' : ''}</em></div>
            <ol className="mt-cal-list">
              {g.items.map((m) => {
                const r = resultOf(m, team);
                const d = dateBits(m.date);
                return (
                  <li key={m.slug}>
                    <Link href={'/jogos/' + m.slug} className={cx('mt-cal-row', m.status !== 'final' && 'is-next')}>
                      <span className="mt-cal-d">
                        {d ? <><b>{d.day}</b><span>{d.mon} · {d.wd}</span></> : <><b className="dim">—</b><span>{rich(m.date)}</span></>}
                      </span>
                      <span className="mt-cal-stage">{rich(m.stage)}<span>{rich(m.city)}{known(m.venue) ? ' · ' + m.venue : ''}</span></span>
                      <Score m={m} team={team} />
                      <span className="mt-cal-r">
                        {r ? <span className={cx('mt-res', 'r-' + r.r)} title={RES_NAME[r.r]}>{r.r}</span> : <span className="mt-res r-next">{known(m.time) ? m.time : 'Por jogar'}</span>}
                        {m.extra && <em>{m.extra}</em>}
                      </span>
                      <span className="mt-row-go" aria-hidden="true"><Arrow size={18} /></span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
        {!list.length && <p className="mt-empty">Nenhum jogo com estes filtros.</p>}
      </div>
    </section>
  );
}

function Stats({ all, team }: { all: any[]; team: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const chron = all.slice().reverse();
  const played = chron.map((m) => ({ m, r: resultOf(m, team) })).filter((x) => x.r) as { m: any; r: { r: Res; gm: number; gs: number } }[];
  if (!played.length) return null;
  const n = played.length;
  const gm = played.reduce((a, x) => a + x.r.gm, 0), gs = played.reduce((a, x) => a + x.r.gs, 0);
  const clean = played.filter((x) => x.r.gs === 0).length;
  const scored = played.filter((x) => x.r.gm > 0).length;
  const unbeaten90 = played.filter((x) => x.r.r !== 'D' || x.m.extra).length;
  const form = played.slice(-5);
  const maxG = Math.max(1, ...played.map((x) => Math.max(x.r.gm, x.r.gs)));

  // Marcadores: lidos dos eventos de golo da seleção (nomes por confirmar ficam de fora).
  const scorers: Record<string, number> = {};
  played.forEach(({ m }) => {
    const side = m.home === team ? 'home' : 'away';
    (m.events || []).forEach((e: any) => { if (e.type === 'golo' && e.team === side && known(e.player)) scorers[e.player] = (scorers[e.player] || 0) + 1; });
  });
  const scorerList = Object.entries(scorers).sort((a, b) => b[1] - a[1]);
  const topS = Math.max(1, ...scorerList.map((x) => x[1]));

  // Golos por período (só eventos com minuto conhecido).
  const bins = ["0–15'", "16–30'", "31–45'", "46–60'", "61–75'", "76–90'", 'Prol.'];
  const per = bins.map(() => ({ us: 0, them: 0 }));
  let noMin = 0;
  played.forEach(({ m }) => {
    const side = m.home === team ? 'home' : 'away';
    (m.events || []).forEach((e: any) => {
      if (e.type !== 'golo') return;
      const v = parseInt(String(e.min), 10);
      if (!isFinite(v)) { if (e.team === side) noMin++; return; }
      const k = v > 90 ? 6 : Math.max(0, Math.min(5, Math.floor((v - 1) / 15)));
      if (e.team === side) per[k].us++; else per[k].them++;
    });
  });
  const maxP = Math.max(1, ...per.map((p) => Math.max(p.us, p.them)));

  const comps = Array.from(new Set(played.map((x) => x.m.comp))).map((c) => {
    const xs = played.filter((x) => x.m.comp === c);
    return { c, j: xs.length, v: xs.filter((x) => x.r.r === 'V').length, e: xs.filter((x) => x.r.r === 'E').length, d: xs.filter((x) => x.r.r === 'D').length, gm: xs.reduce((a, x) => a + x.r.gm, 0), gs: xs.reduce((a, x) => a + x.r.gs, 0) };
  });

  // Médias da ficha de jogo (só valores numéricos confirmados).
  const labels: string[] = Array.from(new Set(played.flatMap((x) => (x.m.stats || []).map((s: any) => s.label))));
  const avgs = labels.map((l) => {
    const vals = played.map(({ m }) => {
      const s = (m.stats || []).find((x: any) => x.label === l);
      if (!s) return null;
      const us = parseFloat(m.home === team ? s.home : s.away), them = parseFloat(m.home === team ? s.away : s.home);
      return isFinite(us) && isFinite(them) ? [us, them] : null;
    }).filter(Boolean) as number[][];
    return { l, k: vals.length, us: vals.length ? vals.reduce((a, v) => a + v[0], 0) / vals.length : 0, them: vals.length ? vals.reduce((a, v) => a + v[1], 0) / vals.length : 0 };
  });
  const f1 = (v: number) => (Math.round(v * 10) / 10).toLocaleString('pt-PT');
  const hv = hover !== null ? played[hover] : null;

  return (
    <section className="mt-stats" aria-labelledby="st-h" id="estatistica">
      <div className="wrap">
        <div className="mt-list-h">
          <h2 id="st-h" className="display h-lg">Estatística <span className="serif acc">dos jogos.</span></h2>
          <p className="mt-st-note">Calculada a partir dos resultados e dos eventos de cada ficha de jogo. Valores ainda por confirmar não entram nas contas.</p>
        </div>

        <div className="mt-kpis">
          <div className="mt-kpi mt-kpi-form">
            <span className="mt-kpi-l">Forma · últimos {form.length}</span>
            <span className="mt-form">{form.map((x, i) => <span key={i} className={cx('mt-res', 'r-' + x.r.r)} title={`${RES_NAME[x.r.r]}: ${x.m.home} ${x.m.hs}–${x.m.as} ${x.m.away}`}>{x.r.r}</span>)}</span>
            <span className="mt-kpi-s">do mais antigo ao mais recente</span>
          </div>
          <div className="mt-kpi"><span className="mt-kpi-l">Marcados por jogo</span><strong>{f1(gm / n)}</strong><span className="mt-kpi-s">{gm} golos em {n} jogos</span></div>
          <div className="mt-kpi"><span className="mt-kpi-l">Sofridos por jogo</span><strong>{f1(gs / n)}</strong><span className="mt-kpi-s">{gs} golos em {n} jogos</span></div>
          <div className="mt-kpi"><span className="mt-kpi-l">Jogos sem sofrer</span><strong>{clean}</strong><span className="mt-kpi-s">{Math.round((clean / n) * 100)}% dos jogos</span></div>
          <div className="mt-kpi"><span className="mt-kpi-l">Jogos a marcar</span><strong>{scored}</strong><span className="mt-kpi-s">{Math.round((scored / n) * 100)}% dos jogos</span></div>
          <div className="mt-kpi"><span className="mt-kpi-l">Sem perder nos 90&apos;</span><strong>{unbeaten90}<small>/{n}</small></strong><span className="mt-kpi-s">o prolongamento não conta</span></div>
        </div>

        <div className="mt-charts">
          <figure className="mt-chart mt-chart-wide">
            <figcaption><strong>Golos jogo a jogo</strong><span className="mt-legend"><i className="k-us" />Marcados <i className="k-them" />Sofridos</span></figcaption>
            <div className="mt-gbars" role="list" onMouseLeave={() => setHover(null)}>
              {played.map((x, i) => (
                <div key={x.m.slug} role="listitem" className={cx('mt-gb', hover === i && 'on')} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
                  aria-label={`${x.m.home} ${x.m.hs}–${x.m.as} ${x.m.away}: ${x.r.gm} marcados, ${x.r.gs} sofridos`}>
                  <div className="mt-gb-plot">
                    <span className="mt-gb-half up"><span className="k-us" style={{ height: `${(x.r.gm / maxG) * 100}%` }}>{x.r.gm > 0 && <em>{x.r.gm}</em>}</span></span>
                    <span className="mt-gb-axis" />
                    <span className="mt-gb-half dn"><span className="k-them" style={{ height: `${(x.r.gs / maxG) * 100}%` }}>{x.r.gs > 0 && <em>{x.r.gs}</em>}</span></span>
                  </div>
                  <span className="mt-gb-l">{x.m.home === team ? x.m.away : x.m.home}<span className={cx('mt-res mt-res-s', 'r-' + x.r.r)}>{x.r.r}</span></span>
                </div>
              ))}
            </div>
            <p className="mt-tip" aria-live="polite">{hv ? <><b>{hv.m.home} {hv.m.hs}–{hv.m.as} {hv.m.away}</b>{hv.m.extra ? ` (${hv.m.extra})` : ''} · {rich(hv.m.stage)} · {rich(hv.m.city)}</> : 'Passa o rato (ou o foco) por um jogo para ver o resultado.'}</p>
          </figure>

          <figure className="mt-chart">
            <figcaption><strong>Marcadores</strong><span>Golos com a camisola azul</span></figcaption>
            {scorerList.length ? (
              <ol className="mt-scorers">
                {scorerList.map(([name, g], i) => (
                  <li key={name} title={`${name}: ${g} golo${g > 1 ? 's' : ''}`}>
                    <span className="mt-sc-n">{i + 1}</span><span className="mt-sc-name">{name}</span>
                    <span className="mt-sc-bar"><i style={{ transform: `scaleX(${g / topS})` }} /></span><b>{g}</b>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-empty">Sem golos registados.</p>}
          </figure>

          <figure className="mt-chart">
            <figcaption><strong>Golos por período</strong><span className="mt-legend"><i className="k-us" />Marcados <i className="k-them" />Sofridos</span></figcaption>
            <div className="mt-per">
              {per.map((p, i) => (
                <div key={i} className="mt-per-c" title={`${bins[i]}: ${p.us} marcados, ${p.them} sofridos`}>
                  <div className="mt-per-plot">
                    <span className="k-us" style={{ height: `${(p.us / maxP) * 100}%` }}>{p.us > 0 && <em>{p.us}</em>}</span>
                    <span className="k-them" style={{ height: `${(p.them / maxP) * 100}%` }}>{p.them > 0 && <em>{p.them}</em>}</span>
                  </div>
                  <span className="mt-per-l">{bins[i]}</span>
                </div>
              ))}
            </div>
            {noMin > 0 && <p className="mt-st-small">{noMin} golo{noMin > 1 ? 's' : ''} da seleção ainda sem minuto confirmado na ficha.</p>}
          </figure>

          <figure className="mt-chart">
            <figcaption><strong>Por competição</strong><span>Balanço calculado</span></figcaption>
            <table className="mt-table">
              <thead><tr><th scope="col">Prova</th><th scope="col" title="Jogos">J</th><th scope="col" title="Vitórias">V</th><th scope="col" title="Empates">E</th><th scope="col" title="Derrotas">D</th><th scope="col" title="Golos marcados">GM</th><th scope="col" title="Golos sofridos">GS</th><th scope="col" title="Diferença de golos">DG</th></tr></thead>
              <tbody>{comps.map((c) => <tr key={c.c}><th scope="row">{rich(c.c)}</th><td>{c.j}</td><td>{c.v}</td><td>{c.e}</td><td>{c.d}</td><td>{c.gm}</td><td>{c.gs}</td><td>{c.gm - c.gs > 0 ? '+' : ''}{c.gm - c.gs}</td></tr>)}</tbody>
            </table>
          </figure>

          <figure className="mt-chart">
            <figcaption><strong>Médias por jogo</strong><span className="mt-legend"><i className="k-us" />Cabo Verde <i className="k-them" />Adversários</span></figcaption>
            <ul className="mt-avgs">
              {avgs.map((a) => (
                <li key={a.l}>
                  <span className="mt-avg-l">{a.l}</span>
                  {a.k ? (
                    <span className="mt-avg-v"><b>{f1(a.us)}</b><span className="mt-avg-bar"><i className="k-us" style={{ flexGrow: a.us || 0.001 }} /><i className="k-them" style={{ flexGrow: a.them || 0.001 }} /></span><b>{f1(a.them)}</b></span>
                  ) : <span className="ph-note mt-avg-na">por confirmar</span>}
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </div>
    </section>
  );
}
