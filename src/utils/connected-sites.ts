import type { DAppMetadata, PermissionScope } from '@unicitylabs/sphere-sdk/connect';
import { STORAGE_KEYS } from '../config/storageKeys';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApprovedOriginEntry {
  permissions: PermissionScope[];
  connectedAt: number;
  lastSeenAt: number;
  dapp: DAppMetadata;
}

// ---------------------------------------------------------------------------
// CRUD helpers (synchronous — localStorage)
// ---------------------------------------------------------------------------

export function getApprovedOrigins(): Record<string, ApprovedOriginEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONNECTED_SITES);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ApprovedOriginEntry>;
  } catch {
    return {};
  }
}

export function getApprovedOrigin(origin: string): ApprovedOriginEntry | null {
  return getApprovedOrigins()[origin] ?? null;
}

export function saveApprovedOrigin(
  origin: string,
  dapp: DAppMetadata,
  permissions: PermissionScope[],
): void {
  try {
    const current = getApprovedOrigins();
    const existing = current[origin];
    current[origin] = {
      permissions,
      connectedAt: existing?.connectedAt ?? Date.now(),
      lastSeenAt: Date.now(),
      dapp,
    };
    localStorage.setItem(STORAGE_KEYS.CONNECTED_SITES, JSON.stringify(current));
  } catch { /* ignore */ }
}

export function updateLastSeen(origin: string): void {
  try {
    const current = getApprovedOrigins();
    if (!current[origin]) return;
    current[origin].lastSeenAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.CONNECTED_SITES, JSON.stringify(current));
  } catch { /* ignore */ }
}

export function revokeApprovedOrigin(origin: string): void {
  try {
    const current = getApprovedOrigins();
    if (!current[origin]) return;
    delete current[origin];
    localStorage.setItem(STORAGE_KEYS.CONNECTED_SITES, JSON.stringify(current));
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Migration from old format (sphere-connect:approved)
// ---------------------------------------------------------------------------

const OLD_KEY = 'sphere-connect:approved';

interface OldApprovedSession {
  origin: string;
  dappName: string;
  permissions: PermissionScope[];
  approvedAt: number;
}

export function migrateApprovedSessions(): void {
  try {
    const raw = localStorage.getItem(OLD_KEY);
    if (!raw) return;

    const oldSessions: OldApprovedSession[] = JSON.parse(raw);
    if (!Array.isArray(oldSessions) || oldSessions.length === 0) {
      localStorage.removeItem(OLD_KEY);
      return;
    }

    const current = getApprovedOrigins();

    for (const session of oldSessions) {
      // Don't overwrite entries already in the new format
      if (current[session.origin]) continue;

      current[session.origin] = {
        permissions: session.permissions,
        connectedAt: session.approvedAt,
        lastSeenAt: session.approvedAt,
        dapp: {
          name: session.dappName,
          url: session.origin,
        },
      };
    }

    localStorage.setItem(STORAGE_KEYS.CONNECTED_SITES, JSON.stringify(current));
    localStorage.removeItem(OLD_KEY);
  } catch { /* ignore */ }
}
