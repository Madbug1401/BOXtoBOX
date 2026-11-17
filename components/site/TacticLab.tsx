'use client';
import React, { useMemo, useState } from 'react';
import { E, useEditor, cx, SafeImg } from '@/components/editor/core';
import { getIn, setIn, clone } from '@/lib/paths';
import { FORMATIONS, POS_NAMES, ROLES, PLAYER_INSTR, TEAM_INSTR, ATTRS, roleOf, instrValue, type Instr } from '@/lib/tactics';

type Phase = 'posse' | 'transicao' | 'sem';
const PHASES: [Phase, string][] = [['posse', 'Com bola'], ['transicao', 'Transição'], ['sem', 'Sem bola']];

/** Pequenos desenhos dos cartões de instrução (originais, traço simples). */
function Glyph({ g }: { g: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const dot = (cx: number, cy: number, r = 3.2) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 5;
    return <g><line x1={x1} y1={y1} x2={x2} y2={y2} {...s} /><path d={`M${x2} ${y2}L${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)}M${x2} ${y2}L${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}`} {...s} /></g>;
  };
  const body: Record<string, React.ReactNode> = {
    width: <><rect x="12" y="6" width="40" height="22" {...s} />{arrow(32, 34, 10, 34)}{arrow(32, 34, 54, 34)}</>,
    runs: <>{dot(32, 33)}{arrow(22, 30, 22, 8)}{arrow(42, 30, 42, 8)}</>,
    freedom: <>{dot(32, 20, 4)}{arrow(32, 20, 32, 4)}{arrow(32, 20, 52, 20)}{arrow(32, 20, 12, 20)}{arrow(32, 20, 32, 36)}</>,
    hold: <><circle cx="32" cy="20" r="14" {...s} opacity=".35" /><circle cx="32" cy="20" r="9" {...s} opacity=".6" />{dot(32, 20, 4.5)}</>,
    dribble: <>{dot(10, 30)}<path d="M14 28 L22 18 L30 26 L38 14 L46 22" {...s} strokeDasharray="3 3" />{arrow(46, 22, 56, 12)}</>,
    shoot: <><rect x="14" y="6" width="36" height="20" {...s} />{dot(22, 14)}{dot(42, 18)}{arrow(32, 38, 32, 24)}</>,
    pass: <>{dot(10, 30)}<line x1="14" y1="28" x2="50" y2="10" {...s} strokeDasharray="4 3" /><path d="M24 14l4 4m0-4l-4 4M38 26l4 4m0-4l-4 4" {...s} /></>,
    cross: <><path d="M10 6v28M10 34h44" {...s} /><path d="M14 30 Q30 2 48 16" {...s} strokeDasharray="4 3" />{dot(48, 16)}</>,
    press: <>{dot(32, 20, 4.5)}{arrow(8, 8, 25, 16)}{arrow(56, 8, 39, 16)}{arrow(32, 38, 32, 27)}</>,
    close: <>{dot(10, 20)}{dot(54, 20)}<line x1="14" y1="20" x2="50" y2="20" {...s} strokeDasharray="4 3" /><path d="M27 13l10 14M37 13L27 27" {...s} /></>,
    mark: <><circle cx="32" cy="20" r="12" {...s} strokeDasharray="3 3" />{dot(28, 22)}{dot(37, 17, 2.6)}</>,
    tackle: <>{dot(24, 20, 4)}{arrow(46, 20, 30, 20)}<path d="M18 10l-6-4M18 30l-6 4" {...s} /></>,
    track: <>{dot(16, 26)}{dot(40, 14)}<path d="M20 24 Q30 18 36 16" {...s} strokeDasharray="3 3" />{arrow(40, 14, 54, 8)}</>,
    tempo: <><path d="M14 10l10 10-10 10M28 10l10 10-10 10M42 10l10 10-10 10" {...s} /></>,
    gk: <><path d="M20 6h24v10H20z" {...s} />{dot(32, 22)}{arrow(32, 26, 32, 38)}</>,
    zone: <><rect x="8" y="6" width="48" height="28" {...s} opacity=".5" /><path d="M24 6v28M40 6v28" {...s} opacity=".35" />{arrow(32, 30, 32, 10)}</>,
    block: <><rect x="8" y="4" width="48" height="32" {...s} opacity=".45" /><rect x="8" y="14" width="48" height="12" fill="currentColor" stroke="none" opacity=".35" /></>,
    line: <><rect x="8" y="4" width="48" height="32" {...s} opacity=".45" /><line x1="8" y1="24" x2="56" y2="24" {...s} />{arrow(32, 24, 32, 12)}</>,
    trigger: <><path d="M10 34V6" {...s} opacity=".45" />{dot(14, 20)}{arrow(50, 10, 22, 18)}{arrow(50, 30, 22, 22)}</>,
    compact: <><line x1="10" y1="12" x2="54" y2="12" {...s} /><line x1="10" y1="28" x2="54" y2="28" {...s} />{arrow(32, 4, 32, 11)}{arrow(32, 36, 32, 29)}</>
  };
  return <svg viewBox="0 0 64 40" className="tl-glyph" aria-hidden="true">{body[g] || body.freedom}</svg>;
}

