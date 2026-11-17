'use client';
// Motor de edição: guarda o conteúdo do site em memória, e cada componente E* lê/escreve por caminho.
// Fora do modo edição, os componentes renderizam HTML normal (o que os visitantes veem).
import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getIn, setIn, clone } from '@/lib/paths';
import { safeHref, safeSrc, isInternal, safeColor } from '@/lib/safe';

export const cx = (...a: any[]) => a.filter(Boolean).join(' ');

type Storage = { db: string; blob: boolean };
type EditorCtx = {
  content: any;
  isAdmin: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  set: (path: string, value: any) => void;
  update: (fn: (c: any) => any) => void;
  replaceAll: (c: any) => void;
  insert: (path: string, index: number, item: any) => void;
  remove: (path: string, index: number) => void;
  move: (path: string, index: number, dir: number) => void;
  duplicate: (path: string, index: number) => void;
  dirty: boolean;
  saving: boolean;
  save: () => Promise<boolean>;
  discard: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  upload: (file: File) => Promise<string | null>;
  uploading: boolean;
  toast: (msg: string, kind?: 'ok' | 'err') => void;
  storage: Storage;
  panel: string | null;
  setPanel: (p: string | null) => void;
  base: string;
  setBase: (b: string) => void;
};

const Ctx = createContext<EditorCtx | null>(null);
export const useEditor = () => useContext(Ctx) as EditorCtx;
export function useValue(path: string) {
  return getIn(useEditor().content, path);
}

