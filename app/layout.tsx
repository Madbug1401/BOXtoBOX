import type { Metadata, Viewport } from 'next';
import { isAdmin } from '@/lib/auth';
import { getSiteContent, publicView, storageInfo } from '@/lib/store';
import { EditorProvider } from '@/components/editor/core';
import { AdminBar } from '@/components/editor/AdminUI';
import { SiteShell } from '@/components/site/SiteShell';
import './styles/base.css';
import './styles/home.css';
import './styles/article.css';
import './styles/radar.css';
import './styles/edition.css';
import './styles/plantel.css';
import './styles/admin.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getSiteContent();
  const s = content.settings;
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : 'http://localhost:3000');
  return {
    metadataBase: new URL(base),
    title: { default: `${s.siteName} — ${s.tagline}`, template: `%s · ${s.siteName}` },
    description: s.description,
    openGraph: { title: s.siteName, description: s.description, locale: 'pt_PT', type: 'website' },
    icons: { icon: '/favicon.svg' }
  };
}

export const viewport: Viewport = { themeColor: '#061633' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  const { content, updatedAt } = await getSiteContent();
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,800;0,900;1,800&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap"
        />
      </head>
      <body>
        <EditorProvider initial={admin ? content : publicView(content)} updatedAt={updatedAt} isAdmin={admin} storage={admin ? storageInfo() : { db: '', blob: false }}>
          <SiteShell>{children}</SiteShell>
          <AdminBar />
        </EditorProvider>
      </body>
    </html>
  );
}
