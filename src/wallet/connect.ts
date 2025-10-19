import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';
import { http } from 'wagmi';

const projectId = '2eb2bd0a7b3b42b2ab032eec8e938bba';

export const config = getDefaultConfig({
  appName: 'CashMatrix',
  projectId,
  chains: [mainnet, polygon, arbitrum, base] as const,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: false,
});