export function EditorProvider({ initial, updatedAt, isAdmin, storage, children }: { initial: any; updatedAt: string; isAdmin: boolean; storage: Storage; children: React.ReactNode }) {
  const router = useRouter();
  const [content, setContent] = useState(initial);
  const contentRef = useRef(initial);
  const savedRef = useRef(initial);
  const [base, setBase] = useState(updatedAt);
  const [editing, setEditingState] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: string }[]>([]);
  const undoStack = useRef<any[]>([]);
  const redoStack = useRef<any[]>([]);
  const [, bump] = useState(0);

  // Conteúdo novo do servidor (ex.: depois de restaurar uma versão) quando não há alterações por guardar
  useEffect(() => {
    if (!dirty && initial !== savedRef.current) {
      savedRef.current = initial;
      contentRef.current = initial;
      setContent(initial);
      setBase(updatedAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, updatedAt]);

  useEffect(() => {
    if (!isAdmin) return;
    try {
      if (localStorage.getItem('b2b-edit') === '1') setEditingState(true);
    } catch {}
  }, [isAdmin]);

  const setEditing = useCallback((v: boolean) => {
    setEditingState(v);
    try {
      localStorage.setItem('b2b-edit', v ? '1' : '0');
    } catch {}
    if (!v) (document.activeElement as HTMLElement)?.blur?.();
  }, []);

  const toast = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'err' ? 7000 : 3200);
  }, []);

  const commit = useCallback((next: any) => {
    const prev = contentRef.current;
    if (next === prev) return;
    undoStack.current.push(prev);
    if (undoStack.current.length > 100) undoStack.current.shift();
    redoStack.current = [];
    contentRef.current = next;
    setContent(next);
    setDirty(true);
    bump((n) => n + 1);
  }, []);

  const update = useCallback((fn: (c: any) => any) => commit(fn(contentRef.current)), [commit]);
  const set = useCallback((path: string, value: any) => {
    const cur = getIn(contentRef.current, path);
    if (cur === value) return;
    commit(setIn(contentRef.current, path, value));
  }, [commit]);
  const listOp = useCallback((path: string, fn: (list: any[]) => any[]) => {
    const list = getIn(contentRef.current, path) || [];
    commit(setIn(contentRef.current, path, fn(list.slice())));
  }, [commit]);
  const insert = useCallback((path: string, index: number, item: any) => listOp(path, (l) => (l.splice(index, 0, item), l)), [listOp]);
  const remove = useCallback((path: string, index: number) => listOp(path, (l) => (l.splice(index, 1), l)), [listOp]);
  const move = useCallback((path: string, index: number, dir: number) => listOp(path, (l) => {
    const j = index + dir;
    if (j < 0 || j >= l.length) return l;
    [l[index], l[j]] = [l[j], l[index]];
    return l;
  }), [listOp]);
  const duplicate = useCallback((path: string, index: number) => listOp(path, (l) => {
    const copy = clone(l[index]);
    if (copy && typeof copy === 'object' && 'slug' in copy) copy.slug = copy.slug + '-copia';
    if (copy && typeof copy === 'object' && 'id' in copy) copy.id = copy.id + '-' + Math.random().toString(36).slice(2, 6);
    l.splice(index + 1, 0, copy);
    return l;
  }), [listOp]);

  const replaceAll = useCallback((c: any) => commit(c), [commit]);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (prev === undefined) return;
    redoStack.current.push(contentRef.current);
    contentRef.current = prev;
    setContent(prev);
    setDirty(prev !== savedRef.current);
    bump((n) => n + 1);
  }, []);
  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (next === undefined) return;
    undoStack.current.push(contentRef.current);
    contentRef.current = next;
    setContent(next);
    setDirty(next !== savedRef.current);
    bump((n) => n + 1);
  }, []);

  const discard = useCallback(() => {
    contentRef.current = savedRef.current;
    setContent(savedRef.current);
    undoStack.current = [];
    redoStack.current = [];
    setDirty(false);
  }, []);

  const save = useCallback(async () => {
    (document.activeElement as HTMLElement)?.blur?.();
    await new Promise((r) => setTimeout(r, 30)); // deixa o último campo em edição gravar
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentRef.current, base })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(j.error || 'Erro ao guardar.', 'err');
        return false;
      }
      savedRef.current = contentRef.current;
      setBase(j.updatedAt);
      setDirty(false);
      toast('Guardado. O site já está atualizado.');
      router.refresh();
      return true;
    } catch {
      toast('Sem ligação. Tenta outra vez.', 'err');
      return false;
    } finally {
      setSaving(false);
    }
  }, [base, router, toast]);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      if (storage.blob) {
        const { upload } = await import('@vercel/blob/client');
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
        const r = await upload('media/' + safeName, file, { access: 'public', handleUploadUrl: '/api/upload' });
        return r.url;
      }
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-local', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      return j.url as string;
    } catch (e) {
      toast((e as Error).message || 'Falhou o upload.', 'err');
      return null;
    } finally {
      setUploading(false);
    }
  }, [storage.blob, toast]);

  // Atalhos: Ctrl/Cmd+S guarda; Ctrl/Cmd+Z desfaz (fora de campos de texto)
  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const el = document.activeElement as HTMLElement | null;
      const inField = !!el && (el.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(el.tagName));
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty) save();
      } else if (e.key.toLowerCase() === 'z' && !inField && editing) {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAdmin, dirty, save, undo, redo, editing]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  useEffect(() => {
    document.documentElement.classList.toggle('is-editing', editing);
  }, [editing]);

  const value: EditorCtx = {
    content, isAdmin, editing: isAdmin && editing, setEditing, set, update, replaceAll, insert, remove, move, duplicate,
    dirty, saving, save, discard, undo, redo,
    canUndo: undoStack.current.length > 0, canRedo: redoStack.current.length > 0,
    upload, uploading, toast, storage, panel, setPanel, base, setBase
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="e-toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={cx('e-toast', t.kind === 'err' && 'e-toast-err')}>{t.msg}</div>
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Texto: realça [placeholders] a amarelo
export function rich(s: string) {
  if (!s || !s.includes('[')) return s;
  return s.split(/(\[[^\]]*\])/g).map((p, i) => (p.startsWith('[') && p.endsWith(']') ? <mark key={i} className="ph-note">{p}</mark> : p));
}

type EProps = { path: string; as?: any; className?: string; style?: React.CSSProperties; multiline?: boolean; placeholder?: string; plain?: boolean; [k: string]: any };

