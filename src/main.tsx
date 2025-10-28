// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

// Polyfills for Buffer and global
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
(window as any).global = window;
(window as any).process = { env: {} };

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import App from "./App";
import "./index.css";
import { config } from "./wallet/connect";

// Create TanStack Query client
const queryClient = new QueryClient();

// Mount React app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
