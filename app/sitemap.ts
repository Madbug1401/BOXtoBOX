import type { MetadataRoute } from 'next';
import { getSiteContent } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : 'http://localhost:3000')).replace(/\/$/, '');
  const { content, updatedAt } = await getSiteContent();
  const lastModified = updatedAt ? new Date(updatedAt) : new Date();
  return [
    { url: base + '/', lastModified },
    { url: base + '/rubricas', lastModified },
    { url: base + '/jogos', lastModified },
    { url: base + '/relvado', lastModified },
    ...(content.matches || []).filter((m: any) => m.published).map((m: any) => ({ url: `${base}/jogos/${m.slug}`, lastModified })),
    ...content.editions.filter((e: any) => e.published).map((e: any) => ({ url: `${base}/rubricas/${e.slug}`, lastModified })),
    ...content.articles.filter((a: any) => a.published).map((a: any) => ({ url: `${base}/relvado/${a.slug}`, lastModified }))
  ];
}
