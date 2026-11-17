import type { Metadata } from 'next';
import RadarPage from '@/components/pages/Radar';

export const metadata: Metadata = { title: 'Rubrica Radar', description: 'Os nomes que ninguém te contou: uma pessoa por edição, do relvado à diáspora.' };

export default function Page() {
  return <RadarPage />;
}
