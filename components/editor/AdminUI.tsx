'use client';
// Barra do admin + painéis (páginas, conteúdos, definições, caixa de entrada, histórico).
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEditor, cx } from './core';
import { getIn, slugify, clone } from '@/lib/paths';
import { templates, seed } from '@/lib/seed';

function F({ label, path, type = 'text', options, hint }: { label: string; path: string; type?: string; options?: string[] | [string, string][]; hint?: string }) {
  const ed = useEditor();
  const v = getIn(ed.content, path);
  return (
    <label className="ap-field">
      <span className="ap-label">{label}</span>
      {type === 'textarea' ? (
        <textarea rows={4} value={v ?? ''} onChange={(e) => ed.set(path, e.target.value)} />
      ) : type === 'checkbox' ? (
        <input type="checkbox" checked={!!v} onChange={(e) => ed.set(path, e.target.checked)} />
      ) : type === 'select' ? (
        <select value={v ?? ''} onChange={(e) => ed.set(path, e.target.value)}>
          {(options || []).map((o: any) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}
        </select>
      ) : type === 'color' ? (
        <span className="ap-color"><input type="color" value={v || '#000000'} onChange={(e) => ed.set(path, e.target.value)} /><input value={v || ''} onChange={(e) => ed.set(path, e.target.value)} /></span>
      ) : (
        <input value={v ?? ''} onChange={(e) => ed.set(path, e.target.value)} />
      )}
      {hint && <span className="ap-hint">{hint}</span>}
    </label>
  );
}

function Drawer({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <>
      <div className="ap-bg" onClick={onClose} aria-hidden="true" />
      <aside className="ap-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="ap-head">
          <h2>{title}</h2>
          <button type="button" className="ap-x" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className="ap-body">{children}</div>
      </aside>
    </>
  );
}

function PagesPanel({ close }: { close: () => void }) {
  const ed = useEditor();
  const c = ed.content;
  const L = ({ href, children, sub }: any) => <Link href={href} className="ap-row" onClick={close}><span>{children}</span>{sub && <span className="ap-sub">{sub}</span>}</Link>;
  return (
    <>
      <p className="ap-p">No modo edição, os links do site não navegam (para poderes editar o texto). Usa esta lista — ou Ctrl/Cmd+clique num link.</p>
      <L href="/">Início</L>
      <L href="/radar">Rubrica Radar</L>
      {c.editions.map((e: any) => <L key={e.slug} href={'/radar/' + e.slug} sub={e.published ? '/radar/' + e.slug : 'rascunho'}>Radar #{e.num} · {e.name}</L>)}
      {c.articles.map((a: any) => <L key={a.slug} href={'/artigos/' + a.slug} sub={a.published ? '/artigos/' + a.slug : 'rascunho'}>{a.titleLines.replace(/\n/g, ' ')}</L>)}
      <L href="/plantel">Plantel</L>
    </>
  );
}

function ContentPanel({ close }: { close: () => void }) {
  const ed = useEditor();
  const router = useRouter();
  const c = ed.content;
  const [tab, setTab] = useState<'articles' | 'editions'>('articles');
  const list: any[] = c[tab];
  const base = tab === 'articles' ? '/artigos/' : '/radar/';

  const create = () => {
    const title = window.prompt(tab === 'articles' ? 'Título do novo artigo:' : 'Nome da pessoa para a nova edição do Radar:');
    if (!title) return;
    let slug = slugify(title);
    while (list.some((x) => x.slug === slug)) slug += '-2';
    if (tab === 'articles') {
      const a = templates.article(slug);
      a.titleLines = title;
      ed.insert('articles', 0, a);
    } else {
      const nums = list.map((x) => parseInt(x.num, 10)).filter((n) => !isNaN(n));
      const num = String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0');
      const e = templates.edition(slug, num);
      e.name = title;
      e.fullName = title;
      ed.insert('editions', 0, e);
    }
    ed.setEditing(true);
    close();
    router.push(base + slug);
    ed.toast('Criado como rascunho. Edita, marca "Publicado" e guarda.');
  };

  const rename = (i: number) => {
    const cur = list[i].slug;
    const v = window.prompt('Endereço (slug) — só letras minúsculas, números e hífens:', cur);
    if (!v) return;
    const s = slugify(v);
    if (list.some((x, j) => j !== i && x.slug === s)) return ed.toast('Já existe esse endereço.', 'err');
    ed.set(`${tab}.${i}.slug`, s);
  };

  return (
    <>
      <div className="ap-tabs">
        <button type="button" aria-pressed={tab === 'articles'} onClick={() => setTab('articles')}>Artigos ({c.articles.length})</button>
        <button type="button" aria-pressed={tab === 'editions'} onClick={() => setTab('editions')}>Edições do Radar ({c.editions.length})</button>
      </div>
      <button type="button" className="ap-btn ap-primary" onClick={create}>+ {tab === 'articles' ? 'Novo artigo' : 'Nova edição'}</button>
      <div className="ap-list">
        {list.map((x, i) => (
          <div key={i} className="ap-item">
            <div className="ap-item-t">
              <strong>{tab === 'articles' ? x.titleLines.replace(/\n/g, ' ') : `#${x.num} · ${x.name}`}</strong>
              <span className="ap-sub">{base}{x.slug}</span>
            </div>
            <label className="ap-pub"><input type="checkbox" checked={!!x.published} onChange={(e) => ed.set(`${tab}.${i}.published`, e.target.checked)} /> Publicado</label>
            <div className="ap-item-a">
              <Link href={base + x.slug} onClick={close}>Abrir</Link>
              <button type="button" onClick={() => rename(i)}>Endereço</button>
              <button type="button" onClick={() => ed.move(tab, i, -1)} disabled={i === 0}>↑</button>
              <button type="button" onClick={() => ed.move(tab, i, 1)} disabled={i === list.length - 1}>↓</button>
              <button type="button" className="ap-danger" onClick={() => { if (window.confirm('Apagar "' + (x.titleLines || x.name) + '"? (Podes recuperar no Histórico depois de guardar.)')) ed.remove(tab, i); }}>Apagar</button>
            </div>
          </div>
        ))}
      </div>
      {tab === 'editions' && (
        <F label="Edição em destaque na página do Radar" path="rubrica.featured" type="select" options={c.editions.map((e: any) => [e.slug, `#${e.num} · ${e.name}`])} />
      )}
      <p className="ap-p">A ordem desta lista é a ordem no site. Rascunhos só são visíveis para ti.</p>
    </>
  );
}

function SettingsPanel() {
  const ed = useEditor();
  const s = ed.content.settings;
  const hidden: string[] = s.hidden || [];
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(ed.content, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `boxtobox-conteudo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  const importJSON = () => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = 'application/json';
    i.onchange = async () => {
      const f = i.files?.[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data.settings || !data.home) throw new Error();
        ed.replaceAll(data);
        ed.toast('Importado. Revê e guarda para publicar.');
      } catch {
        ed.toast('Ficheiro inválido.', 'err');
      }
    };
    i.click();
  };
  return (
    <>
      <h3 className="ap-h3">Identidade</h3>
      <F label="Nome do site" path="settings.siteName" />
      <F label="Descrição curta (aparece por baixo do logótipo na abertura)" path="settings.tagline" />
      <F label="Descrição para o Google e partilhas" path="settings.description" type="textarea" />
      <F label="Slogan em uso" path="settings.slogan" type="select" options={s.sloganOptions || []} />
      <div className="ap-field">
        <span className="ap-label">Opções de slogan</span>
        {(s.sloganOptions || []).map((o: string, i: number) => (
          <span key={i} className="ap-inline">
            <input value={o} onChange={(e) => { const was = s.sloganOptions[i]; ed.update((c) => { const n = clone(c); n.settings.sloganOptions[i] = e.target.value; if (n.settings.slogan === was) n.settings.slogan = e.target.value; return n; }); }} />
            <button type="button" onClick={() => ed.remove('settings.sloganOptions', i)}>✕</button>
          </span>
        ))}
        <button type="button" className="ap-btn" onClick={() => ed.insert('settings.sloganOptions', (s.sloganOptions || []).length, 'Novo slogan')}>+ Slogan</button>
      </div>
      <F label="Cor de destaque" path="settings.accent" type="color" hint="Amarelo da bandeira por omissão: #F7D116" />
      <F label="Mostrar a abertura animada na homepage" path="settings.intro" type="checkbox" />
      <h3 className="ap-h3">Redes sociais</h3>
      <F label="Instagram (nome a mostrar)" path="settings.instagram" />
      <F label="Instagram (URL)" path="settings.socials.instagram" />
      <F label="TikTok (URL)" path="settings.socials.tiktok" />
      <F label="X (URL)" path="settings.socials.x" />
      <h3 className="ap-h3">Secções ocultas</h3>
      {hidden.length === 0 ? <p className="ap-p">Nenhuma. No modo edição, cada secção tem um botão "Ocultar secção".</p> : hidden.map((h) => (
        <div key={h} className="ap-row"><span>{h}</span><button type="button" onClick={() => ed.set('settings.hidden', hidden.filter((x) => x !== h))}>Mostrar</button></div>
      ))}
      <h3 className="ap-h3">Cópia de segurança</h3>
      <div className="ap-actions">
        <button type="button" className="ap-btn" onClick={exportJSON}>Exportar conteúdo (.json)</button>
        <button type="button" className="ap-btn" onClick={importJSON}>Importar .json</button>
        <button type="button" className="ap-btn ap-danger" onClick={() => { if (window.confirm('Substituir tudo pelo conteúdo de origem? Só fica guardado quando carregares em Guardar (e a versão atual vai para o Histórico).')) ed.replaceAll(clone(seed)); }}>Repor conteúdo de origem</button>
      </div>
    </>
  );
}

function InboxPanel() {
  const ed = useEditor();
  const [data, setData] = useState<{ newsletter: any[]; sugestao: any[] } | null>(null);
  const [err, setErr] = useState('');
  const load = () => fetch('/api/submissions').then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error); setData(j); }).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const del = async (type: string, id: string) => {
    if (!window.confirm('Apagar?')) return;
    await fetch('/api/submissions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id }) });
    load();
  };
  const csv = () => {
    const rows = [['email', 'data'], ...(data?.newsletter || []).map((x) => [x.email, x.at])];
    const blob = new Blob([rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'newsletter.csv';
    a.click();
  };
  if (err) return <p className="ap-p ap-err">{err}</p>;
  if (!data) return <p className="ap-p">A carregar…</p>;
  const fmt = (s: string) => new Date(s).toLocaleString('pt-PT');
  return (
    <>
      <h3 className="ap-h3">Sugestões para o Radar ({data.sugestao.length})</h3>
      {data.sugestao.length === 0 && <p className="ap-p">Ainda nenhuma.</p>}
      {data.sugestao.map((s) => (
        <div key={s.id} className="ap-item">
          <div className="ap-item-t"><strong>{s.name}</strong><span className="ap-sub">{fmt(s.at)}</span></div>
          <p className="ap-p" style={{ whiteSpace: 'pre-wrap' }}>{s.why}</p>
          <div className="ap-item-a"><button type="button" className="ap-danger" onClick={() => del('sugestao', s.id)}>Apagar</button></div>
        </div>
      ))}
      <h3 className="ap-h3">Newsletter ({data.newsletter.length})</h3>
      {data.newsletter.length > 0 && <button type="button" className="ap-btn" onClick={csv}>Exportar emails (.csv)</button>}
      {data.newsletter.map((s) => (
        <div key={s.id} className="ap-row"><span>{s.email}</span><span className="ap-sub">{fmt(s.at)}</span><button type="button" onClick={() => del('newsletter', s.id)}>✕</button></div>
      ))}
      {ed.storage.db === 'none' && <p className="ap-p ap-err">Sem base de dados configurada: as submissões não estão a ser guardadas.</p>}
    </>
  );
}

function HistoryPanel({ close }: { close: () => void }) {
  const ed = useEditor();
  const router = useRouter();
  const [items, setItems] = useState<any[] | null>(null);
  useEffect(() => { fetch('/api/history').then((r) => r.json()).then((j) => setItems(j.items || [])).catch(() => setItems([])); }, []);
  const restore = async (id: string) => {
    if (ed.dirty && !window.confirm('Tens alterações por guardar que vão ser perdidas. Continuar?')) return;
    if (!window.confirm('Restaurar esta versão? A versão atual fica guardada no histórico.')) return;
    const r = await fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const j = await r.json();
    if (!r.ok) return ed.toast(j.error || 'Erro', 'err');
    ed.discard();
    close();
    ed.toast('Versão restaurada.');
    router.refresh();
  };
  if (!items) return <p className="ap-p">A carregar…</p>;
  return (
    <>
      <p className="ap-p">Cada vez que guardas, a versão anterior fica aqui (últimas 15).</p>
      {items.length === 0 && <p className="ap-p">Ainda não há versões anteriores.</p>}
      {items.map((h) => (
        <div key={h.id} className="ap-row">
          <span>{h.savedAt ? new Date(h.savedAt).toLocaleString('pt-PT') : 'Versão inicial'}</span>
          <button type="button" onClick={() => restore(h.id)}>Restaurar</button>
        </div>
      ))}
    </>
  );
}

export function AdminBar() {
  const ed = useEditor();
  const router = useRouter();
  const pathname = usePathname();
  if (!ed.isAdmin) return null;
  const close = () => ed.setPanel(null);
  const logout = async () => {
    if (ed.dirty && !window.confirm('Tens alterações por guardar. Sair mesmo assim?')) return;
    await fetch('/api/auth/logout', { method: 'POST' });
    ed.setEditing(false);
    router.refresh();
  };
  const warn = ed.storage.db === 'none' ? 'Base de dados por ligar: não vais conseguir guardar. Vê o LEIA-ME.' : ed.storage.db === 'local' ? 'Modo local: a guardar em .data/db.json' : '';
  return (
    <>
      <div className={cx('admin-bar', ed.editing && 'is-on')} role="toolbar" aria-label="Ferramentas de admin">
        <button type="button" className={cx('ab-toggle', ed.editing && 'on')} onClick={() => ed.setEditing(!ed.editing)} aria-pressed={ed.editing}>
          <span className="ab-sw" aria-hidden="true"><span /></span>{ed.editing ? 'A editar' : 'Editar site'}
        </button>
        <span className="ab-sep" />
        <button type="button" onClick={ed.undo} disabled={!ed.canUndo} title="Desfazer (Ctrl+Z)">↶</button>
        <button type="button" onClick={ed.redo} disabled={!ed.canRedo} title="Refazer (Ctrl+Shift+Z)">↷</button>
        <button type="button" className={cx('ab-save', ed.dirty && 'dirty')} onClick={ed.save} disabled={!ed.dirty || ed.saving} title="Guardar (Ctrl+S)">
          {ed.saving ? 'A guardar…' : ed.dirty ? 'Guardar' : 'Guardado'}
        </button>
        {ed.dirty && <button type="button" onClick={() => window.confirm('Descartar todas as alterações não guardadas?') && ed.discard()} title="Descartar alterações">Descartar</button>}
        <span className="ab-sep" />
        <button type="button" onClick={() => ed.setPanel('pages')}>Páginas</button>
        <button type="button" onClick={() => ed.setPanel('content')}>Conteúdos</button>
        <button type="button" onClick={() => ed.setPanel('settings')}>Definições</button>
        <button type="button" onClick={() => ed.setPanel('inbox')}>Caixa</button>
        <button type="button" onClick={() => ed.setPanel('history')}>Histórico</button>
        <span className="ab-sep" />
        <button type="button" onClick={logout}>Sair</button>
        {warn && <span className="ab-warn" title={warn}>!</span>}
      </div>
      {ed.panel === 'pages' && <Drawer title="Páginas" onClose={close}><PagesPanel close={close} /></Drawer>}
      {ed.panel === 'content' && <Drawer title="Conteúdos" onClose={close}><ContentPanel close={close} /></Drawer>}
      {ed.panel === 'settings' && <Drawer title="Definições" onClose={close}><SettingsPanel /></Drawer>}
      {ed.panel === 'inbox' && <Drawer title="Caixa de entrada" onClose={close}><InboxPanel /></Drawer>}
      {ed.panel === 'history' && <Drawer title="Histórico de versões" onClose={close}><HistoryPanel close={close} /></Drawer>}
      {warn && pathname === '/' && <div className="ab-banner">{warn}</div>}
    </>
  );
}
