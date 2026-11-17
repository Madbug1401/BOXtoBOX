import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import PlantelPage from '@/components/pages/Plantel';

export const metadata: Metadata = { title: 'Plantel', robots: { index: false, follow: false } };

// O menu ficou reduzido a Home · Jogos · Relvado · Rubricas: os jogadores vivem agora nas Rubricas.
// A página do plantel continua disponível só para o admin, como sítio para editar as fichas.
export default async function Page() {
  if (!(await isAdmin())) redirect('/rubricas#jogadores');
  return <PlantelPage />;
}
