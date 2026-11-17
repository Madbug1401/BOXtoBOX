import type { Metadata } from 'next';
import MatchesPage from '@/components/pages/Matches';

export const metadata: Metadata = { title: 'Jogos', description: 'Calendário, resultados e estatística dos jogos da seleção de Cabo Verde.' };

export default function Page() {
  return <MatchesPage />;
}
