/**
 * Prepend a scheme to a bare host so it can be parsed by `new URL()` and loaded
 * in an iframe. localhost / bare IPs default to http, everything else to https.
 *
 * Used by BOTH the in-app custom-URL prompt (DesktopLayout) and the
 * `/agents/custom?url=` deep-link handler (AgentPage) so a value like
 * `boxy-run.fly.dev` resolves to `https://boxy-run.fly.dev` in both paths.
 * A URL that already carries a scheme is returned unchanged (idempotent).
 */
export function normalizeUrl(input: string): string {
  const url = input.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.includes('localhost') || /^\d/.test(url) ? `http://${url}` : `https://${url}`;
}
