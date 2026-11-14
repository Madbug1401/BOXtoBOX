import { revalidatePath } from 'next/cache';
import { requireAdmin, json } from '@/lib/api';
import { getSiteContent, saveSiteContent, ConflictError, StorageError, resetToSeed } from '@/lib/store';

const MAX_BYTES = 2_000_000;

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return json(await getSiteContent());
}

export async function PUT(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return json({ error: 'Conteúdo demasiado grande.' }, 413);
  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'JSON inválido.' }, 400);
  }
  const c = body?.content;
  if (!c || typeof c !== 'object' || !c.settings || !c.home || !Array.isArray(c.articles) || !Array.isArray(c.editions) || !Array.isArray(c.players)) {
    return json({ error: 'Formato de conteúdo inválido.' }, 400);
  }
  const slugs = (list: any[]) => list.map((x) => x.slug);
  for (const list of [c.articles, c.editions]) {
    const s = slugs(list);
    if (s.some((x) => !x || !/^[a-z0-9-]+$/.test(x))) return json({ error: 'Há um endereço (slug) inválido: usa só letras minúsculas, números e hífens.' }, 400);
    if (new Set(s).size !== s.length) return json({ error: 'Há dois conteúdos com o mesmo endereço (slug).' }, 400);
  }
  try {
    const saved = await saveSiteContent(c, body.base ?? '');
    revalidatePath('/', 'layout');
    return json({ ok: true, updatedAt: saved.updatedAt });
  } catch (e) {
    if (e instanceof ConflictError) return json({ error: 'O conteúdo foi alterado noutro separador ou dispositivo. Recarrega a página antes de guardar.' }, 409);
    if (e instanceof StorageError) return json({ error: e.message }, 503);
    console.error(e);
    return json({ error: 'Não foi possível guardar.' }, 500);
  }
}

// Repor o conteúdo de origem (fica no histórico, por isso é reversível)
export async function DELETE(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const saved = await resetToSeed();
    revalidatePath('/', 'layout');
    return json({ ok: true, updatedAt: saved.updatedAt });
  } catch (e) {
    return json({ error: (e as Error).message }, 503);
  }
}
