// Sessão do admin: cookie httpOnly assinado com HMAC. Sem base de dados de utilizadores —
// há uma única palavra-passe (ADMIN_PASSWORD) definida nas variáveis de ambiente.
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'b2b_admin';
const MAX_AGE_S = 60 * 60 * 24 * 14; // 14 dias
const IS_PROD = process.env.NODE_ENV === 'production';

function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return IS_PROD ? null : 'admin'; // em desenvolvimento, sem variável definida, a palavra-passe é "admin"
}

function secret(): string {
  return process.env.AUTH_SECRET || 'b2b-secret:' + (adminPassword() || '');
}

function sig(payload: string) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createToken(): string {
  const exp = Date.now() + MAX_AGE_S * 1000;
  const payload = `admin.${exp}`;
  return `${payload}.${sig(payload)}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token || !adminPassword()) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = Buffer.from(sig(`admin.${parts[1]}`));
  const given = Buffer.from(parts[2]);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

export function checkPassword(input: string): 'ok' | 'bad' | 'unset' {
  const real = adminPassword();
  if (!real) return 'unset';
  const a = crypto.createHash('sha256').update(String(input)).digest();
  const b = crypto.createHash('sha256').update(real).digest();
  return crypto.timingSafeEqual(a, b) ? 'ok' : 'bad';
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifyToken(c.get(COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PROD,
  path: '/',
  maxAge: MAX_AGE_S
};
