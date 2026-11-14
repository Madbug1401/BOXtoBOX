import { NextResponse } from 'next/server';
import { isAdmin } from './auth';

export const json = (data: any, status = 200) => NextResponse.json(data, { status });

/** Protege pedidos que alteram dados contra CSRF: a origem tem de ser o próprio site. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // pedidos same-origin de alguns browsers não enviam Origin
  try {
    const o = new URL(origin);
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    return o.host === host;
  } catch {
    return false;
  }
}

export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  if (!sameOrigin(req)) return json({ error: 'Origem inválida.' }, 403);
  if (!(await isAdmin())) return json({ error: 'Sessão de admin necessária.' }, 401);
  return null;
}
