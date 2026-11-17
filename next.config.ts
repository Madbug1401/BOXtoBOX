import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Endereços antigos (antes de o menu passar a Home · Jogos · Relvado · Rubricas)
  async redirects() {
    return [
      { source: '/radar', destination: '/rubricas', permanent: true },
      { source: '/radar/:slug', destination: '/rubricas/:slug', permanent: true },
      { source: '/artigos/:slug', destination: '/relvado/:slug', permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' }
        ]
      }
    ];
  }
};

export default nextConfig;
