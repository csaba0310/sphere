import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { agents } from '../config/activities';
import { useInstalledProjects } from './useInstalledProjects';

const ORDER_KEY = 'sphere_desktop_order';
const LEGACY_INSTALLED_KEY = 'sphere_installed_projects';
const QUERY_KEY = ['desktop-order'] as const;

export type DesktopItemKind = 'app' | 'agent';

export interface DesktopOrderItem {
  /** Prefixed id: `app:<slug>` or `agent:<agentId>`. Stable across renders. */
  id: string;
  kind: DesktopItemKind;
  /** Slug (for apps) or agent.id (for built-in agents). */
  refId: string;
}

function loadOrder(): string[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (raw) return JSON.parse(raw) as string[];
    // One-time migration from the old installed-only order.
    const legacy = localStorage.getItem(LEGACY_INSTALLED_KEY);
    if (legacy) {
      const slugs = JSON.parse(legacy) as string[];
      const seeded = slugs.map((s) => `app:${s}`);
      localStorage.setItem(ORDER_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return [];
  } catch {
    return [];
  }
}

function saveOrder(order: string[]): void {
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
}

function parseId(id: string): DesktopOrderItem | null {
  const sep = id.indexOf(':');
  if (sep < 0) return null;
  const kind = id.slice(0, sep);
  const refId = id.slice(sep + 1);
  if (kind === 'app')   return { id, kind: 'app',   refId };
  if (kind === 'agent') return { id, kind: 'agent', refId };
  return null;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/**
 * Resolved ranking order for desktop icons (apps + built-in agents) backed by
 * the user's saved order in `sphere_desktop_order`. Same merge semantics as
 * useInstalledProjects.mergeSlugs:
 *  - saved order is the authority for ranking,
 *  - new items (just installed, or shipped in this build) are appended,
 *  - vanished items are filtered out.
 */
export function useDesktopOrder() {
  const queryClient = useQueryClient();
  const { installedSlugs } = useInstalledProjects();

  const { data: savedOrder = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn:  loadOrder,
    initialData: loadOrder,
    staleTime: Infinity,
    gcTime:    Infinity,
  });

  // Everything that currently lives on the desktop, in a stable default order
  // (installed apps first, built-ins after). Saved order overlays this.
  const allIds = [
    ...installedSlugs.map((s) => `app:${s}`),
    ...agents.map((a) => `agent:${a.id}`),
  ];

  const allSet = new Set(allIds);
  const orderedIds: string[] = (() => {
    const kept = savedOrder.filter((id) => allSet.has(id));
    const keptSet = new Set(kept);
    for (const id of allIds) if (!keptSet.has(id)) kept.push(id);
    return kept;
  })();

  const orderedItems = orderedIds
    .map(parseId)
    .filter((x): x is DesktopOrderItem => x !== null);

  // Persist the resolved order so newly-installed apps land in localStorage
  // without waiting for the first drag.
  useEffect(() => {
    if (arraysEqual(orderedIds, savedOrder)) return;
    queryClient.setQueryData<string[]>(QUERY_KEY, orderedIds);
    saveOrder(orderedIds);
    // We intentionally depend on the serialized form to avoid a render loop
    // from a fresh-array identity on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedIds.join('|'), savedOrder.join('|'), queryClient]);

  const reorder = useCallback(
    (oldIndex: number, newIndex: number) => {
      const next = [...orderedIds];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      queryClient.setQueryData<string[]>(QUERY_KEY, next);
      saveOrder(next);
    },
    [orderedIds, queryClient],
  );

  return { orderedIds, orderedItems, reorder };
}
