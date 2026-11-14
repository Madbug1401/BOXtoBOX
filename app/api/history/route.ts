import { revalidatePath } from 'next/cache';
import { requireAdmin, json } from '@/lib/api';
import { listHistory, restoreHistory } from '@/lib/store';

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return json({ items: await listHistory() });
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await req.json().catch(() => ({}));
  try {
    const r = await restoreHistory(String(id || ''));
    if (!r) return json({ error: 'Versão não encontrada.' }, 404);
    revalidatePath('/', 'layout');
    return json({ ok: true, updatedAt: r.updatedAt });
  } catch (e) {
    return json({ error: (e as Error).message }, 503);
  }
}
