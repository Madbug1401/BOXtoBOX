import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MatchPage from '@/components/pages/Match';
import { getSiteContent } from '@/lib/store';
import { isAdmin } from '@/lib/auth';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { content } = await getSiteContent();
  const m = (content.matches || []).find((x: any) => x.slug === slug && x.published);
  if (!m) return { title: 'Página não encontrada' };
  const title = m.status === 'final' ? `${m.home} ${m.hs}–${m.as} ${m.away}` : `${m.home} vs ${m.away}`;
  return { title, description: m.summary };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // o admin pode abrir jogos ainda não publicados (ou acabados de criar); os visitantes recebem 404
  if (!(await isAdmin())) {
    const { content } = await getSiteContent();
    if (!(content.matches || []).some((x: any) => x.slug === slug && x.published)) notFound();
  }
  return <MatchPage slug={slug} />;
}
