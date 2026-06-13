import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const API_BASE = import.meta.env.VITE_SPHERE_API_URL ?? 'http://localhost:3001';

export interface MaintenanceStatus {
  enabled: boolean;
  message: string | null;
  updatedAt: string | null;
}

const NOT_UNDER_MAINTENANCE: MaintenanceStatus = { enabled: false, message: null, updatedAt: null };

/**
 * Polls the allowlisted `/api/maintenance/status` endpoint. That route is exempt
 * from the maintenance gate, so it always answers 200 — unlike the marketplace
 * routes, which answer 503 while `sphere` is under maintenance. Knowing the state
 * up-front lets us skip the marketplace requests entirely instead of firing them
 * and letting the browser log the (expected) 503s as red console errors.
 */
async function fetchStatus(): Promise<MaintenanceStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/maintenance/status`, {
      headers: { 'x-client': 'sphere' },
    });
    if (!res.ok) return NOT_UNDER_MAINTENANCE;
    return (await res.json()) as MaintenanceStatus;
  } catch {
    // Fail-open: a hiccup on the status endpoint must never hide the marketplace.
    return NOT_UNDER_MAINTENANCE;
  }
}

export function useMaintenanceStatus() {
  const qc = useQueryClient();

  useEffect(() => {
    // If any API call slips through and gets a 503 maintenance response, it
    // dispatches `maintenance:forced` — invalidate immediately instead of
    // waiting up to 30s for the next poll.
    const handler = (): void => { void qc.invalidateQueries({ queryKey: ['maintenance-status'] }); };
    window.addEventListener('maintenance:forced', handler);
    return () => window.removeEventListener('maintenance:forced', handler);
  }, [qc]);

  return useQuery({
    queryKey: ['maintenance-status'],
    queryFn: fetchStatus,
    refetchInterval: 30_000,
    staleTime: 0,
    retry: 1,
  });
}

/**
 * Gate for marketplace queries. True only once we KNOW the API is not under
 * maintenance for the `sphere` client. While the status is still loading the
 * gate stays closed so marketplace requests wait for the (fast, allowlisted)
 * status call rather than racing ahead and triggering 503s. `fetchStatus`
 * fails open, so a status outage never permanently blocks the marketplace.
 */
export function useMarketplaceEnabled(): boolean {
  const { data, isSuccess } = useMaintenanceStatus();
  return isSuccess && !data.enabled;
}
