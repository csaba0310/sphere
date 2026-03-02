import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getApprovedOrigins,
  getApprovedOrigin,
  saveApprovedOrigin,
  updateLastSeen,
  revokeApprovedOrigin,
  migrateApprovedSessions,
} from '../../../src/utils/connected-sites';
import { STORAGE_KEYS } from '../../../src/config/storageKeys';

// Mock localStorage
let localStorageMock: Record<string, string>;

beforeEach(() => {
  localStorageMock = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock[key];
    }),
    clear: vi.fn(() => { localStorageMock = {}; }),
    key: vi.fn((index: number) => Object.keys(localStorageMock)[index] ?? null),
    get length() { return Object.keys(localStorageMock).length; },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const DAPP = { name: 'TestDApp', url: 'https://example.com' };
const ORIGIN = 'https://example.com';
const PERMISSIONS = ['identity:read', 'balance:read'] as unknown as import('@unicitylabs/sphere-sdk/connect').PermissionScope[];

// ==========================================
// getApprovedOrigins
// ==========================================

describe('getApprovedOrigins', () => {
  it('returns empty object when no data exists', () => {
    expect(getApprovedOrigins()).toEqual({});
  });

  it('returns empty object on corrupted JSON', () => {
    localStorageMock[STORAGE_KEYS.CONNECTED_SITES] = '{invalid json';
    expect(getApprovedOrigins()).toEqual({});
  });
});

// ==========================================
// getApprovedOrigin
// ==========================================

describe('getApprovedOrigin', () => {
  it('returns null for unknown origin', () => {
    expect(getApprovedOrigin(ORIGIN)).toBeNull();
  });
});

// ==========================================
// saveApprovedOrigin
// ==========================================

describe('saveApprovedOrigin', () => {
  it('saves and retrieves an entry', () => {
    saveApprovedOrigin(ORIGIN, DAPP, PERMISSIONS);

    const entry = getApprovedOrigin(ORIGIN);
    expect(entry).not.toBeNull();
    expect(entry!.dapp.name).toBe('TestDApp');
    expect(entry!.permissions).toEqual(PERMISSIONS);
    expect(entry!.connectedAt).toBeGreaterThan(0);
    expect(entry!.lastSeenAt).toBeGreaterThan(0);
  });

  it('preserves connectedAt on re-save of same origin', () => {
    saveApprovedOrigin(ORIGIN, DAPP, PERMISSIONS);
    const first = getApprovedOrigin(ORIGIN)!;
    const originalConnectedAt = first.connectedAt;

    // Re-save with updated permissions
    saveApprovedOrigin(ORIGIN, DAPP, ['identity:read'] as unknown as import('@unicitylabs/sphere-sdk/connect').PermissionScope[]);
    const second = getApprovedOrigin(ORIGIN)!;

    expect(second.connectedAt).toBe(originalConnectedAt);
    expect(second.permissions).toEqual(['identity:read']);
  });

  it('updates lastSeenAt on re-save', () => {
    saveApprovedOrigin(ORIGIN, DAPP, PERMISSIONS);
    const first = getApprovedOrigin(ORIGIN)!;

    // Advance time slightly
    vi.spyOn(Date, 'now').mockReturnValue(first.lastSeenAt + 5000);

    saveApprovedOrigin(ORIGIN, DAPP, PERMISSIONS);
    const second = getApprovedOrigin(ORIGIN)!;

    expect(second.lastSeenAt).toBe(first.lastSeenAt + 5000);

    vi.restoreAllMocks();
  });

  it('stores full DAppMetadata', () => {
    const dapp = { name: 'Rich', description: 'A dApp', icon: 'https://example.com/icon.png', url: 'https://example.com' };
    saveApprovedOrigin(ORIGIN, dapp, PERMISSIONS);

    const entry = getApprovedOrigin(ORIGIN)!;
    expect(entry.dapp).toEqual(dapp);
  });
});

// ==========================================
// updateLastSeen
// ==========================================

