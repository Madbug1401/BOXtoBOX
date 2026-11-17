import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EditionPage from '@/components/pages/Edition';
import { getSiteContent } from '@/lib/store';
import { isAdmin } from '@/lib/auth';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { content } = await getSiteContent();
  const e = content.editions.find((x: any) => x.slug === slug && x.published);
  if (!e) return { title: 'Página não encontrada' };
  const title = `Radar #${e.num} · ${e.name}: ${e.headline}`;
  return { title, description: e.deck, openGraph: { title, description: e.deck, images: e.photo?.src ? [e.photo.src] : undefined } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await isAdmin())) {
    const { content } = await getSiteContent();
    if (!content.editions.some((x: any) => x.slug === slug && x.published)) notFound();
  }
  return <EditionPage slug={slug} />;
}
