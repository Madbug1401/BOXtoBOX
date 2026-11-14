'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/site/ui';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error || 'Não foi possível entrar.');
    try { localStorage.setItem('b2b-edit', '1'); } catch {}
    router.push('/');
    router.refresh();
  };
  return (
    <main className="login">
      <form className="login-card" onSubmit={submit}>
        <LogoMark fill="#F7D116" size={52} />
        <h1>Modo admin</h1>
        <p style={{ margin: 0, color: '#A9B8D6', fontSize: 15, lineHeight: 1.5 }}>Entra para editar textos, fotos, jogos, jogadores e artigos diretamente no site.</p>
        <label htmlFor="pw">Palavra-passe</label>
        <input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        {err && <p className="login-err" role="alert">{err}</p>}
        <button type="submit" disabled={busy}>{busy ? 'A entrar…' : 'Entrar'}</button>
      </form>
    </main>
  );
}
