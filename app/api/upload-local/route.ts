// Só para desenvolvimento local sem Vercel Blob: guarda o ficheiro em public/uploads.
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { json, requireAdmin } from '@/lib/api';

const OK = /^(image\/(jpeg|png|webp|gif|avif|svg\+xml)|video\/(mp4|webm|quicktime))$/;

export async function POST(req: Request) {
  if (process.env.VERCEL) return json({ error: 'Na Vercel, liga o Vercel Blob ao projeto para carregar ficheiros.' }, 503);
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'Falta o ficheiro.' }, 400);
  if (!OK.test(file.type)) return json({ error: 'Tipo de ficheiro não suportado.' }, 400);
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'ficheiro';
  const name = `${base}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return json({ url: '/uploads/' + name });
}
