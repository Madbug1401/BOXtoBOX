'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { E, useEditor, cx, SafeImg } from '@/components/editor/core';
import { getIn, clone } from '@/lib/paths';
import { seed } from '@/lib/seed';
import {
  MOMENTS, FORMATIONS, POS_NAMES, ROLES, PLAYER_INSTR, TEAM_INSTR, ATTRS, MENTALITIES, STYLES, DUTY_NAMES,
  SP_ROUTINES, SP_ATTACK_JOBS, SP_DEFEND_JOBS, SP_DELIVERY, SP_DELIVERY_FK, SP_SYSTEM, SP_SIDES,
  normalize, slotRole, instrValue, teamValue, positionFor, ballFor, spPositions, spJob, spTaker, fitOf, roleAbility, attrNum,
  familiarity, intensity, withScoutFallback, intensityLabel, fluidity, profile, analyse, teamSummary, diffCount,
  type MomentKey, type Tactic, type Instr, type Duty, type SPKey
} from '@/lib/tactics';

type TeamM = 'ataque' | 'defesa' | 'transof' | 'transdef';
type View = 'funcao' | 'adequacao' | 'movimento';

// ---------------------------------------------------------------------------
// Desenhos dos cartões (originais, traço simples).
function Glyph({ g }: { g: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const dot = (cx: number, cy: number, r = 3.2) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;
  const arrow = (x1: number, y1: number, x2: number, y2: number, dash?: string) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 5;
    return <g><line x1={x1} y1={y1} x2={x2} y2={y2} {...s} strokeDasharray={dash} /><path d={`M${x2} ${y2}L${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)}M${x2} ${y2}L${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}`} {...s} /></g>;
  };
  const x = (cx: number, cy: number) => <path d={`M${cx - 3} ${cy - 3}l6 6m0-6l-6 6`} {...s} />;
  const goal = <path d="M16 4v8h32V4" {...s} />;
  const body: Record<string, React.ReactNode> = {
    width: <><rect x="12" y="6" width="40" height="22" {...s} />{arrow(32, 34, 10, 34)}{arrow(32, 34, 54, 34)}</>,
    runs: <>{dot(32, 33)}{arrow(22, 30, 22, 8)}{arrow(42, 30, 42, 8)}</>,
    freedom: <>{dot(32, 20, 4)}{arrow(32, 20, 32, 4, '2 3')}{arrow(32, 20, 52, 20, '2 3')}{arrow(32, 20, 12, 20, '2 3')}{arrow(32, 20, 32, 36, '2 3')}</>,
    hold: <><circle cx="32" cy="20" r="15" {...s} opacity=".3" /><circle cx="32" cy="20" r="10" {...s} opacity=".6" />{dot(32, 20, 5)}</>,
    dribble: <>{dot(10, 30)}<path d="M14 28 L22 18 L30 26 L38 14 L46 22" {...s} strokeDasharray="3 3" />{x(26, 12)}{x(40, 30)}{arrow(46, 22, 56, 12)}</>,
    shoot: <><rect x="14" y="5" width="36" height="20" {...s} />{dot(22, 13)}{dot(42, 17)}{arrow(32, 38, 32, 26)}</>,
    pass: <>{dot(10, 31)}<line x1="14" y1="29" x2="50" y2="10" {...s} strokeDasharray="4 3" />{x(26, 16)}{x(40, 26)}{dot(52, 9, 2.6)}</>,
    cross: <><path d="M10 4v30M10 34h44" {...s} opacity=".5" /><path d="M14 30 Q30 2 48 16" {...s} strokeDasharray="4 3" />{dot(48, 16)}</>,
    crossfrom: <><rect x="8" y="4" width="48" height="32" {...s} opacity=".4" /><rect x="8" y="4" width="8" height="32" fill="currentColor" opacity=".35" />{goal}{arrow(12, 30, 30, 12, '3 3')}</>,
    target: <>{goal}<circle cx="24" cy="18" r="5" {...s} /><circle cx="32" cy="18" r="5" {...s} opacity=".45" /><circle cx="40" cy="18" r="5" {...s} opacity=".45" />{arrow(56, 34, 28, 22, '3 3')}</>,
    press: <>{dot(32, 20, 4.5)}{arrow(8, 8, 25, 16)}{arrow(56, 8, 39, 16)}{arrow(32, 38, 32, 27)}</>,
    close: <>{dot(10, 20)}{dot(54, 20)}<line x1="14" y1="20" x2="50" y2="20" {...s} strokeDasharray="4 3" />{x(32, 20)}</>,
    mark: <><circle cx="32" cy="20" r="12" {...s} strokeDasharray="3 3" />{dot(28, 22)}{dot(37, 17, 2.6)}</>,
    tackle: <>{dot(24, 20, 4)}{arrow(46, 20, 30, 20)}<path d="M18 10l-6-4M18 30l-6 4" {...s} /></>,
    track: <>{dot(16, 26)}{dot(40, 14)}<path d="M20 24 Q30 18 36 16" {...s} strokeDasharray="3 3" />{arrow(40, 14, 54, 8)}</>,
    showonto: <>{dot(32, 14, 4)}{arrow(32, 18, 18, 34)}<path d="M38 22l10 12" {...s} opacity=".35" strokeDasharray="2 3" /></>,
    counter: <>{dot(14, 32)}{arrow(16, 30, 30, 18)}{arrow(30, 18, 52, 6)}<path d="M36 36h16" {...s} opacity=".35" /></>,
    regroup: <>{dot(32, 8)}{arrow(14, 10, 22, 28)}{arrow(50, 10, 42, 28)}{arrow(32, 12, 32, 30)}<path d="M12 34h40" {...s} opacity=".5" /></>,
    tempo: <><path d="M14 10l10 10-10 10M28 10l10 10-10 10M42 10l10 10-10 10" {...s} /></>,
    build: <>{dot(32, 34)}{arrow(32, 32, 20, 22)}{arrow(20, 22, 30, 10)}{arrow(32, 32, 46, 6, '4 4')}</>,
    box: <><path d="M14 4v18h36V4" {...s} />{dot(32, 30)}{arrow(32, 28, 32, 12)}</>,
    clock: <><circle cx="32" cy="20" r="14" {...s} /><path d="M32 11v9l6 4" {...s} /></>,
    gk: <><path d="M20 6h24v10H20z" {...s} />{dot(32, 22)}{arrow(32, 26, 32, 38)}</>,
    gktarget: <>{dot(32, 34)}{arrow(32, 32, 14, 14)}{arrow(32, 32, 50, 14)}{arrow(32, 32, 32, 6)}</>,
    zone: <><rect x="8" y="6" width="48" height="28" {...s} opacity=".5" /><path d="M24 6v28M40 6v28" {...s} opacity=".35" />{arrow(32, 30, 32, 10)}</>,
    block: <><rect x="8" y="4" width="48" height="32" {...s} opacity=".45" /><rect x="8" y="14" width="48" height="12" fill="currentColor" stroke="none" opacity=".35" /></>,
    line: <><rect x="8" y="4" width="48" height="32" {...s} opacity=".45" /><line x1="8" y1="24" x2="56" y2="24" {...s} />{arrow(32, 24, 32, 12)}</>,
    trigger: <><path d="M10 34V6" {...s} opacity=".45" />{dot(14, 20)}{arrow(50, 10, 22, 18)}{arrow(50, 30, 22, 22)}</>,
    compact: <><line x1="10" y1="12" x2="54" y2="12" {...s} /><line x1="10" y1="28" x2="54" y2="28" {...s} />{arrow(32, 4, 32, 11)}{arrow(32, 36, 32, 29)}</>,
    funnel: <><path d="M8 6l20 14L8 34M56 6L36 20l20 14" {...s} opacity=".45" />{dot(32, 20)}</>,
    offside: <><line x1="6" y1="22" x2="58" y2="22" {...s} strokeDasharray="5 3" />{dot(20, 26)}{dot(44, 26)}{dot(32, 12)}{arrow(20, 26, 20, 31)}{arrow(44, 26, 44, 31)}</>
  };
  return <svg viewBox="0 0 64 40" className="tl-glyph" aria-hidden="true">{body[g] || body.freedom}</svg>;
}

