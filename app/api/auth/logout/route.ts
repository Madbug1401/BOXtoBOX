import { cookies } from 'next/headers';
import { COOKIE } from '@/lib/auth';
import { json, sameOrigin } from '@/lib/api';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Origem inválida.' }, 403);
  const c = await cookies();
  c.delete(COOKIE);
  return json({ ok: true });
}
