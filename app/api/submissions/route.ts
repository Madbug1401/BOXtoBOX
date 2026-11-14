import { json, requireAdmin, sameOrigin } from '@/lib/api';
import { addSubmission, getSubmissions, deleteSubmission } from '@/lib/store';

const TYPES = ['newsletter', 'sugestao'] as const;
type T = (typeof TYPES)[number];
const clean = (s: any, max: number) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

// Público: subscrever newsletter ou sugerir um nome para o Radar
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Origem inválida.' }, 403);
  const b = await req.json().catch(() => ({}));
  if (b.website) return json({ ok: true }); // campo-armadilha para bots
  const type = b.type as T;
  if (!TYPES.includes(type)) return json({ error: 'Tipo inválido.' }, 400);
  try {
    if (type === 'newsletter') {
      const email = clean(b.email, 200).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: 'Esse email não parece válido.' }, 400);
      const existing = await getSubmissions('newsletter');
      if (!existing.some((x) => x.email === email)) await addSubmission('newsletter', { email });
    } else {
      const name = clean(b.name, 120);
      const why = clean(b.why, 2000);
      if (!name) return json({ error: 'Falta o nome.' }, 400);
      await addSubmission('sugestao', { name, why });
    }
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: 'Não foi possível enviar agora. Tenta mais tarde.' }, 503);
  }
}

// Admin: ver e apagar
export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const [newsletter, sugestao] = await Promise.all([getSubmissions('newsletter'), getSubmissions('sugestao')]);
  return json({ newsletter, sugestao });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { type, id } = await req.json().catch(() => ({}));
  if (!TYPES.includes(type)) return json({ error: 'Tipo inválido.' }, 400);
  await deleteSubmission(type, String(id));
  return json({ ok: true });
}
