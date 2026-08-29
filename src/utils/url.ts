/** Garante que a URL tenha um protocolo, para o navegador não tratá-la como caminho relativo. */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