const Lock = () => <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" /><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>;
const Thumb = ({ up }: { up: boolean }) => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" style={{ transform: up ? undefined : 'rotate(180deg)' }}><path d="M2 9h3v9H2zM7 18h7.5a2 2 0 0 0 2-1.6l1.3-6A2 2 0 0 0 15.8 8H12l.7-3.6A1.8 1.8 0 0 0 9.3 3.6L7 9z" fill="currentColor" /></svg>
);

function faceStyle(info: any): React.CSSProperties {
  const [x, y, z] = info?.face || [50, 25, 1];
  const fx = Math.min(Math.max(x, 1), 99), fy = Math.min(Math.max(y, 1), 99);
  const zoom = Math.max(z, 50 / fx, 50 / (100 - fx), 50 / fy, 50 / (100 - fy));
  return { width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%`, transform: `translate(${50 - x}%, ${50 - y}%) scale(${zoom.toFixed(2)})`, display: 'block' };
}
function Face({ info, fallback, className }: { info: any; fallback: string; className?: string }) {
  return <span className={className}>{info?.photo?.src ? <SafeImg src={info.photo.src} alt="" style={faceStyle(info)} /> : <span>{info?.ini || fallback}</span>}</span>;
}
function Stars({ v }: { v: number | null }) {
  if (v === null) return <span className="tl-stars tl-stars-na">Sem avaliação</span>;
  return (
    <span className="tl-stars" role="img" aria-label={`${v} de 5 estrelas`}>
      {[0, 1, 2, 3, 4].map((k) => <span key={k} className={cx('tl-star', v >= k + 1 ? 'full' : v >= k + 0.5 ? 'half' : '')} />)}
    </span>
  );
}
const FitDot = ({ level, label }: { level: number; label: string }) => <span className={cx('tl-fit', 'fit-' + level)} title={label} aria-label={label} />;

// ---------------------------------------------------------------------------
/** Cartão de instrução: clica para abrir o seletor (como o FM). */
function InstrCard({ ins, value, locked, tweaked, open, onOpen, onPick }: { ins: Instr; value: string; locked: boolean; tweaked: boolean; open: boolean; onOpen: (o: boolean) => void; onPick: (v: string) => void }) {
  const i = ins.options.indexOf(value);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onOpen(false); } };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key, true);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key, true); };
  }, [open, onOpen]);
  const step = (d: number) => { const k = i + d; if (k >= 0 && k < ins.options.length) onPick(ins.options[k]); };
  return (
    <div ref={ref} className={cx('tl-card', locked && 'is-locked', tweaked && 'is-tweaked', open && 'is-open')}>
      <button type="button" className="tl-card-b" onClick={() => !locked && onOpen(!open)} aria-expanded={open} aria-disabled={locked || undefined} aria-label={`${ins.label}: ${value}${locked ? ' (bloqueada pela função)' : tweaked ? ' (alterada)' : ''}`}>
        <span className="tl-card-h"><span>{ins.label}</span>{locked && <span className="tl-lock" title="Instrução indisponível nesta função"><Lock /></span>}{tweaked && <span className="tl-tw" title="Instrução alterada" />}</span>
        <Glyph g={ins.glyph} />
        <span className="tl-v">{value}</span>
      </button>
      {open && (
        <div className="tl-pop" role="group" aria-label={ins.label}>
          <div className="tl-pop-h">{ins.label}</div>
          <div className="tl-pop-step">
            <button type="button" onClick={() => step(-1)} disabled={i <= 0} aria-label="Opção anterior">‹</button>
            <span aria-live="polite">{value}</span>
            <button type="button" onClick={() => step(1)} disabled={i >= ins.options.length - 1} aria-label="Opção seguinte">›</button>
          </div>
          <div className="tl-pips" aria-hidden="true">{ins.options.map((o, k) => <span key={o} className={k === i ? 'on' : ''} />)}</div>
          <ul className="tl-pop-list">
            {ins.options.map((o) => <li key={o}><button type="button" aria-pressed={o === value} className={cx(o === value && 'on')} onClick={() => { onPick(o); onOpen(false); }}>{o}</button></li>)}
          </ul>
          {ins.hint && <p className="tl-pop-hint">{ins.hint}</p>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
/** Radar de atributos (8 eixos: os atributos-chave da função primeiro). */
function AttrRadar({ p, keys, editPath }: { p: any; keys: string[]; editPath: string | null }) {
  const axes = Array.from(new Set([...keys, 'Decisões', 'Trabalho de equipa', 'Aceleração', 'Resistência', 'Técnica', 'Passe', 'Força', 'Posicionamento'])).slice(0, 8);
  const n = axes.length, R = 46, C = 80;
  const pt = (k: number, r: number) => [C + r * Math.sin((2 * Math.PI * k) / n), 66 - r * Math.cos((2 * Math.PI * k) / n)];
  const vals = axes.map((a) => attrNum(p, a));
  const known = vals.every((v) => v !== null);
  return (
    <div className="tl-radar">
      <svg viewBox="0 0 160 132" role="img" aria-label={known ? 'Atributos: ' + axes.map((a, k) => `${a} ${vals[k]}`).join(', ') : 'Atributos por avaliar'}>
        {[1, 0.75, 0.5, 0.25].map((f) => <polygon key={f} points={axes.map((_, k) => pt(k, R * f).join(',')).join(' ')} className="tl-rgrid" />)}
        {axes.map((_, k) => { const [x, y] = pt(k, R); return <line key={k} x1={C} y1={66} x2={x} y2={y} className="tl-rgrid" />; })}
        {known && <polygon points={vals.map((v, k) => pt(k, (R * (v as number)) / 20).join(',')).join(' ')} className="tl-poly" />}
        {axes.map((a, k) => {
          const [x, y] = pt(k, R + 13);
          return <text key={a} x={x} y={y} textAnchor={x < C - 4 ? 'end' : x > C + 4 ? 'start' : 'middle'} dominantBaseline="middle" className={cx('tl-rl', keys.includes(a) && 'key')}>{vals[k] ?? '—'}</text>;
        })}
      </svg>
      <ul className="tl-attrs">
        {axes.map((a, k) => (
          <li key={a} className={cx(keys.includes(a) && 'key')}><span>{a}</span>{editPath ? <E path={`${editPath}.${a}`} className="tl-attr-v" placeholder="—" /> : <strong>{vals[k] ?? '—'}</strong>}</li>
        ))}
      </ul>
      <p className="tl-note">{known ? 'Avaliação BOXtoBOX (1–20). A amarelo: atributos-chave da função.' : 'Atributos por avaliar.'}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
/** Linhas do campo em SVG: inteiro ou só o meio-campo ofensivo/defensivo (bola parada). */
function PitchLines({ half }: { half: 'top' | 'bottom' | null }) {
  const vb = half === 'top' ? '0 0 68 55' : half === 'bottom' ? '0 50 68 55' : '0 0 68 105';
  const st = { fill: 'none', stroke: 'rgba(255,255,255,.75)', strokeWidth: 0.35 };
  return (
    <svg className="tl-lines" viewBox={vb} preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 12 }, (_, k) => <rect key={k} x="0" y={k * 8.75} width="68" height="8.75" fill={k % 2 ? 'rgba(255,255,255,.035)' : 'transparent'} />)}
      <rect x="0.3" y="0.3" width="67.4" height="104.4" {...st} />
      <line x1="0" y1="52.5" x2="68" y2="52.5" {...st} />
      <circle cx="34" cy="52.5" r="9.15" {...st} />
      <circle cx="34" cy="52.5" r=".5" fill="rgba(255,255,255,.75)" />
      <rect x="13.85" y="0" width="40.3" height="16.5" {...st} />
      <rect x="24.85" y="0" width="18.3" height="5.5" {...st} />
      <path d="M26.7 16.5a9.15 9.15 0 0 0 14.6 0" {...st} />
      <circle cx="34" cy="11" r=".5" fill="rgba(255,255,255,.75)" />
      <rect x="13.85" y="88.5" width="40.3" height="16.5" {...st} />
      <rect x="24.85" y="99.5" width="18.3" height="5.5" {...st} />
      <path d="M26.7 88.5a9.15 9.15 0 0 1 14.6 0" {...st} />
      <circle cx="34" cy="94" r=".5" fill="rgba(255,255,255,.75)" />
      <rect x="30.34" y="-1.6" width="7.32" height="1.6" {...st} />
      <rect x="30.34" y="105" width="7.32" height="1.6" {...st} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
const STORE_KEY = (p: string) => 'b2b-tactic:' + p;
function encode(t: Tactic) {
  const slim = { ...t, players: t.players.map(({ name, ini, ...p }) => p) };
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(slim)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch { return ''; }
}
function decode(s: string): any {
  try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); } catch { return null; }
}
function withStyle(t: Tactic, key: string): Tactic {
  const st = STYLES.find((x) => x.key === key);
  if (!st) return { ...t, style: 'custom' };
  return { ...t, style: key, mentality: st.mentality, team: { ataque: { ...st.team.ataque }, defesa: { ...st.team.defesa }, transof: { ...st.team.transof }, transdef: { ...st.team.transdef } } as Tactic['team'] };
}
function withFormation(t: Tactic, f: string): Tactic {
  const a = FORMATIONS[t.formation], b = FORMATIONS[f];
  return { ...t, formation: f, players: t.players.map((p, i) => (a[i]?.code === b[i]?.code ? p : { ...p, role: undefined, duty: undefined, posse: {}, sem: {}, trans: {} })) };
}
const MOMENT_REF: Record<MomentKey, MomentKey> = { ataque: 'defesa', defesa: 'ataque', transof: 'defesa', transdef: 'ataque', bolaparada: 'bolaparada' };

// ---------------------------------------------------------------------------
export function TacticLab({ path, fallback }: { path: string; fallback?: any }) {
  const ed = useEditor();
  const squad: any[] = useMemo(() => withScoutFallback(ed.content.players || [], seed.players), [ed.content.players]);
  const stored = getIn(ed.content, path) ?? fallback;
  const plan = useMemo(() => ({ ...normalize(stored, squad), name: stored?.name || 'Plano da seleção' }), [stored, squad]);
  const presets = useMemo(() => [
    { ...withFormation(withStyle(plan, 'contrapressao'), '4-3-3'), name: 'Plano B · Contrapressão' },
    { ...withFormation(withStyle(plan, 'autocarro'), '5-3-2'), name: 'Plano C · Bloco baixo' }
  ], [plan]);

  const [slots, setSlots] = useState<Tactic[]>(() => [clone(plan), clone(presets[0]), clone(presets[1])]);
  const [active, setActive] = useState(0);
  const [hist, setHist] = useState<{ label: string; t: Tactic; slot: number }[]>([]);
  const [moment, setMoment] = useState<MomentKey>('ataque');
  const [view, setView] = useState<View>('funcao');
  const [sel, setSel] = useState<number | null>(null);
  const [ptab, setPtab] = useState<'posse' | 'sem' | 'trans'>('posse');
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [routine, setRoutine] = useState<SPKey>('cantoOf');
  const [undoOpen, setUndoOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const [toast, setToast] = useState('');
  const [ghost, setGhost] = useState<{ x: number; y: number; label: string } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const drag = useRef<{ kind: 'xi' | 'bench'; key: string; x0: number; y0: number; moved: boolean; label: string } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const t = slots[active];
  const slotsF = FORMATIONS[t.formation];
  const info = useCallback((pid: string) => squad.find((s) => s.id === pid), [squad]);

  // Plano guardado mudou (admin): repõe o slot 1.
  const planKey = JSON.stringify(plan);
  useEffect(() => { setSlots((s) => [clone(plan), s[1], s[2]]); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [planKey]);

  // Slots 2 e 3 vivem no browser; um plano partilhado chega pelo endereço (#tatica=...).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY(path)) || 'null');
      if (Array.isArray(saved)) setSlots((s) => [s[0], saved[0] ? normalize(saved[0], squad) : s[1], saved[1] ? normalize(saved[1], squad) : s[2]].map((x, k) => (k && saved[k - 1]?.name ? { ...x, name: saved[k - 1].name } : x)));
    } catch {}
    const m = /#tatica=([\w-]+)/.exec(window.location.hash);
    if (m) { const d = decode(m[1]); if (d) { setSlots((s) => [{ ...normalize(d, squad), name: d.name || 'Plano partilhado' }, s[1], s[2]]); setShared(true); } }
    const onMoment = (e: Event) => { const k = (e as CustomEvent).detail; if (MOMENTS.some((x) => x.key === k)) setMoment(k); };
    window.addEventListener('b2b:moment', onMoment);
    return () => window.removeEventListener('b2b:moment', onMoment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { try { localStorage.setItem(STORE_KEY(path), JSON.stringify([slots[1], slots[2]])); } catch {} }, [slots, path]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 2400); return () => clearTimeout(id); }, [toast]);

  const update = (label: string, fn: (x: Tactic) => Tactic) => {
    setHist((h) => [...h.slice(-29), { label, t, slot: active }]);
    setSlots((s) => s.map((x, k) => (k === active ? fn(x) : x)));
  };
  const undoTo = (k: number) => {
    const entry = hist[k];
    if (!entry) return;
    setSlots((s) => s.map((x, i) => (i === entry.slot ? entry.t : x)));
    setActive(entry.slot);
    setHist((h) => h.slice(0, k));
    setUndoOpen(false);
  };
  const reset = () => { update('Repor', () => (active === 0 ? clone(plan) : clone(presets[active - 1]))); setShared(false); };
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#tatica=${encode(t)}`;
    try { await navigator.clipboard.writeText(url); setToast('Ligação copiada — envia o teu plano.'); } catch { window.location.hash = 'tatica=' + encode(t); setToast('O endereço da página tem agora o teu plano.'); }
  };
  const publish = () => {
    ed.set(path, { ...(stored || {}), ...clone(t), name: t.name });
    setToast('Plano gravado no artigo. Falta carregar em Guardar.');
  };

  const fam = familiarity(t, active === 0 ? plan : presets[active - 1]);
  const inten = intensity(t);
  const flu = fluidity(t);
  const prof = profile(t);
  const ana = useMemo(() => analyse(t, squad), [t, squad]);
  const changes = diffCount(t, active === 0 ? plan : presets[active - 1]);

  // ---- trocas (arrastar ou escolher) ----
  const swap = (a: string, b: string) => {
    if (a === b) return;
    const [ka, va] = a.split(':'), [kb, vb] = b.split(':');
    update('Troca de jogadores', (x) => {
      const players = x.players.map((p) => ({ ...p }));
      const bench = x.bench.slice();
      if (ka === 'xi' && kb === 'xi') { const i = +va, j = +vb; [players[i].pid, players[j].pid] = [players[j].pid, players[i].pid]; }
      else if (ka === 'bench' && kb === 'bench') { const i = bench.indexOf(va), j = bench.indexOf(vb); [bench[i], bench[j]] = [bench[j], bench[i]]; }
      else {
        const i = +(ka === 'xi' ? va : vb), pid = ka === 'xi' ? vb : va;
        const bi = bench.indexOf(pid);
        bench[bi] = players[i].pid; players[i].pid = pid;
      }
      return { ...x, players, bench: bench.filter(Boolean) };
    });
  };
  const onDown = (kind: 'xi' | 'bench', key: string, label: string) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { kind, key: `${kind}:${key}`, x0: e.clientX, y0: e.clientY, moved: false, label };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 7) d.moved = true;
    if (d.moved) {
      setGhost({ x: e.clientX, y: e.clientY, label: d.label });
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop]') as HTMLElement | null;
      setOver(el?.dataset.drop && el.dataset.drop !== d.key ? el.dataset.drop : null);
    }
  };
  const onUp = (click: () => void) => (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setGhost(null);
    setOver(null);
    if (!d) return;
    if (!d.moved) return click();
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop]') as HTMLElement | null;
    if (el?.dataset.drop) swap(d.key, el.dataset.drop);
  };

  // ---- janela do jogador ----
  const openPlayer = (i: number) => { lastFocus.current = document.activeElement as HTMLElement; setSel(i); setOpenCard(null); setPtab(moment === 'defesa' || moment === 'transdef' ? 'sem' : moment === 'transof' ? 'trans' : 'posse'); };
  const closePlayer = () => { setSel(null); setOpenCard(null); setTimeout(() => lastFocus.current?.focus(), 0); };
  useEffect(() => {
    if (sel === null) return;
    dialogRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') closePlayer(); };
    document.addEventListener('keydown', key);
    document.body.classList.add('tl-lock-scroll');
    return () => { document.removeEventListener('keydown', key); document.body.classList.remove('tl-lock-scroll'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  const setPlayerInstr = (i: number, group: 'posse' | 'sem' | 'trans', ins: Instr, v: string) => {
    const { slot, p } = slotRole(t, i);
    const targets = p.apply === 'jogador' ? [i] : slotsF.map((s, k) => (s.code === slot.code ? k : -1)).filter((k) => k >= 0);
    update(`${ins.label} → ${v}`, (x) => ({ ...x, players: x.players.map((pp, k) => (targets.includes(k) ? { ...pp, [group]: { ...(pp[group] || {}), [ins.key]: v } } : pp)) }));
  };
  const setPlayer = (i: number, patch: any, label: string) => update(label, (x) => ({ ...x, players: x.players.map((pp, k) => (k === i ? { ...pp, ...patch } : pp)) }));
  const setTeam = (m: TeamM, ins: Instr, v: string) => update(`${ins.label} → ${v}`, (x) => ({ ...x, style: 'custom', team: { ...x.team, [m]: { ...x.team[m], [ins.key]: v } } }));
  const setSP = (r: SPKey, patch: any, label: string) => update(label, (x) => ({ ...x, setPieces: { ...x.setPieces, [r]: { ...x.setPieces[r], ...patch } } }));

  // ---- posições no campo ----
  const isSP = moment === 'bolaparada';
  const sp = isSP ? spPositions(t, routine, squad) : null;
  const half: 'top' | 'bottom' | null = isSP ? (routine === 'cantoDef' ? 'bottom' : 'top') : null;
  const toView = (x: number, y: number): [number, number] => (half === 'top' ? [x, (y * 105) / 55] : half === 'bottom' ? [x, ((y * 105) / 100 - 50) * (100 / 55)] : [x, y]);
  const pos = slotsF.map((_, i) => (sp ? sp.pos[i] : positionFor(t, i, moment)));
  const ref = !isSP && view === 'movimento' ? slotsF.map((_, i) => positionFor(t, i, MOMENT_REF[moment])) : null;
  const ball = sp ? sp.ball : ballFor(t, moment);
  const taker = isSP && routine !== 'cantoDef' ? spTaker(t, routine, squad) : '';
  const momentInfo = MOMENTS.find((m) => m.key === moment)!;

  const selRole = sel !== null ? slotRole(t, sel) : null;
  const selInfo = selRole ? info(selRole.p.pid) : null;
  const selIdx = selInfo ? squad.indexOf(selInfo) : -1;

  return (
    <section className="tl" aria-labelledby="tl-h" id="laboratorio">
      <div className="tl-top">
        <div className="tl-top-l">
          <E as="p" path={`${path}.kicker`} className="kicker tl-k" />
          <h2 id="tl-h" className="display tl-title"><E path={`${path}.title`} /> <E path={`${path}.titleSerif`} className="serif acc" /></h2>
          <E as="p" path={`${path}.intro`} className="tl-intro" multiline />
        </div>
      </div>

      {/* BARRA DO TREINADOR */}
      <div className="tl-console">
        <div className="tl-cbar">
          <div className="tl-slots" role="tablist" aria-label="Táticas">
            {slots.map((s, k) => (
              <button key={k} type="button" role="tab" aria-selected={active === k} className={cx('tl-slotb', active === k && 'on')} onClick={() => { setActive(k); setSel(null); }} title={s.name}>
                <b>{k + 1}</b><span>{s.name}</span>
              </button>
            ))}
          </div>
          <label className="tl-fsel"><span className="sr-only">Formação</span>
            <select value={t.formation} onChange={(e) => update('Formação → ' + e.target.value, (x) => withFormation(x, e.target.value))}>
              {Object.keys(FORMATIONS).map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <div className="tl-meters">
            <div className="tl-meter" title="Quanto a equipa conhece este plano. Cada alteração baixa a familiaridade.">
              <span>Familiaridade</span><i><b style={{ transform: `scaleX(${fam / 100})` }} className={fam < 50 ? 'low' : ''} /></i><em>{fam}%</em>
            </div>
            <div className="tl-meter" title="Exigência física do plano.">
              <span>Intensidade</span><i><b style={{ transform: `scaleX(${inten / 100})` }} className={inten > 80 ? 'hot' : ''} /></i><em>{intensityLabel(inten)}</em>
            </div>
          </div>
          <div className="tl-actions">
            <div className="tl-undo">
              <button type="button" className="tl-btn" onClick={() => undoTo(hist.length - 1)} disabled={!hist.length}>Desfazer</button>
              <button type="button" className="tl-btn tl-btn-i" onClick={() => setUndoOpen((o) => !o)} disabled={!hist.length} aria-expanded={undoOpen} aria-label="Histórico de alterações">▾</button>
              {undoOpen && hist.length > 0 && (
                <ul className="tl-undo-list">
                  {hist.map((h, k) => ({ h, k })).reverse().slice(0, 10).map(({ h, k }) => (
                    <li key={k}><button type="button" onClick={() => undoTo(k)}><span>{h.label}</span><em>Tática {h.slot + 1}</em></button></li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" className="tl-btn" onClick={reset} disabled={!changes}>Repor</button>
            <button type="button" className="tl-btn tl-btn-acc" onClick={share}>Partilhar plano</button>
            {ed.editing && active === 0 && <button type="button" className="tl-btn tl-btn-acc" onClick={publish}>Gravar no artigo</button>}
          </div>
        </div>
        {(shared || (active === 0 && changes > 0)) && <p className="tl-mine">{shared ? 'A ver um plano partilhado.' : `A tua versão do plano: ${changes} alteraç${changes === 1 ? 'ão' : 'ões'}.`}</p>}

        {/* MOMENTOS */}
        <div role="tablist" aria-label="Momento do jogo" className="tl-moments">
          {MOMENTS.map((m) => (
            <button key={m.key} type="button" role="tab" aria-selected={moment === m.key} className={cx('tl-mom', moment === m.key && 'on')} onClick={() => setMoment(m.key)}>
              <b>{m.n}</b><span>{m.label}</span><em>{m.fm}</em>
            </button>
          ))}
        </div>

        <div className="tl-grid3">
          {/* LATERAL: estilo, mentalidade, resumos */}
          <aside className="tl-side" aria-label="Identidade tática">
            <div className="tl-side-id">
            <label className="tl-field"><span>Estilo tático</span>
              <select value={STYLES.some((s) => s.key === t.style) ? t.style : 'custom'} onChange={(e) => e.target.value !== 'custom' && update('Estilo → ' + STYLES.find((s) => s.key === e.target.value)?.name, (x) => withStyle(x, e.target.value))}>
                {STYLES.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
                <option value="custom">Personalizado</option>
              </select>
            </label>
            <p className="tl-side-d">{STYLES.find((s) => s.key === t.style)?.desc || 'Instruções ajustadas à mão.'}</p>
            <label className="tl-field"><span>Mentalidade</span>
              <select value={t.mentality} onChange={(e) => update('Mentalidade → ' + e.target.value, (x) => ({ ...x, mentality: e.target.value }))}>
                {MENTALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <div className="tl-ment" aria-hidden="true">{MENTALITIES.map((m) => <i key={m} className={cx(m === t.mentality && 'on')} />)}</div>
            </div>
            {(['ataque', 'transof', 'transdef', 'defesa'] as TeamM[]).map((m) => {
              const mi = MOMENTS.find((x) => x.key === m)!;
              const sum = teamSummary(t, m);
              return (
                <div key={m} className={cx('tl-sbox', moment === m && 'on')}>
                  <div className="tl-sbox-h"><b>{mi.n}</b>{mi.label}</div>
                  <ul>{sum.length ? sum.slice(0, 4).map((s) => <li key={s}>{s}</li>) : <li className="dim">Instruções padrão</li>}{sum.length > 4 && <li className="dim">+{sum.length - 4}</li>}</ul>
                  <button type="button" onClick={() => setMoment(m)}>» Alterar</button>
                </div>
              );
            })}
            <div className={cx('tl-sbox', isSP && 'on')}>
              <div className="tl-sbox-h"><b>05</b>Bola parada</div>
              <ul><li>Canto: {t.setPieces.cantoOf.delivery} · {info(spTaker(t, 'cantoOf', squad))?.short || '—'}</li><li>Defesa: marcação {String(t.setPieces.cantoDef.system).toLowerCase()}</li></ul>
              <button type="button" onClick={() => setMoment('bolaparada')}>» Alterar</button>
            </div>
          </aside>

          {/* CAMPO */}
          <div className="tl-pitchcol">
            <div className="tl-ptools">
              <div className="tl-views" role="group" aria-label="Vista do campo">
                {([['funcao', 'Funções'], ['adequacao', 'Adequação'], ['movimento', 'Movimentos']] as [View, string][]).map(([k, l]) => (
                  <button key={k} type="button" aria-pressed={view === k} className={cx(view === k && 'on')} onClick={() => setView(k)} disabled={isSP && k === 'movimento'}>{l}</button>
                ))}
              </div>
              <span className="tl-flu" title="Fluidez: quanto os jogadores partilham tarefas.">Fluidez <b>{flu.label}</b></span>
            </div>
            <div className={cx('tl-pitch', half && 'is-half')} role="group" aria-label={`Campo: ${t.formation}, ${momentInfo.label.toLowerCase()}`}>
              <PitchLines half={half} />
              <span className="tl-dir" aria-hidden="true">{half === 'bottom' ? 'A nossa baliza ↓' : 'Ataque ↑'}</span>
              <svg className="tl-over" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs><marker id="tl-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#F7D116" /></marker></defs>
                {ref && pos.map((p, i) => {
                  const [x1, y1] = toView(...ref[i]), [x2, y2] = toView(...p);
                  return Math.hypot(x2 - x1, y2 - y1) > 3 ? <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="tl-mv" markerEnd="url(#tl-ah)" vectorEffect="non-scaling-stroke" /> : null;
                })}
                {sp?.target && (() => {
                  const [bx, by] = toView(...sp.ball), [tx, ty] = toView(...sp.target);
                  return <><path d={`M${bx} ${by} Q ${(bx + tx) / 2} ${Math.min(by, ty) - 14} ${tx} ${ty}`} className="tl-traj" vectorEffect="non-scaling-stroke" markerEnd="url(#tl-ah)" /><ellipse cx={tx} cy={ty} rx="7" ry="5" className="tl-zone" /></>;
                })()}
              </svg>
              {ball && (() => { const [bx, by] = toView(...ball); return <span className="tl-ball" style={{ left: bx + '%', top: by + '%' }} aria-hidden="true" />; })()}
              {slotsF.map((s, i) => {
                const { p, role, duty } = slotRole(t, i);
                const pi = info(p.pid);
                const [x, y] = toView(...pos[i]);
                const fit = fitOf(pi, s.code);
                const ab = roleAbility(pi, role, s.code);
                const job = isSP ? spJob(t, routine, i) : '';
                return (
                  <div key={i} className="tl-slot" style={{ transform: `translate(${x}%, ${y}%)`, transitionDelay: `${(i * 0.025).toFixed(3)}s` }}>
                    <button type="button" data-drop={`xi:${i}`}
                      className={cx('tl-tok', sel === i && 'on', over === `xi:${i}` && 'is-over', p.pid === taker && 'is-taker')}
                      onPointerDown={onDown('xi', String(i), pi?.short || s.code)} onPointerMove={onMove} onPointerUp={onUp(() => openPlayer(i))}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPlayer(i); } }}
                      title={isSP && job ? job : undefined}
                      aria-label={`${pi?.name || 'Sem jogador'}, ${POS_NAMES[s.code]}, ${role.name} (${DUTY_NAMES[duty]})${isSP && job ? ', ' + job : ''}. ${fit.label}. Abrir instruções.`}>
                      <span className={cx('tl-face', 'fitb-' + fit.level)}>
                        <Face info={pi} fallback={s.code} className="tl-face-in" />
                        {pi?.num ? <i className="tl-num">{pi.num}</i> : null}
                      </span>
                      {view === 'adequacao' && !isSP ? (
                        <span className="tl-tag"><FitDot level={fit.level} label={fit.label} /><Stars v={ab} /></span>
                      ) : isSP ? (
                        p.pid === taker ? <span className="tl-tag tl-tag-sp">Batedor</span> : null
                      ) : (
                        <span className="tl-tag"><FitDot level={fit.level} label={fit.label} />{role.abbr} · {duty}</span>
                      )}
                      <span className="tl-tname">{pi?.short || '—'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="tl-hint">Toca num jogador para abrir a função e as instruções. Arrasta para trocar posições ou meter um suplente.</p>
          </div>

          {/* SUPLENTES */}
          <aside className="tl-subs" aria-label="Suplentes">
            <div className="tl-subs-h"><strong>Suplentes</strong><span>máx. 12</span></div>
            <ul>
              {t.bench.map((pid) => {
                const pi = info(pid);
                if (!pi) return null;
                return (
                  <li key={pid}>
                    <button type="button" data-drop={`bench:${pid}`} className={cx('tl-sub', over === `bench:${pid}` && 'is-over')}
                      onPointerDown={onDown('bench', pid, pi.short)} onPointerMove={onMove} onPointerUp={onUp(() => setToast(`Arrasta ${pi.short} para um jogador do campo — ou abre um titular e usa “Trocar com”.`))}
                      aria-label={`${pi.name}, suplente. Arrasta para o campo para trocar.`}>
                      <Face info={pi} fallback={pi.ini} className="tl-sub-f" />
                      <span className="tl-sub-n">{pi.short}{pi.num ? <em>#{pi.num}</em> : null}</span>
                      <span className="tl-sub-p">{(pi.positions || []).join(', ') || pi.pos}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>

        {/* PAINEL DO MOMENTO */}
        <div className="tl-panel">
          {!isSP ? (
            <>
              <div className="tl-panel-h">
                <strong>Instruções de equipa</strong>
                <span><b>{momentInfo.n}</b> {momentInfo.label} · {momentInfo.fm}</span>
              </div>
              <div className="tl-cards tl-cards-team">
                {TEAM_INSTR[moment as TeamM].map((ins) => {
                  const value = teamValue(ins, t.team[moment as TeamM]);
                  const id = `team-${moment}-${ins.key}`;
                  return <InstrCard key={id} ins={ins} value={value} locked={false} tweaked={value !== ins.def} open={openCard === id} onOpen={(o) => setOpenCard(o ? id : null)} onPick={(v) => setTeam(moment as TeamM, ins, v)} />;
                })}
              </div>
            </>
          ) : (
            <SetPieces t={t} routine={routine} setRoutine={setRoutine} squad={squad} info={info} setSP={setSP} openCard={openCard} setOpenCard={setOpenCard} />
          )}
          <div className="tl-note-row">
            <span className="kicker">Nota do analista</span>
            <E as="p" path={`${path}.notes.${moment}`} className="tl-team-note" multiline placeholder="Sem nota para este momento." />
          </div>
        </div>

        {/* ANÁLISE */}
        <div className="tl-analysis" aria-labelledby="tl-an-h">
          <div className="tl-an-h"><strong id="tl-an-h">Análise da tática</strong><span>Calculada a partir das escolhas — muda alguma coisa e vê o que acontece.</span></div>
          <div className="tl-an-grid">
            <div className="tl-prof">
              {prof.map((p) => (
                <div key={p.k} className="tl-prof-r" title={p.d}>
                  <span>{p.k}</span><i><b style={{ transform: `scaleX(${p.v / 100})` }} /></i><em>{p.v}</em>
                </div>
              ))}
            </div>
            <div className="tl-an-col">
              <h3 className="tl-an-t good">Pontos fortes</h3>
              <ul>{ana.good.length ? ana.good.map((g) => { const [k, ...r] = g.split(' · '); return <li key={g}><Thumb up /><span><em>{k}</em>{r.join(' · ')}</span></li>; }) : <li className="dim">Nada em destaque.</li>}</ul>
            </div>
            <div className="tl-an-col">
              <h3 className="tl-an-t bad">A vigiar</h3>
              <ul>{ana.bad.length ? ana.bad.map((g) => { const [k, ...r] = g.split(' · '); return <li key={g}><Thumb up={false} /><span><em>{k}</em>{r.join(' · ')}</span></li>; }) : <li className="dim">Sem pontos fracos evidentes.</li>}</ul>
            </div>
          </div>
        </div>
      </div>

      {ghost && <div className="tl-ghost" style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">{ghost.label}</div>}
      {toast && <div className="tl-toast" role="status">{toast}</div>}

      {/* JANELA DO JOGADOR */}
      {sel !== null && selRole && (
        <div className="tl-dlg-bg" onPointerDown={(e) => { if (e.target === e.currentTarget) closePlayer(); }}>
          <div ref={dialogRef} className="tl-dlg" role="dialog" aria-modal="true" aria-labelledby="tl-dlg-h" tabIndex={-1}>
            <div className="tl-dlg-top">
              <div role="tablist" aria-label="Instruções do jogador" className="tl-dtabs">
                {([['posse', 'Com bola'], ['sem', 'Sem bola'], ['trans', 'Transições']] as const).map(([k, l]) => (
                  <button key={k} type="button" role="tab" aria-selected={ptab === k} className={cx(ptab === k && 'on')} onClick={() => { setPtab(k); setOpenCard(null); }}>{l}</button>
                ))}
              </div>
              <div className="tl-legend"><span><Lock /> Instrução indisponível</span><span><i className="tl-tw" /> Instrução alterada</span></div>
              <div className="tl-undo">
                <button type="button" className="tl-btn" onClick={() => undoTo(hist.length - 1)} disabled={!hist.length}>Desfazer</button>
              </div>
              <button type="button" className="tl-x" onClick={closePlayer} aria-label="Fechar">×</button>
            </div>
            <div className="tl-dlg-body">
              <div className="tl-dlg-l">
                <label className="tl-field"><span className="sr-only">Posição</span>
                  <select value={sel} onChange={(e) => { setSel(+e.target.value); setOpenCard(null); }}>
                    {slotsF.map((s, k) => <option key={k} value={k}>{POS_NAMES[s.code]} — {info(t.players[k]?.pid)?.short || '—'}</option>)}
                  </select>
                </label>
                <div className="tl-apply" role="group" aria-label="Aplicar instruções a">
                  <span>Aplicar a</span>
                  <button type="button" aria-pressed={selRole.p.apply !== 'jogador'} className={cx(selRole.p.apply !== 'jogador' && 'on')} onClick={() => setPlayer(sel, { apply: 'posicao' }, 'Aplicar à posição')}>Posição</button>
                  <button type="button" aria-pressed={selRole.p.apply === 'jogador'} className={cx(selRole.p.apply === 'jogador' && 'on')} onClick={() => setPlayer(sel, { apply: 'jogador' }, 'Aplicar ao jogador')}>Jogador</button>
                </div>
                <p className="tl-small">{selRole.p.apply === 'jogador' ? `As instruções valem só para ${selInfo?.short || 'este jogador'}.` : `Quem jogar como ${POS_NAMES[selRole.slot.code].toLowerCase()} usa estas instruções.`}</p>
                <div className="tl-dl-row">
                  <label className="tl-field"><span>Função</span>
                    <select value={selRole.role.key} onChange={(e) => setPlayer(sel, { role: e.target.value, duty: undefined }, 'Função → ' + ROLES[selRole.slot.code].find((r) => r.key === e.target.value)?.name)}>
                      {(ROLES[selRole.slot.code] || []).map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
                    </select>
                  </label>
                  <div className="tl-duty" role="group" aria-label="Dever">
                    <span>Dever</span>
                    {(['De', 'Ap', 'At'] as Duty[]).map((d) => (
                      <button key={d} type="button" disabled={!selRole.role.duties.includes(d)} aria-pressed={selRole.duty === d} className={cx(selRole.duty === d && 'on', 'd-' + d)} onClick={() => setPlayer(sel, { duty: d }, 'Dever → ' + DUTY_NAMES[d])} title={DUTY_NAMES[d]}>{DUTY_NAMES[d]}</button>
                    ))}
                  </div>
                </div>
                <p className="tl-roledesc">{selRole.role.desc}</p>
                <div className="tl-cur">
                  <span className="kicker">Selecionado</span>
                  <div className="tl-cur-r">
                    <Face info={selInfo} fallback={selRole.slot.code} className={cx('tl-cur-f', 'fitb-' + fitOf(selInfo, selRole.slot.code).level)} />
                    <div className="tl-cur-id">
                      <strong id="tl-dlg-h">{selInfo?.name || 'Sem jogador'}</strong>
                      <span><FitDot {...fitOf(selInfo, selRole.slot.code)} /> {fitOf(selInfo, selRole.slot.code).label} · {POS_NAMES[selRole.slot.code]}</span>
                      <span className="tl-cur-ab"><Stars v={roleAbility(selInfo, selRole.role, selRole.slot.code)} /> Capacidade na função</span>
                    </div>
                  </div>
                  <label className="tl-field tl-swap"><span>Trocar com</span>
                    <select value="" onChange={(e) => { if (e.target.value) swap(`xi:${sel}`, e.target.value); }}>
                      <option value="">Escolher jogador…</option>
                      <optgroup label="Em campo">{slotsF.map((s, k) => k !== sel && <option key={k} value={`xi:${k}`}>{info(t.players[k].pid)?.short || '—'} ({s.code})</option>)}</optgroup>
                      <optgroup label="Suplentes">{t.bench.map((pid) => <option key={pid} value={`bench:${pid}`}>{info(pid)?.short || pid}</option>)}</optgroup>
                    </select>
                  </label>
                </div>
                <AttrRadar p={selInfo} keys={selRole.role.keys} editPath={ed.editing && selIdx >= 0 ? `players.${selIdx}.attrs` : null} />
              </div>
              <div className="tl-dlg-r">
                <div className="tl-cards">
                  {PLAYER_INSTR[ptab].map((ins) => {
                    const v = instrValue(ins, selRole.role, selRole.duty, selRole.p[ptab]);
                    const id = `p-${sel}-${ptab}-${ins.key}`;
                    return <InstrCard key={id} ins={ins} {...v} open={openCard === id} onOpen={(o) => setOpenCard(o ? id : null)} onPick={(val) => setPlayerInstr(sel, ptab, ins, val)} />;
                  })}
                </div>
                {ptab === 'trans' && <p className="tl-small" style={{ marginTop: 14 }}>Vê o efeito nos separadores “Transição ofensiva” e “Transição defensiva”, com a vista “Movimentos” ligada.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
function SetPieces({ t, routine, setRoutine, squad, info, setSP, openCard, setOpenCard }: {
  t: Tactic; routine: SPKey; setRoutine: (r: SPKey) => void; squad: any[]; info: (pid: string) => any;
  setSP: (r: SPKey, patch: any, label: string) => void; openCard: string | null; setOpenCard: (k: string | null) => void;
}) {
  const r = t.setPieces[routine] || {};
  const def = routine === 'cantoDef';
  const jobs = def ? SP_DEFEND_JOBS : SP_ATTACK_JOBS;
  const taker = def ? '' : spTaker(t, routine, squad);
  const cards: Instr[] = def
    ? [{ key: 'side', label: 'Canto do lado', glyph: 'crossfrom', options: SP_SIDES, def: 'Direita' }, { key: 'system', label: 'Sistema de marcação', glyph: 'mark', options: SP_SYSTEM, def: 'Misto' }]
    : [{ key: 'side', label: 'Lado', glyph: 'crossfrom', options: SP_SIDES, def: routine === 'cantoOf' ? 'Direita' : 'Esquerda' }, { key: 'delivery', label: 'Entrega', glyph: 'target', options: routine === 'livreOf' ? SP_DELIVERY_FK : SP_DELIVERY, def: routine === 'livreOf' ? '2.º poste' : '1.º poste' }];
  return (
    <>
      <div className="tl-panel-h">
        <strong>Bola parada</strong>
        <div className="tl-views" role="group" aria-label="Lance">
          {SP_ROUTINES.map((x) => <button key={x.key} type="button" aria-pressed={routine === x.key} className={cx(routine === x.key && 'on')} onClick={() => setRoutine(x.key)}>{x.label}</button>)}
        </div>
      </div>
      <div className="tl-sp">
        <div className="tl-cards tl-cards-sp">
          {cards.map((ins) => {
            const value = ins.options.includes(r[ins.key]) ? r[ins.key] : ins.def;
            const id = `sp-${routine}-${ins.key}`;
            return <InstrCard key={id} ins={ins} value={value} locked={false} tweaked={false} open={openCard === id} onOpen={(o) => setOpenCard(o ? id : null)} onPick={(v) => setSP(routine, { [ins.key]: v }, `${ins.label} → ${v}`)} />;
          })}
          {!def && (
            <label className="tl-card tl-card-sel">
              <span className="tl-card-h"><span>Batedor</span></span>
              <Glyph g="cross" />
              <select value={taker} onChange={(e) => setSP(routine, { taker: e.target.value }, 'Batedor → ' + info(e.target.value)?.short)}>
                {t.players.map((p, i) => FORMATIONS[t.formation][i].code !== 'GR' && <option key={p.pid} value={p.pid}>{info(p.pid)?.short || p.pid}</option>)}
              </select>
            </label>
          )}
        </div>
        <ol className="tl-jobs" aria-label="Tarefas dos jogadores">
          {t.players.map((p, i) => {
            const code = FORMATIONS[t.formation][i].code;
            const pi = info(p.pid);
            if (code === 'GR') return <li key={i} className="dim"><span className="tl-job-n">{pi?.short}</span><span className="tl-job-v">{def ? 'Na baliza' : 'Na baliza (fica)'}</span></li>;
            if (p.pid === taker) return <li key={i}><span className="tl-job-n">{pi?.short}</span><span className="tl-job-v acc">Batedor</span></li>;
            return (
              <li key={i}>
                <label className="tl-job-n" htmlFor={`job-${routine}-${i}`}>{pi?.short}</label>
                <select id={`job-${routine}-${i}`} value={spJob(t, routine, i)} onChange={(e) => setSP(routine, { jobs: { ...(r.jobs || {}), [p.pid]: e.target.value } }, `${pi?.short} → ${e.target.value}`)}>
                  {jobs.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