/** Texto editável no sítio. */
export function E({ path, as: Tag = 'span', className, style, multiline = false, placeholder = 'Escreve aqui…', plain = false, ...rest }: EProps) {
  const ed = useEditor();
  const raw = getIn(ed.content, path);
  const value = raw == null ? '' : String(raw);
  const ref = useRef<HTMLElement>(null);
  const editing = ed.editing;

  useLayoutEffect(() => {
    const el = ref.current;
    if (editing && el && document.activeElement !== el && el.innerText !== value) el.innerText = value;
  }, [editing, value]);

  if (!editing) {
    return <Tag className={cx(className, multiline && 'pre-line')} style={style} {...rest}>{plain ? value : rich(value)}</Tag>;
  }
  return (
    <Tag
      ref={ref}
      className={cx(className, 'e-text', multiline && 'pre-line')}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        let t = e.currentTarget.innerText.replace(/ /g, ' ');
        t = multiline ? t.replace(/\n+$/, '') : t.replace(/\s*\n+\s*/g, ' ').trim();
        ed.set(path, t);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === 'Escape') {
          e.currentTarget.innerText = value;
          e.currentTarget.blur();
        }
        e.stopPropagation();
      }}
      onKeyUp={(e: React.KeyboardEvent) => e.preventDefault()}
      onPaste={(e: React.ClipboardEvent) => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
      onClick={(e: React.MouseEvent) => e.preventDefault()}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------------------
// Ligações
export function SmartLink({ href, className, style, children, ...rest }: any) {
  const h = safeHref(href);
  if (isInternal(h)) return <Link href={h} className={className} style={style} {...rest}>{children}</Link>;
  const ext = /^https?:/i.test(h);
  return <a href={h} className={className} style={style} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined} {...rest}>{children}</a>;
}

function promptHref(ed: EditorCtx, path: string) {
  const cur = getIn(ed.content, path) || '';
  const v = window.prompt('Endereço da ligação (ex.: /plantel, /rubricas/pico-lopes, #newsletter ou https://…)', cur);
  if (v !== null) ed.set(path, v.trim());
}

/** Ligação com texto editável ({label, href}). */
export function ELink({ path, className, style, children, labelClass, ...rest }: any) {
  const ed = useEditor();
  const link = getIn(ed.content, path) || {};
  const label = <E path={path + '.label'} className={labelClass} />;
  if (ed.editing) {
    return (
      <a href={safeHref(link.href)} className={cx(className, 'e-link')} style={style} onClick={(e) => { if (!(e.metaKey || e.ctrlKey)) e.preventDefault(); }} {...rest}>
        {label}
        {children}
        <span role="button" tabIndex={0} className="e-linktool" title={'Ligação: ' + (link.href || '—') + '  (Ctrl+clique para abrir)'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); promptHref(ed, path + '.href'); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
        </span>
      </a>
    );
  }
  return <SmartLink href={link.href} className={className} style={style} {...rest}>{label}{children}</SmartLink>;
}

/** Ligação cujo texto vem de fora mas o endereço é editável (ex.: cartões). */
export function HrefLink({ path, className, style, children, ...rest }: any) {
  const ed = useEditor();
  const href = getIn(ed.content, path);
  if (ed.editing) {
    return (
      <div className={cx(className, 'e-link')} style={style} {...rest}>
        {children}
        <span role="button" tabIndex={0} className="e-linktool e-linktool-card" title={'Ligação: ' + (href || '—')}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); promptHref(ed, path); }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
          Ligação
        </span>
      </div>
    );
  }
  return <SmartLink href={href} className={className} style={style} {...rest}>{children}</SmartLink>;
}

/** Cartão clicável com endereço fixo (ex.: página de uma edição). No modo edição não navega. */
export function CardLink({ href, className, style, children, ...rest }: any) {
  const ed = useEditor();
  if (ed.editing) return <div className={className} style={style} {...rest}>{children}</div>;
  return <SmartLink href={href} className={className} style={style} {...rest}>{children}</SmartLink>;
}

// ---------------------------------------------------------------------------
// Imagens e vídeo
function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = accept;
    i.onchange = () => resolve(i.files?.[0] || null);
    i.click();
  });
}

/** Deteta imagens que falharam antes da hidratação do React (o onError já não dispara). */
function useBroken(src: string) {
  const ref = useRef<HTMLImageElement>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0 && src) setBroken(true);
  }, [src]);
  return { ref, broken, onError: () => setBroken(true) };
}

/** <img> simples que, se falhar, mostra um marcador (ou nada). */
export function SafeImg({ src, alt = '', className, style, fallback, ...rest }: any) {
  const s = safeSrc(src);
  const { ref, broken, onError } = useBroken(s);
  if (!s || broken) return fallback === undefined ? null : fallback;
  return <img ref={ref} src={s} alt={alt} className={className} style={style} onError={onError} loading="lazy" decoding="async" {...rest} />;
}

