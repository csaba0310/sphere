import { isSphereError, type SphereErrorCode } from '@unicitylabs/sphere-sdk';

// Friendly overrides for codes where SDK message is too technical.
// For codes NOT listed here, we use the SDK's own err.message (which is
// already user-readable, e.g. "Unicity ID @bob is already taken").
const FRIENDLY_OVERRIDES: Partial<Record<SphereErrorCode, string>> = {
  TRANSPORT_ERROR: 'Connection issue. Check your network',
  TIMEOUT: 'Request timed out. Try again',
  NETWORK_ERROR: 'Network error. Check your connection',
  AGGREGATOR_ERROR: 'Network unavailable. Try again',
  DECRYPTION_ERROR: 'Wrong password',
  STORAGE_ERROR: 'Storage error',
  MODULE_NOT_AVAILABLE: 'Feature not available',
};

/**
 * Turn a raw, non-user-facing error string into something safe to display.
 * Backends (gateways/proxies) sometimes return an HTML error page (e.g. a 503)
 * instead of a structured error; that markup must never reach the UI.
 */
function humanizeRawError(message: string): string {
  const msg = message.trim();
  // Raw HTML/markup error page (gateway 5xx, proxy, etc.) — never show markup.
  if (msg.startsWith('<')) {
    const status = msg.match(/\b(\d{3})\b/)?.[1] ?? null;
    if (status === '429') return 'Too many requests. Try again in a moment';
    if (status && status.startsWith('4')) return 'Request rejected by the server';
    return 'Service temporarily unavailable. Try again later';
  }
  if (/\bservice unavailable\b|\b50[234]\b|bad gateway|gateway timeout/i.test(msg)) {
    return 'Service temporarily unavailable. Try again later';
  }
  return message;
}

export function getErrorMessage(err: unknown): string {
  if (isSphereError(err)) {
    return FRIENDLY_OVERRIDES[err.code] ?? humanizeRawError(err.message);
  }
  if (err instanceof Error) return humanizeRawError(err.message);
  return 'Something went wrong';
}

export function getErrorCode(err: unknown): SphereErrorCode | null {
  return isSphereError(err) ? err.code : null;
}

export { isSphereError };
