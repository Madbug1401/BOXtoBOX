// Leitura/escrita imutável de valores por caminho ("home.hero.title", "articles.0.body.3.text").

export function getIn(obj: any, path: string): any {
  if (!path) return obj;
  const keys = path.split('.');
  let cur = obj;
  for (const k of keys) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}

export function setIn(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const rec = (o: any, i: number): any => {
    const k = keys[i];
    const base = Array.isArray(o) ? o.slice() : { ...(o || {}) };
    base[k] = i === keys.length - 1 ? value : rec(o ? o[k] : undefined, i + 1);
    return base;
  };
  return rec(obj, 0);
}

export function clone<T>(v: T): T {
  return v === undefined ? v : JSON.parse(JSON.stringify(v));
}

/** Junta valores por omissão (seed) com o conteúdo guardado: objetos fundem-se, arrays e valores guardados ganham. */
export function mergeDefaults(defaults: any, stored: any): any {
  if (stored === undefined || stored === null) return clone(defaults);
  if (Array.isArray(defaults) || Array.isArray(stored)) return stored;
  if (typeof defaults === 'object' && defaults && typeof stored === 'object') {
    const out: any = { ...stored };
    for (const k of Object.keys(defaults)) out[k] = mergeDefaults(defaults[k], stored[k]);
    return out;
  }
  return stored;
}

export function slugify(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'sem-titulo';
}
