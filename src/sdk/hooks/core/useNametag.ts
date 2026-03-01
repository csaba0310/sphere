import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSphereContext } from './useSphere';
import { SPHERE_KEYS } from '../../queryKeys';

export interface UseNametagReturn {
  nametag: string | null;
  isLoading: boolean;
  register: (name: string) => Promise<void>;
  isRegistering: boolean;
  registerError: Error | null;
  resolve: (name: string) => Promise<string | null>;
}

export function useNametag(): UseNametagReturn {
  const { sphere } = useSphereContext();
  const queryClient = useQueryClient();

  const nametag = sphere?.identity?.nametag ?? null;

  const registerMutation = useMutation({
    mutationFn: async (name: string): Promise<void> => {
      if (!sphere) throw new Error('Wallet not initialized');
      await sphere.registerNametag(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPHERE_KEYS.identity.all });
    },
    // onError inherited from global handler → auto-toast
  });

  const resolve = useCallback(
    async (name: string): Promise<string | null> => {
      if (!sphere) return null;
      const transport = sphere.getTransport();
      if (transport.resolveNametag) {
        return transport.resolveNametag(name);
      }
      return null;
    },
    [sphere],
  );

  return {
    nametag,
    isLoading: false,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    resolve,
  };
}
