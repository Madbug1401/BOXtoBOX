// Só deixa passar ligações seguras (evita "javascript:" e afins em conteúdo editável).
export function safeHref(href: string | undefined | null): string {
  const h = String(href ?? '').trim();
  if (!h) return '#';
  if (h.startsWith('/') || h.startsWith('#') || h.startsWith('?')) return h;
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(h)) return 'https://' + h;
  return '#';
}

export function safeSrc(src: string | undefined | null): string {
  const s = String(src ?? '').trim();
  if (!s) return '';
  if (s.startsWith('/') || /^https:\/\//i.test(s) || /^http:\/\/localhost/i.test(s)) return s;
  return '';
}

export function isInternal(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

export function safeColor(c: string | undefined | null, fallback = '#061633'): string {
  const v = String(c ?? '').trim();
  return /^#[0-9a-f]{3,8}$/i.test(v) || /^rgba?\([\d\s.,%]+\)$/i.test(v) ? v : fallback;
}
