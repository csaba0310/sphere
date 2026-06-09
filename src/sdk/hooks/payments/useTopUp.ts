import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSphereContext } from '../core/useSphere';
import { SPHERE_KEYS } from '../../queryKeys';
import { TokenRegistry, toSmallestUnit } from '@unicitylabs/sphere-sdk';

/** Per-coin result of a top-up mint, for partial-success display. */
export interface TopUpResult {
  symbol: string;
  success: boolean;
  error?: string;
}

export interface UseTopUpReturn {
  topUp: () => Promise<TopUpResult[]>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Predefined Top Up basket: exactly which coins to self-mint and how much
 * (human-readable units). This is the single source of truth — editing this
 * map is the only thing needed to change what a top-up delivers. Coins present
 * in the registry but NOT listed here are intentionally never minted.
 */
const AMOUNTS: Record<string, number> = {
  UCT: 100,
  BTC: 0.01,
  SOL: 1,
  ETH: 0.5,
};

/**
 * Self-mint test tokens to this wallet (v2 faucet replacement). Mints ONLY the
 * predefined `AMOUNTS` basket to the wallet's own identity via
 * `payments.mintFungibleToken`, then refreshes the payment queries. The
 * TokenRegistry is used solely to resolve each symbol's coinId + decimals — it
 * does NOT drive which coins are minted. No faucet, no nametag required.
 */
export function useTopUp(): UseTopUpReturn {
  const { sphere } = useSphereContext();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (): Promise<TopUpResult[]> => {
      if (!sphere) throw new Error('Wallet not initialized');

      const fungible = TokenRegistry.getInstance().getFungibleTokens();
      if (fungible.length === 0) {
        throw new Error('Token registry not loaded yet — try again in a moment');
      }

      // Resolve each predefined symbol to its registry definition (coinId +
      // decimals). The registry only supplies metadata; the basket above
      // decides which coins are minted.
      const bySymbol = new Map(
        fungible.filter((d) => d.id && d.symbol).map((d) => [d.symbol as string, d]),
      );

      return Promise.all(
        Object.entries(AMOUNTS).map(async ([symbol, human]): Promise<TopUpResult> => {
          const def = bySymbol.get(symbol);
          if (!def) {
            return { symbol, success: false, error: 'Not in token registry' };
          }
          const amount = toSmallestUnit(human, def.decimals ?? 0);
          try {
            const res = await sphere.payments.mintFungibleToken(def.id, amount);
            return res.success
              ? { symbol, success: true }
              : { symbol, success: false, error: res.error };
          } catch (e) {
            return { symbol, success: false, error: e instanceof Error ? e.message : String(e) };
          }
        }),
      );
    },
    onSuccess: () => {
      // Mirror useTransfer: force a fresh fetch of all payment queries.
      // useAssets has a 30s staleTime and does not listen to DOM events, so an
      // explicit refetch is required for the new balances to show.
      queryClient.refetchQueries({ queryKey: SPHERE_KEYS.payments.tokens.all });
      queryClient.refetchQueries({ queryKey: SPHERE_KEYS.payments.balance.all });
      queryClient.refetchQueries({ queryKey: SPHERE_KEYS.payments.assets.all });
      queryClient.refetchQueries({ queryKey: SPHERE_KEYS.payments.transactions.all });
    },
  });

  return {
    topUp: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
