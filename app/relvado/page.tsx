import type { Metadata } from 'next';
import RelvadoPage from '@/components/pages/Relvado';

export const metadata: Metadata = { title: 'Relvado · Análise', description: 'Análises táticas dos jogos de Cabo Verde, em cinco momentos: ataque, defesa, transições e bola parada.' };

export default function Page() {
  return <RelvadoPage />;
}
