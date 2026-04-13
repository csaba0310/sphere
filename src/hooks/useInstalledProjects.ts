import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSphereContext } from '../sdk/hooks/core/useSphere';
import {
  fetchInstalledApps,
  installApp,
  uninstallApp,
  pingOpenApp,
  getStoredJwt,
  clearJwt,
  type InstalledApp,
} from '../services/userApi';
import { fetchProject } from '../services/marketplaceApi';

const INSTALLED_KEY = 'sphere_installed_projects';
const LOCAL_KEY = ['installed-projects'] as const;
const SERVER_KEY = ['installed-projects', 'server'] as const;

// ── Local (offline / unauthenticated) cache of slugs ──────────────────

function loadLocalSlugs(): string[] {
  try {
    const raw = localStorage.getItem(INSTALLED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveLocalSlugs(slugs: string[]): void {
  localStorage.setItem(INSTALLED_KEY, JSON.stringify(slugs));
}

// ── Slug ↔ projectId resolution (uses marketplace cache when possible) ──

async function resolveProjectId(slug: string): Promise<string> {
  const detail = await fetchProject(slug);
  return detail._id;
}

// ── Hook ──────────────────────────────────────────────────────────────

export function useInstalledProjects() {
  const queryClient = useQueryClient();
  const { sphere } = useSphereContext();
  const directAddress = sphere?.identity?.directAddress ?? null;
  const walletReady = !!directAddress && !!sphere?.identity?.chainPubkey;

  // If the wallet identity changes mid-session, drop the cached JWT so the next
  // server call signs in as the new identity (don't leak data between users).
  const lastAddressRef = useRef<string | null>(directAddress);
  useEffect(() => {
    if (lastAddressRef.current && lastAddressRef.current !== directAddress) {
      clearJwt();
      queryClient.removeQueries({ queryKey: SERVER_KEY });
    }
    lastAddressRef.current = directAddress;
  }, [directAddress, queryClient]);

  // Server-side state (only fetched when wallet is available)
  const serverQuery = useQuery({
    queryKey: SERVER_KEY,
    queryFn:  () => fetchInstalledApps(sphere!),
    enabled:  walletReady,
    staleTime: 60_000,
    retry: 1,
  });

  // Local fallback — always available
  const { data: localSlugs = [] } = useQuery({
    queryKey: LOCAL_KEY,
    queryFn:  loadLocalSlugs,
    initialData: loadLocalSlugs,
    staleTime: Infinity,
    gcTime:    Infinity,
  });

  // Mirror the latest server response into the local slug cache so logged-out
  // sessions still show the right shortcuts.
  useEffect(() => {
    if (!serverQuery.data) return;
    const serverSlugs = serverQuery.data.map((i) => i.project.slug);
    queryClient.setQueryData<string[]>(LOCAL_KEY, serverSlugs);
    saveLocalSlugs(serverSlugs);
  }, [serverQuery.data, queryClient]);

  // The set of slugs currently shown — server is authoritative when present
  const installedSlugs: string[] =
    serverQuery.data?.map((i) => i.project.slug) ?? localSlugs;

  const isInstalled = useCallback(
    (slug: string) => installedSlugs.includes(slug),
    [installedSlugs],
  );

  // ── Mutations ───────────────────────────────────────────────────────

  const setLocalSlugs = useCallback(
    (next: string[]) => {
      queryClient.setQueryData<string[]>(LOCAL_KEY, next);
      saveLocalSlugs(next);
    },
    [queryClient],
  );

  // Optimistic update on the server cache so UI doesn't flicker between
  // mutate → refetch.
  const patchServerCache = useCallback(
    (updater: (prev: InstalledApp[]) => InstalledApp[]) => {
      queryClient.setQueryData<InstalledApp[]>(SERVER_KEY, (prev) => updater(prev ?? []));
    },
    [queryClient],
  );

  const installMutation = useMutation({
    mutationFn: async (slug: string) => {
      if (!sphere) throw new Error('Wallet unavailable');
      const projectId = await resolveProjectId(slug);
      await installApp(sphere, projectId);
      return { slug, projectId };
    },
    onSuccess: () => {
      // Re-sync to pick up server-side fields (installedAt, etc.)
      void serverQuery.refetch();
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async (slug: string) => {
      if (!sphere) throw new Error('Wallet unavailable');
      const projectId = await resolveProjectId(slug);
      await uninstallApp(sphere, projectId);
      return { slug, projectId };
    },
    onSuccess: () => {
      void serverQuery.refetch();
    },
  });

  const install = useCallback(
    (slug: string) => {
      if (installedSlugs.includes(slug)) return;
      const next = [...installedSlugs, slug];
      setLocalSlugs(next);
      patchServerCache((prev) => prev); // placeholder — server response will update
      if (walletReady) installMutation.mutate(slug);
    },
    [installedSlugs, setLocalSlugs, patchServerCache, walletReady, installMutation],
  );

  const uninstall = useCallback(
    (slug: string) => {
      if (!installedSlugs.includes(slug)) return;
      const next = installedSlugs.filter((s) => s !== slug);
      setLocalSlugs(next);
      patchServerCache((prev) => prev.filter((i) => i.project.slug !== slug));
      if (walletReady) uninstallMutation.mutate(slug);
    },
    [installedSlugs, setLocalSlugs, patchServerCache, walletReady, uninstallMutation],
  );

  const toggle = useCallback(
    (slug: string) => {
      if (installedSlugs.includes(slug)) uninstall(slug);
      else install(slug);
    },
    [installedSlugs, install, uninstall],
  );

  // Reorder is desktop-only UI sugar — keep client-side for now (no server field
  // for sortOrder yet; the pinned flag + sort by lastOpenedAt covers most cases).
  const reorder = useCallback(
    (oldIndex: number, newIndex: number) => {
      const next = [...installedSlugs];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      setLocalSlugs(next);
    },
    [installedSlugs, setLocalSlugs],
  );

  // Notify backend that the user opened an app — drives DAU/retention metrics.
  // Best-effort: silently no-ops when not authenticated.
  const ping = useCallback(
    async (slug: string) => {
      if (!walletReady || !sphere || !getStoredJwt()) return;
      try {
        const projectId = await resolveProjectId(slug);
        await pingOpenApp(sphere, projectId);
      } catch {
        /* swallow */
      }
    },
    [walletReady, sphere],
  );

  return {
    installedSlugs,
    isInstalled,
    install,
    uninstall,
    toggle,
    reorder,
    ping,
    isSyncing: serverQuery.isFetching || installMutation.isPending || uninstallMutation.isPending,
  };
}