describe('updateLastSeen', () => {
  it('updates only lastSeenAt field', () => {
    saveApprovedOrigin(ORIGIN, DAPP, PERMISSIONS);
    const before = getApprovedOrigin(ORIGIN)!;

    vi.spyOn(Date, 'now').mockReturnValue(before.lastSeenAt + 10_000);
    updateLastSeen(ORIGIN);
    vi.restoreAllMocks();

    const after = getApprovedOrigin(ORIGIN)!;
    expect(after.lastSeenAt).toBe(before.lastSeenAt + 10_000);
    expect(after.connectedAt).toBe(before.connectedAt);
    expect(after.dapp).toEqual(before.dapp);
    expect(after.permissions).toEqual(before.permissions);
  });

  it('is no-op for unknown origin', () => {
    updateLastSeen('https://unknown.com');
    expect(getApprovedOrigins()).toEqual({});
  });
});

// ==========================================
// revokeApprovedOrigin
// ==========================================

describe('revokeApprovedOrigin', () => {
  it('removes the entry', () => {
    saveApprovedOrigin(ORIGIN, DAPP, PERMISSIONS);
    expect(getApprovedOrigin(ORIGIN)).not.toBeNull();

    revokeApprovedOrigin(ORIGIN);
    expect(getApprovedOrigin(ORIGIN)).toBeNull();
  });

  it('is no-op for unknown origin', () => {
    saveApprovedOrigin(ORIGIN, DAPP, PERMISSIONS);
    revokeApprovedOrigin('https://unknown.com');
    expect(getApprovedOrigin(ORIGIN)).not.toBeNull();
  });
});

// ==========================================
// migrateApprovedSessions
// ==========================================

describe('migrateApprovedSessions', () => {
  const OLD_KEY = 'sphere-connect:approved';

  it('converts old array format to new record format', () => {
    localStorageMock[OLD_KEY] = JSON.stringify([
      { origin: 'https://a.com', dappName: 'App A', permissions: ['identity:read'], approvedAt: 1000 },
      { origin: 'https://b.com', dappName: 'App B', permissions: ['balance:read'], approvedAt: 2000 },
    ]);

    migrateApprovedSessions();

    const origins = getApprovedOrigins();
    expect(Object.keys(origins)).toHaveLength(2);

    expect(origins['https://a.com'].dapp.name).toBe('App A');
    expect(origins['https://a.com'].connectedAt).toBe(1000);
    expect(origins['https://a.com'].lastSeenAt).toBe(1000);

    expect(origins['https://b.com'].dapp.name).toBe('App B');
    expect(origins['https://b.com'].permissions).toEqual(['balance:read']);
  });

  it('removes old key after migration', () => {
    localStorageMock[OLD_KEY] = JSON.stringify([
      { origin: ORIGIN, dappName: 'Test', permissions: [], approvedAt: 1000 },
    ]);

    migrateApprovedSessions();
    expect(localStorageMock[OLD_KEY]).toBeUndefined();
  });

  it('is idempotent', () => {
    localStorageMock[OLD_KEY] = JSON.stringify([
      { origin: ORIGIN, dappName: 'Test', permissions: ['identity:read'], approvedAt: 1000 },
    ]);

    migrateApprovedSessions();
    migrateApprovedSessions(); // second call — old key already gone

    const origins = getApprovedOrigins();
    expect(Object.keys(origins)).toHaveLength(1);
  });

  it('does not overwrite existing new-format entries', () => {
    // Pre-existing entry in new format
    saveApprovedOrigin(ORIGIN, { name: 'NewName', url: ORIGIN }, PERMISSIONS);

    // Old format has different data for same origin
    localStorageMock[OLD_KEY] = JSON.stringify([
      { origin: ORIGIN, dappName: 'OldName', permissions: ['identity:read'], approvedAt: 500 },
    ]);

    migrateApprovedSessions();

    const entry = getApprovedOrigin(ORIGIN)!;
    expect(entry.dapp.name).toBe('NewName'); // new-format preserved
    expect(entry.permissions).toEqual(PERMISSIONS);
  });

  it('is no-op when no old data exists', () => {
    migrateApprovedSessions();
    expect(getApprovedOrigins()).toEqual({});
  });

  it('removes old key if old data is empty array', () => {
    localStorageMock[OLD_KEY] = JSON.stringify([]);
    migrateApprovedSessions();
    expect(localStorageMock[OLD_KEY]).toBeUndefined();
  });
});
