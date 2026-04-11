import { useEffect, useState } from 'react';

import { getNetworkState } from '../utils/network';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getNetworkState().then((state) => {
      if (isMounted) {
        setIsConnected(Boolean(state.isConnected));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return isConnected;
}
