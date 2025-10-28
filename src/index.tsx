// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Buffer } from 'buffer';

import App from './App';
import './index.css';
import { config } from './wallet/connect';

// ✅ Polyfill for Buffer (needed by ethers and some SDKs)
(window as any).Buffer = Buffer;

// ----------------- Wagmi + RainbowKit setup -----------------

// 1️⃣ Configure supported chains and providers
const { chains, publicClient } = configureChains(
  [
    { id: 1, name: 'Ethereum' },
    { id: 137, name: 'Polygon' },
    { id: 8453, name: 'Base' },
    { id: 42161, name: 'Arbitrum' },
  ],
  [publicProvider()]
);

// 2️⃣ Default RainbowKit wallets
const { connectors } = getDefaultWallets({
  appName: 'JUSDC App',
  chains,
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect/RainbowKit projectId
});

// 3️⃣ Wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// ----------------- TanStack Query client -----------------
const queryClient = new QueryClient();

// ----------------- Render App -----------------
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>
);
