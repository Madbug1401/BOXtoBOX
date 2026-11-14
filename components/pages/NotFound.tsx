'use client';
import Link from 'next/link';
import { Header, Footer } from '@/components/site/ui';

export function NotFoundBlock() {
  return (
    <div className="home">
      <Header />
      <section className="wrap" style={{ padding: '120px 0 160px', minHeight: '60vh' }}>
        <p className="kicker acc" style={{ marginBottom: 18 }}>Erro 404</p>
        <h1 className="display h-xl" style={{ color: '#fff' }}>Fora de jogo.<br /><span className="serif acc">Esta página não existe.</span></h1>
        <p style={{ marginTop: 28, fontSize: 18, color: 'var(--muted)' }}>Pode ter mudado de endereço ou ainda não ter sido publicada.</p>
        <Link href="/" className="btn pill pill-acc" style={{ marginTop: 28 }}>Voltar ao início</Link>
      </section>
      <Footer big="404" />
    </div>
  );
}
