/** Convert a public-directory asset path into a URL relative to Vite's base path. */
export function publicAssetUrl(path: string, base = import.meta.env.BASE_URL): string {
  if (!path) return '';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}