/** Imagem editável ({src, alt, pos, credit}). Coloca-a dentro de um contentor com position:relative. */
export function EImg({ path, className, style, alt, label, fallbackClass, ...rest }: any) {
  const ed = useEditor();
  const image = getIn(ed.content, path) || {};
  const src = safeSrc(image.src);
  const { ref: imgRef, broken, onError } = useBroken(src);
  const [focusMode, setFocusMode] = useState(false);
  const st = { ...style, objectPosition: image.pos || '50% 50%' };
  const text = label || image.alt || 'Imagem';
  const altText = alt !== undefined ? alt : image.alt || '';

  const tools = ed.editing ? (
    <>
      <span className="e-imgtools" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <span role="button" tabIndex={0} onClick={async () => { const f = await pickFile('image/*'); if (!f) return; const url = await ed.upload(f); if (url) ed.set(path, { ...image, src: url }); }}>{ed.uploading ? 'A carregar…' : 'Trocar imagem'}</span>
        <span role="button" tabIndex={0} onClick={() => setFocusMode((v) => !v)}>{focusMode ? 'Clica no ponto de foco' : 'Foco'}</span>
        <span role="button" tabIndex={0} onClick={() => { const v = window.prompt('Texto alternativo (descreve a imagem para quem não a vê):', image.alt || ''); if (v !== null) ed.set(path, { ...image, alt: v }); }}>Alt</span>
        <span role="button" tabIndex={0} onClick={() => { const v = window.prompt('Endereço da imagem (URL):', image.src || ''); if (v !== null) ed.set(path, { ...image, src: v.trim() }); }}>URL</span>
        {image.src && <span role="button" tabIndex={0} onClick={() => ed.set(path, { ...image, src: '' })}>Remover</span>}
      </span>
      {focusMode && (
        <span className="e-focus" onClick={(e) => {
          e.preventDefault(); e.stopPropagation();
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = Math.round(((e.clientX - r.left) / r.width) * 100);
          const y = Math.round(((e.clientY - r.top) / r.height) * 100);
          ed.set(path, { ...image, pos: `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%` });
          setFocusMode(false);
        }} />
      )}
    </>
  ) : null;

  return (
    <>
      {src && !broken ? (
        <img ref={imgRef} src={src} alt={altText} className={className} style={st} onError={onError} loading="lazy" decoding="async" {...rest} />
      ) : (
        <span className={cx(className, 'img-ph', fallbackClass)} style={style} role={altText ? 'img' : undefined} aria-label={altText || undefined}>
          <span className="img-ph-t">{text}</span>
        </span>
      )}
      {tools}
    </>
  );
}

