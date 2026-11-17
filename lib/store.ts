// Armazenamento do conteúdo.
// Produção (Vercel): Upstash Redis (variáveis KV_REST_API_* ou UPSTASH_REDIS_REST_*).
// Desenvolvimento sem Redis: ficheiro local .data/db.json.
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { seed } from './seed';
import { mergeDefaults, clone } from './paths';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null;
const LOCAL = !redis && !process.env.VERCEL;

const K = {
  content: 'b2b:content',
  history: 'b2b:history',
  subs: (type: string) => 'b2b:subs:' + type
};
const HISTORY_MAX = 15;

export const storageInfo = () => ({
  db: redis ? 'redis' : LOCAL ? 'local' : 'none',
  blob: !!process.env.BLOB_READ_WRITE_TOKEN
});

// ---------- backend local (ficheiro) ----------
const DB_FILE = path.join(process.cwd(), '.data', 'db.json');
async function readLocal(): Promise<Record<string, any>> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  } catch {
    return {};
  }
}
async function writeLocal(db: Record<string, any>) {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  const tmp = DB_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(db));
  await fs.rename(tmp, DB_FILE);
}

// ---------- primitivas ----------
async function getJSON(key: string): Promise<any> {
  if (redis) {
    const raw = await redis.get<string>(key);
    return raw ? JSON.parse(raw) : null;
  }
  if (LOCAL) return (await readLocal())[key] ?? null;
  return null;
}
async function setJSON(key: string, value: any) {
  if (redis) return void (await redis.set(key, JSON.stringify(value)));
  if (LOCAL) {
    const db = await readLocal();
    db[key] = value;
    return writeLocal(db);
  }
  throw new StorageError();
}
async function listPush(key: string, value: any, max?: number) {
  if (redis) {
    await redis.lpush(key, JSON.stringify(value));
    if (max) await redis.ltrim(key, 0, max - 1);
    return;
  }
  if (LOCAL) {
    const db = await readLocal();
    const arr = Array.isArray(db[key]) ? db[key] : [];
    arr.unshift(value);
    db[key] = max ? arr.slice(0, max) : arr;
    return writeLocal(db);
  }
  throw new StorageError();
}
async function listAll(key: string): Promise<any[]> {
  if (redis) {
    const raw = await redis.lrange<string>(key, 0, -1);
    return raw.map((r) => JSON.parse(r));
  }
  if (LOCAL) {
    const v = (await readLocal())[key];
    return Array.isArray(v) ? v : [];
  }
  return [];
}
async function listReplace(key: string, items: any[]) {
  if (redis) {
    const p = redis.multi();
    p.del(key);
    if (items.length) p.rpush(key, ...items.map((i) => JSON.stringify(i)));
    await p.exec();
    return;
  }
  if (LOCAL) {
    const db = await readLocal();
    db[key] = items;
    return writeLocal(db);
  }
  throw new StorageError();
}

export class StorageError extends Error {
  constructor() {
    super('Sem base de dados configurada. Liga o Upstash Redis ao projeto na Vercel (Storage → Marketplace → Upstash Redis).');
  }
}

// ---------- conteúdo ----------
export type Stored = { content: any; updatedAt: string };

export async function getSiteContent(): Promise<Stored> {
  try {
    const stored = await getJSON(K.content);
    if (stored?.content) return { content: mergeDefaults(seed, stored.content), updatedAt: stored.updatedAt };
  } catch (e) {
    console.error('[store] leitura falhou, a usar conteúdo inicial', e);
  }
  return { content: clone(seed), updatedAt: '' };
}

export class ConflictError extends Error {}

export async function saveSiteContent(content: any, base: string | null): Promise<Stored> {
  const current = await getJSON(K.content);
  if (base !== null && current?.updatedAt && current.updatedAt !== base) throw new ConflictError('conflict');
  // a versão anterior vai para o histórico (na primeira gravação, o conteúdo de origem)
  await listPush(K.history, { id: crypto.randomUUID(), savedAt: current?.updatedAt || '', content: current?.content || clone(seed) }, HISTORY_MAX);
  const next = { content, updatedAt: new Date().toISOString() };
  await setJSON(K.content, next);
  return next;
}

export async function listHistory() {
  const h = await listAll(K.history);
  return h.map((x) => ({ id: x.id, savedAt: x.savedAt }));
}

export async function restoreHistory(id: string): Promise<Stored | null> {
  const h = await listAll(K.history);
  const entry = h.find((x) => x.id === id);
  if (!entry) return null;
  return saveSiteContent(entry.content, null);
}

export async function resetToSeed(): Promise<Stored> {
  return saveSiteContent(clone(seed), null);
}

// ---------- submissões (newsletter / sugestões) ----------
export async function addSubmission(type: 'newsletter' | 'sugestao', data: Record<string, string>) {
  await listPush(K.subs(type), { id: crypto.randomUUID(), at: new Date().toISOString(), ...data }, 5000);
}
export async function getSubmissions(type: 'newsletter' | 'sugestao') {
  return listAll(K.subs(type));
}
export async function deleteSubmission(type: 'newsletter' | 'sugestao', id: string) {
  const all = await listAll(K.subs(type));
  await listReplace(K.subs(type), all.filter((x) => x.id !== id));
}

/** Retira rascunhos do conteúdo enviado aos visitantes. */
export function publicView(content: any) {
  return {
    ...content,
    articles: (content.articles || []).filter((a: any) => a.published),
    editions: (content.editions || []).filter((e: any) => e.published),
    matches: (content.matches || []).filter((m: any) => m.published)
  };
}
