import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticlePage from '@/components/pages/Article';
import { getSiteContent } from '@/lib/store';
import { isAdmin } from '@/lib/auth';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { content } = await getSiteContent();
  const a = content.articles.find((x: any) => x.slug === slug && x.published);
  if (!a) return { title: 'Página não encontrada' };
  const title = String(a.titleLines).replace(/\n/g, ' ') + ' ' + a.titleSerif;
  return { title, description: a.summary || a.deck, openGraph: { title, description: a.summary || a.deck, images: a.cover?.src ? [a.cover.src] : undefined } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // o admin pode abrir artigos ainda não guardados/publicados; os visitantes recebem 404
  if (!(await isAdmin())) {
    const { content } = await getSiteContent();
    if (!content.articles.some((x: any) => x.slug === slug && x.published)) notFound();
  }
  return <ArticlePage slug={slug} />;
}
