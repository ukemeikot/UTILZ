import * as Network from 'expo-network';

export async function getNetworkState() {
  return Network.getNetworkStateAsync();
}
