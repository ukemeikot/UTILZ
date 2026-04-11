import { useEffect, useMemo } from 'react';

import { router } from 'expo-router';

import { usePasswordVaultStore } from '../store/passwordVaultStore';

export function useVaultProtection(
  nextPathname: '/more/tools' | '/more/vault' | '/more/vault-entry',
  params?: Record<string, string | undefined>,
) {
  const hydrated = usePasswordVaultStore((state) => state.hydrated);
  const lockState = usePasswordVaultStore((state) => state.lockState);

  const isAllowed = useMemo(
    () => hydrated && lockState === 'unlocked',
    [hydrated, lockState],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (lockState !== 'unlocked') {
      router.replace({
        pathname: '/more/vault-lock',
        params: {
          next: nextPathname,
          ...params,
        },
      });
    }
  }, [hydrated, lockState, nextPathname, params]);

  return isAllowed;
}
