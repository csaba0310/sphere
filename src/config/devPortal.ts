/**
 * Developer Portal URL.
 *
 * Env-driven (`VITE_DEV_PORTAL_URL`) so each environment points at its own host
 * (staging/prod). Falls back to staging when the env var is unset.
 */
export const DEV_PORTAL_URL =
  import.meta.env.VITE_DEV_PORTAL_URL ?? 'https://developers.staging.unicity.network/';
