import { cookies } from 'next/headers';
import { checkPassword, createToken, COOKIE, cookieOptions } from '@/lib/auth';
import { json, sameOrigin } from '@/lib/api';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Origem inválida.' }, 403);
  let password = '';
  try {
    password = String((await req.json())?.password ?? '');
  } catch {}
  const r = checkPassword(password);
  if (r === 'unset') return json({ error: 'O admin ainda não está configurado: define ADMIN_PASSWORD nas variáveis de ambiente da Vercel.' }, 503);
  if (r === 'bad') {
    await new Promise((res) => setTimeout(res, 700)); // trava tentativas em série
    return json({ error: 'Palavra-passe errada.' }, 401);
  }
  const c = await cookies();
  c.set(COOKIE, createToken(), cookieOptions);
  return json({ ok: true });
}
