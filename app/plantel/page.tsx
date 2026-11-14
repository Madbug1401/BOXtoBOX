import type { Metadata } from 'next';
import PlantelPage from '@/components/pages/Plantel';

export const metadata: Metadata = { title: 'Plantel', description: 'Os Tubarões Azuis, da baliza ao ataque: o onze, o banco e o plantel completo.' };

export default function Page() {
  return <PlantelPage />;
}
