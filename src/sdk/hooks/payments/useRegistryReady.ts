import { useState, useEffect } from 'react';
import { TokenRegistry } from '@unicitylabs/sphere-sdk';

/**
 * Tracks whether the TokenRegistry has loaded its definitions, so symbol/decimals
 * enrichment can run.
 *
 * Re-arms reliably: a slow or failed FIRST remote fetch (fresh wallet, no cache)
 * must not leave the UI stuck on the coin-id fallback (e.g. "746A4E") until the
 * user logs out and back in. The previous `waitForReady(15_000)` could resolve
 * `false` on a slow first fetch and — with a `[registryReady]` dependency — never
 * retry, even though the registry's background auto-refresh populates the data a
 * few seconds later.
 */
export function useRegistryReady(): boolean {
  const [registryReady, setRegistryReady] = useState(
    () => TokenRegistry.getInstance().getAllDefinitions().length > 0,
  );

  useEffect(() => {
    if (registryReady) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const markIfLoaded = (): boolean => {
      if (cancelled) return false;
      if (TokenRegistry.getInstance().getAllDefinitions().length > 0) {
        setRegistryReady(true);
        return true;
      }
      return false;
    };

    // No timeout — wait for the real initial load (cache → remote). A slow first
    // fetch must not make us give up.
    TokenRegistry.waitForReady(0).then(() => {
      if (markIfLoaded()) return;
      // Initial load brought no data; the registry's background auto-refresh may
      // still populate it — poll until it does.
      interval = setInterval(() => {
        if (markIfLoaded() && interval) clearInterval(interval);
      }, 1000);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [registryReady]);

  return registryReady;
}
