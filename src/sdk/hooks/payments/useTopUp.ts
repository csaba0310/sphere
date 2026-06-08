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
 * Human-readable mint amounts per symbol (mirrors the old faucet amounts).
 * Any other fungible coin in the registry gets DEFAULT_AMOUNT.
 */
const AMOUNTS: Record<string, number> = {
  UCT: 100,
  BTC: 1,
  SOL: 1000,
  ETH: 42,
  USDT: 1000,
  USDC: 1000,
  USDU: 1000,
};
const DEFAULT_AMOUNT = 100;

/**
 * Self-mint test tokens to this wallet (v2 faucet replacement). Mints every
 * fungible coin in the TokenRegistry to the wallet's own identity via
 * `payments.mintFungibleToken`, then refreshes the payment queries. No faucet,
 * no nametag required.
 */
export function useTopUp(): UseTopUpReturn {
  const { sphere } = useSphereContext();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (): Promise<TopUpResult[]> => {
      if (!sphere) throw new Error('Wallet not initialized');

      const defs = TokenRegistry.getInstance()
        .getFungibleTokens()
        .filter((d) => d.id && d.symbol);
      if (defs.length === 0) {
        throw new Error('Token registry not loaded yet — try again in a moment');
      }

      return Promise.all(
        defs.map(async (def): Promise<TopUpResult> => {
          const symbol = def.symbol as string;
          const human = AMOUNTS[symbol] ?? DEFAULT_AMOUNT;
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
