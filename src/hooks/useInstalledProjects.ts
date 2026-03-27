import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const INSTALLED_KEY = 'sphere_installed_projects';
const QUERY_KEY = ['installed-projects'] as const;

function loadInstalled(): string[] {
  try {
    const raw = localStorage.getItem(INSTALLED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInstalled(slugs: string[]) {
  localStorage.setItem(INSTALLED_KEY, JSON.stringify(slugs));
}

export function useInstalledProjects() {
  const queryClient = useQueryClient();

  const { data: installedSlugs = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadInstalled,
    initialData: loadInstalled,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const isInstalled = useCallback(
    (slug: string) => installedSlugs.includes(slug),
    [installedSlugs],
  );

  const update = useCallback(
    (updater: (prev: string[]) => string[]) => {
      queryClient.setQueryData<string[]>(QUERY_KEY, (prev) => {
        const next = updater(prev ?? []);
        saveInstalled(next);
        return next;
      });
    },
    [queryClient],
  );

  const install = useCallback(
    (slug: string) => update((prev) => prev.includes(slug) ? prev : [...prev, slug]),
    [update],
  );

  const uninstall = useCallback(
    (slug: string) => update((prev) => prev.filter((s) => s !== slug)),
    [update],
  );

  const toggle = useCallback(
    (slug: string) => update((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    ),
    [update],
  );

  // Reorder: move item from oldIndex to newIndex
  const reorder = useCallback(
    (oldIndex: number, newIndex: number) => {
      update((prev) => {
        const next = [...prev];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      });
    },
    [update],
  );

  return { installedSlugs, isInstalled, install, uninstall, toggle, reorder };
}
