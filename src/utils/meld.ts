// src/utils/meld.ts
export type NetworkKey = 'ethereum' | 'polygon' | 'base';

export const NETWORK_MAP: Record<NetworkKey, { label: string; chainId: number; jusdcAddress: string }> = {
  ethereum: { label: 'Ethereum', chainId: 1, jusdcAddress: '0x3a4184028de3f2b2fb63d596ec9101328ac7a736' },
  polygon:  { label: 'Polygon',  chainId: 137, jusdcAddress: '0xFfF13F7Df6db0811A45b162D5CA742f970888eE0' },
  base:     { label: 'Base',     chainId: 8453, jusdcAddress: '0xfF9dEfDB71e9aeBA1FAAB543c5e2989f5eFc152A' },
};

export function buildMeldUrl({
  publicKey,
  walletAddress,
  network,
}: {
  publicKey: string;
  walletAddress: string;
  network: NetworkKey;
}) {
  const base = 'https://meldcrypto.com/';
  const params = new URLSearchParams();
  params.set('publicKey', publicKey);
  params.set('destinationCurrencyCode', 'USDC');
  params.set('walletAddress', walletAddress);

  if (network) {
    const m = NETWORK_MAP[network];
    params.set('destinationNetwork', String(m.chainId));
    params.set('destinationContractAddress', m.jusdcAddress);
    params.set('network', m.label);
  }

  return `${base}?${params.toString()}`;
}