export function EVideo({ path, className, style, ...rest }: any) {
  const ed = useEditor();
  const v = getIn(ed.content, path) || {};
  const src = safeSrc(v.src);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return (
    <>
      {src && !broken ? (
        <video src={src} controls preload="metadata" playsInline aria-label={v.label} className={className} style={style} onError={() => setBroken(true)} {...rest} />
      ) : (
        <span className={cx(className, 'img-ph')} style={style}><span className="img-ph-t">{v.label || 'Vídeo'}</span></span>
      )}
      {ed.editing && (
        <span className="e-imgtools">
          <span role="button" tabIndex={0} onClick={async () => { const f = await pickFile('video/*'); if (!f) return; const url = await ed.upload(f); if (url) ed.set(path, { ...v, src: url }); }}>{ed.uploading ? 'A carregar…' : 'Trocar vídeo'}</span>
          <span role="button" tabIndex={0} onClick={() => { const x = window.prompt('Endereço do vídeo (URL .mp4):', v.src || ''); if (x !== null) ed.set(path, { ...v, src: x.trim() }); }}>URL</span>
          <span role="button" tabIndex={0} onClick={() => { const x = window.prompt('Descrição do vídeo:', v.label || ''); if (x !== null) ed.set(path, { ...v, label: x }); }}>Descrição</span>
        </span>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Listas
const ItemCtx = createContext<{ path: string; i: number; len: number } | null>(null);

export function EList({ path, render, newItem, addLabel = 'Adicionar', addClassName, limit }: { path: string; render: (item: any, p: string, i: number) => React.ReactNode; newItem?: any; addLabel?: string; addClassName?: string; limit?: number }) {
  const ed = useEditor();
  const list: any[] = getIn(ed.content, path) || [];
  const shown = limit && !ed.editing ? list.slice(0, limit) : list;
  return (
    <>
      {shown.map((item, i) => (
        <ItemCtx.Provider key={i} value={{ path, i, len: list.length }}>{render(item, `${path}.${i}`, i)}</ItemCtx.Provider>
      ))}
      {ed.editing && newItem !== undefined && (
        <button type="button" className={cx('e-add', addClassName)} onClick={() => ed.insert(path, list.length, clone(typeof newItem === 'function' ? newItem(list) : newItem))}>
          + {addLabel}
        </button>
      )}
    </>
  );
}

/** Botões ↑ ↓ duplicar apagar de um item de lista (colocar dentro do elemento do item). */
export function ItemTools({ className, noDup }: { className?: string; noDup?: boolean }) {
  const ed = useEditor();
  const c = useContext(ItemCtx);
  if (!ed?.editing || !c) return null;
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); fn(); };
  return (
    <span className={cx('e-itools', className)} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <span role="button" tabIndex={0} title="Mover para trás" aria-disabled={c.i === 0} onClick={stop(() => ed.move(c.path, c.i, -1))}>↑</span>
      <span role="button" tabIndex={0} title="Mover para a frente" aria-disabled={c.i === c.len - 1} onClick={stop(() => ed.move(c.path, c.i, 1))}>↓</span>
      {!noDup && <span role="button" tabIndex={0} title="Duplicar" onClick={stop(() => ed.duplicate(c.path, c.i))}>⧉</span>}
      <span role="button" tabIndex={0} title="Apagar" onClick={stop(() => { if (window.confirm('Apagar este item?')) ed.remove(c.path, c.i); })}>✕</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Pequenos controlos (só aparecem no modo edição)
export function EColor({ path, label = 'Cor', className }: { path: string; label?: string; className?: string }) {
  const ed = useEditor();
  if (!ed.editing) return null;
  const v = safeColor(getIn(ed.content, path), '#061633');
  return (
    <label className={cx('e-ctl', className)} onClick={(e) => e.stopPropagation()}>
      <span>{label}</span>
      <input type="color" value={v.length === 7 ? v : '#061633'} onChange={(e) => ed.set(path, e.target.value)} />
    </label>
  );
}

export function ESelect({ path, options, label, className }: { path: string; options: [string, string][]; label?: string; className?: string }) {
  const ed = useEditor();
  if (!ed.editing) return null;
  return (
    <label className={cx('e-ctl', className)} onClick={(e) => e.stopPropagation()}>
      {label && <span>{label}</span>}
      <select value={getIn(ed.content, path) ?? ''} onChange={(e) => ed.set(path, e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

export function EToggle({ path, label, className }: { path: string; label: string; className?: string }) {
  const ed = useEditor();
  if (!ed.editing) return null;
  return (
    <label className={cx('e-ctl', className)} onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={!!getIn(ed.content, path)} onChange={(e) => ed.set(path, e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

/** Lista de palavras/etiquetas simples (array de strings) editável como texto separado por vírgulas. */
export function EStringsInline({ path, label }: { path: string; label: string }) {
  const ed = useEditor();
  if (!ed.editing) return null;
  const list: string[] = getIn(ed.content, path) || [];
  return (
    <button type="button" className="e-add" onClick={() => {
      const v = window.prompt(label + ' (separa por " | ")', list.join(' | '));
      if (v !== null) ed.set(path, v.split('|').map((s) => s.trim()).filter(Boolean));
    }}>Editar: {label}</button>
  );
}

// ---------------------------------------------------------------------------
// Secções que podem ser ocultadas
export function Sec({ k, label, as: Tag = 'section', className, children, ...rest }: any) {
  const ed = useEditor();
  const hidden: string[] = ed.content.settings?.hidden || [];
  const isHidden = hidden.includes(k);
  if (isHidden && !ed.editing) return null;
  return (
    <Tag className={cx(className, ed.editing && 'e-sec', isHidden && 'e-hidden')} {...rest}>
      {ed.editing && (
        <span className="e-sectool" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <span className="e-sectool-l">{label || k}</span>
          <span role="button" tabIndex={0} onClick={() => ed.set('settings.hidden', isHidden ? hidden.filter((x) => x !== k) : [...hidden, k])}>
            {isHidden ? 'Mostrar secção' : 'Ocultar secção'}
          </span>
        </span>
      )}
      {children}
    </Tag>
  );
}

export const useAccent = () => safeColor(useValue('settings.accent'), '#F7D116');
export { safeColor };