/** Recorte da cara (mesmo cálculo do Plantel): leva o ponto da cara ao centro do círculo. */
function faceStyle(info: any): React.CSSProperties {
  const [x, y, z] = info?.face || [50, 25, 1];
  const fx = Math.min(Math.max(x, 1), 99), fy = Math.min(Math.max(y, 1), 99);
  const zoom = Math.max(z, 50 / fx, 50 / (100 - fx), 50 / fy, 50 / (100 - fy));
  return { width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%`, transform: `translate(${50 - x}%, ${50 - y}%) scale(${zoom.toFixed(2)})`, display: 'block' };
}

const Lock = () => <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" /><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>;

function InstrCard({ ins, value, locked, tweaked, onStep }: { ins: Instr; value: string; locked: boolean; tweaked: boolean; onStep: (d: number) => void }) {
  const i = ins.options.indexOf(value);
  return (
    <div className={cx('tl-card', locked && 'is-locked', tweaked && 'is-tweaked')}>
      <div className="tl-card-h"><span>{ins.label}</span>{locked && <span className="tl-lock" title="Bloqueada pela função"><Lock /></span>}{tweaked && <span className="tl-tw" title="Alterada" />}</div>
      <Glyph g={ins.glyph} />
      <div className="tl-val">
        <button type="button" className="tl-step" onClick={() => onStep(-1)} disabled={locked || i <= 0} aria-label={`${ins.label}: opção anterior`}>‹</button>
        <span className="tl-v" aria-live="polite">{value}</span>
        <button type="button" className="tl-step" onClick={() => onStep(1)} disabled={locked || i >= ins.options.length - 1} aria-label={`${ins.label}: opção seguinte`}>›</button>
      </div>
      <div className="tl-pips" aria-hidden="true">{ins.options.map((o, k) => <span key={o} className={k === i ? 'on' : ''} />)}</div>
    </div>
  );
}

function Radar({ attrs, editing, base }: { attrs: Record<string, string>; editing: boolean; base: string }) {
  const n = ATTRS.length, R = 52, C = 70;
  const pt = (k: number, r: number) => [C + r * Math.sin((2 * Math.PI * k) / n), C - r * Math.cos((2 * Math.PI * k) / n)];
  const vals = ATTRS.map((a) => { const v = parseFloat(String(attrs?.[a] ?? '')); return isFinite(v) ? Math.max(0, Math.min(20, v)) : null; });
  const known = vals.every((v) => v !== null);
  const poly = known ? vals.map((v, k) => pt(k, (R * (v as number)) / 20).join(',')).join(' ') : '';
  return (
    <div className="tl-radar">
      <svg viewBox="0 0 140 140" role="img" aria-label={known ? 'Atributos: ' + ATTRS.map((a, k) => `${a} ${vals[k]}`).join(', ') : 'Atributos por confirmar'}>
        {[1, 0.66, 0.33].map((f) => <polygon key={f} points={ATTRS.map((_, k) => pt(k, R * f).join(',')).join(' ')} className="tl-grid" />)}
        {ATTRS.map((_, k) => { const [x, y] = pt(k, R); return <line key={k} x1={C} y1={C} x2={x} y2={y} className="tl-grid" />; })}
        {known && <polygon points={poly} className="tl-poly" />}
      </svg>
      <ul className="tl-attrs">
        {ATTRS.map((a, k) => (
          <li key={a}><span>{a}</span>{editing ? <E path={`${base}.attrs.${a}`} className="tl-attr-v" placeholder="—" /> : <strong className={vals[k] === null ? 'ph-note' : ''}>{vals[k] === null ? (attrs?.[a] || '[—]') : vals[k]}</strong>}</li>
        ))}
      </ul>
      {!known && <p className="tl-note">Atributos por confirmar{editing ? ' — escreve valores de 1 a 20.' : '.'}</p>}
    </div>
  );
}

/** Posição de um jogador no campo, consoante a fase e as instruções de equipa. */
function place(x: number, y: number, code: string, phase: Phase, team: any) {
  if (code === 'GR') return [x, phase === 'posse' ? y - 2 : y];
  let nx = x, ny = y;
  if (phase === 'posse') {
    const w = team?.posse?.tWidth || 'Normal';
    const spread = w === 'Largo' ? 1.18 : w === 'Estreito' ? 0.86 : 1.06;
    nx = 50 + (x - 50) * spread;
    ny = y - 9;
  } else if (phase === 'sem') {
    const b = team?.sem?.block || 'Médio';
    const shift = b === 'Alto' ? -10 : b === 'Baixo' ? 9 : 2;
    const c = team?.sem?.compact || 'Normal';
    const squeeze = c === 'Curta' ? 0.8 : c === 'Longa' ? 1.08 : 0.92;
    nx = 50 + (x - 50) * 0.88;
    ny = 55 + (y - 55) * squeeze + shift;
  }
  return [Math.max(5, Math.min(95, nx)), Math.max(6, Math.min(94, ny))];
}

export function TacticLab({ path, fallback }: { path: string; fallback?: any }) {
  const ed = useEditor();
  // `fallback`: conteúdo guardado antes de existir o laboratório não tem `tactic` — usa o do conteúdo inicial.
  const stored = getIn(ed.content, path) ?? fallback;
  const [local, setLocal] = useState<any>(() => clone(stored));
  const [hist, setHist] = useState<any[]>([]);
  const [phase, setPhase] = useState<Phase>('posse');
  const [sel, setSel] = useState<number | null>(null);
  const t = ed.editing ? stored : local;
  const players = useMemo(() => ed.content.players || [], [ed.content.players]);
  if (!t) return null;

  const formation = FORMATIONS[t.formation] ? t.formation : '4-4-2';
  const slots = FORMATIONS[formation];
  const set = (sub: string, value: any) => {
    if (ed.editing) return ed.set(`${path}.${sub}`, value);
    setHist((h) => [...h.slice(-40), local]);
    setLocal((l: any) => setIn(l, sub, value));
  };
  const undo = () => {
    if (ed.editing) return ed.undo();
    setHist((h) => { if (!h.length) return h; setLocal(h[h.length - 1]); return h.slice(0, -1); });
  };
  const reset = () => { setHist([]); setLocal(clone(stored)); };
  const changed = !ed.editing && JSON.stringify(local) !== JSON.stringify(stored);

  const sp = sel !== null ? t.players?.[sel] : null;
  const slot = sel !== null ? slots[sel] : null;
  const role = slot ? roleOf(slot.code, sp?.role) : null;
  const pinfo = (p: any) => players.find((x: any) => x.id === p?.pid);

  const stepTeam = (ins: Instr, cur: string, d: number) => {
    const k = ins.options.indexOf(cur) + d;
    if (k >= 0 && k < ins.options.length) set(`team.${phase}.${ins.key}`, ins.options[k]);
  };
  const stepPlayer = (ins: Instr, cur: string, d: number, ph: 'posse' | 'sem') => {
    const k = ins.options.indexOf(cur) + d;
    if (sel === null || k < 0 || k >= ins.options.length) return;
    // "Aplicar a posição": a instrução passa para todos os jogadores com o mesmo código de posição.
    const targets = sp?.apply === 'jogador' ? [sel] : slots.map((s, i) => (s.code === slot!.code ? i : -1)).filter((i) => i >= 0);
    if (ed.editing) targets.forEach((i) => ed.set(`${path}.players.${i}.${ph}.${ins.key}`, ins.options[k]));
    else {
      setHist((h) => [...h.slice(-40), local]);
      setLocal((l: any) => targets.reduce((acc, i) => setIn(acc, `players.${i}.${ph}.${ins.key}`, ins.options[k]), l));
    }
  };

  return (
    <section className="tl" aria-labelledby="tl-h">
      <div className="tl-top">
        <div>
          <E as="p" path={`${path}.kicker`} className="kicker tl-k" />
          <h2 id="tl-h" className="display tl-title"><E path={`${path}.title`} /> <E path={`${path}.titleSerif`} className="serif acc" /></h2>
          <E as="p" path={`${path}.intro`} className="tl-intro" multiline />
        </div>
        <div className="tl-tools">
          <label className="tl-form"><span>Formação</span>
            <select value={formation} onChange={(e) => { set('formation', e.target.value); }}>
              {Object.keys(FORMATIONS).map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <button type="button" className="tl-btn" onClick={undo} disabled={ed.editing ? !ed.canUndo : !hist.length}>Desfazer</button>
          {!ed.editing && <button type="button" className="tl-btn" onClick={reset} disabled={!changed}>Repor o plano</button>}
        </div>
      </div>

      <div className="tl-bar">
        <div role="tablist" aria-label="Fase do jogo" className="tl-tabs">
          {PHASES.map(([k, l]) => <button key={k} role="tab" type="button" aria-selected={phase === k} className={cx('tl-tab', phase === k && 'on')} onClick={() => setPhase(k)}>{l}</button>)}
        </div>
        <div className="tl-legend"><span><Lock /> Bloqueada pela função</span><span><i className="tl-tw" /> Alterada</span>{changed && <span className="tl-mine">A ver a tua versão</span>}</div>
      </div>

      <div className="tl-body">
        <div className="tl-pitchcol">
          <div className="tl-pitch" role="group" aria-label={`Campo: ${formation}, ${PHASES.find((p) => p[0] === phase)![1].toLowerCase()}`}>
            <div className="pl-line pl-mid" aria-hidden="true" /><div className="pl-circle" aria-hidden="true" /><div className="pl-box pl-top" aria-hidden="true" /><div className="pl-box pl-bot" aria-hidden="true" />
            <span className="tl-dir" aria-hidden="true">Ataque ↑</span>
            {slots.map((s, i) => {
              const p = t.players?.[i] || {};
              const info = pinfo(p);
              const [x, y] = place(s.x, s.y, s.code, phase, t.team);
              const r = roleOf(s.code, p.role);
              return (
                <div key={i} className="tl-slot" style={{ transform: `translate(${x}%, ${y}%)`, transitionDelay: `${(i * 0.03).toFixed(2)}s` }}>
                  <button type="button" className={cx('tl-tok', sel === i && 'on')} onClick={() => setSel(sel === i ? null : i)} aria-pressed={sel === i} aria-label={`${p.name || info?.name || s.code}, ${POS_NAMES[s.code]}, ${r.name}`}>
                    <span className="tl-face">
                      {info?.photo?.src ? <SafeImg src={info.photo.src} alt="" style={faceStyle(info)} /> : <span>{p.ini || info?.ini || s.code}</span>}
                    </span>
                    <span className="tl-tname">{p.name || info?.short || s.code}</span>
                    <span className="tl-trole">{s.code} · {r.name}</span>
                  </button>
                </div>
              );
            })}
          </div>
          <p className="tl-hint">Toca num jogador para ver a função e as instruções. Muda a fase e a formação para ver a equipa a mexer.</p>
        </div>

        <div className="tl-panel">
          {sp && slot && role ? (
            <div className="tl-pl">
              <div className="tl-pl-h">
                <div className="tl-pl-face">{pinfo(sp)?.photo?.src ? <SafeImg src={pinfo(sp).photo.src} alt="" style={faceStyle(pinfo(sp))} /> : <span>{sp.ini || slot.code}</span>}</div>
                <div className="tl-pl-id">
                  <span className="tl-pl-pos">{POS_NAMES[slot.code]}</span>
                  <strong>{sp.name || pinfo(sp)?.name}</strong>
                  {ed.editing && <span className="e-note">Jogador: <E path={`${path}.players.${sel}.name`} /> · iniciais <E path={`${path}.players.${sel}.ini`} /> · id do plantel <E path={`${path}.players.${sel}.pid`} /></span>}
                </div>
                <button type="button" className="tl-x" onClick={() => setSel(null)} aria-label="Fechar jogador">×</button>
              </div>
              <div className="tl-row">
                <label className="tl-sel"><span>Função</span>
                  <select value={role.key} onChange={(e) => set(`players.${sel}.role`, e.target.value)}>
                    {(ROLES[slot.code] || []).map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
                  </select>
                </label>
                <div className="tl-apply" role="group" aria-label="Aplicar instruções a">
                  <span>Aplicar a</span>
                  <button type="button" aria-pressed={sp.apply !== 'jogador'} className={cx(sp.apply !== 'jogador' && 'on')} onClick={() => set(`players.${sel}.apply`, 'posicao')}>Posição</button>
                  <button type="button" aria-pressed={sp.apply === 'jogador'} className={cx(sp.apply === 'jogador' && 'on')} onClick={() => set(`players.${sel}.apply`, 'jogador')}>Jogador</button>
                </div>
              </div>
              <p className="tl-roledesc">{role.desc} {sp.apply === 'jogador' ? 'As instruções valem só para este jogador.' : `As instruções valem para todos os ${POS_NAMES[slot.code].toLowerCase()}s.`}</p>
              <div className="tl-plgrid">
                <Radar attrs={sp.attrs || {}} editing={ed.editing} base={`${path}.players.${sel}`} />
                <div className="tl-cards">
                  {phase === 'transicao' ? (
                    <p className="tl-note tl-note-box">Na transição o jogador segue as instruções de equipa desta fase. Vê "Com bola" e "Sem bola" para as instruções individuais.</p>
                  ) : PLAYER_INSTR[phase].map((ins) => {
                    const v = instrValue(ins, role, sp[phase]);
                    return <InstrCard key={ins.key} ins={ins} {...v} onStep={(d) => stepPlayer(ins, v.value, d, phase)} />;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="tl-team">
              <div className="tl-team-h"><strong>Instruções de equipa</strong><span>{PHASES.find((p) => p[0] === phase)![1]}</span></div>
              <div className="tl-cards tl-cards-team">
                {TEAM_INSTR[phase].map((ins) => {
                  const cur = t.team?.[phase]?.[ins.key];
                  const value = cur && ins.options.includes(cur) ? cur : ins.def;
                  return <InstrCard key={ins.key} ins={ins} value={value} locked={false} tweaked={value !== ins.def} onStep={(d) => stepTeam(ins, value, d)} />;
                })}
              </div>
              <E as="p" path={`${path}.notes.${phase}`} className="tl-team-note" multiline />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
