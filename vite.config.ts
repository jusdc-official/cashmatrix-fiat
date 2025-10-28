// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
      external: [
        /^@safe-global\/.*/,
        /^@safe-globalThis\/.*/,
      ],
      output: {
        globals: {
          '@safe-global/safe-apps-sdk': 'SafeAppsSDK',
          '@safe-globalThis/safe-gateway-typescript-sdk': 'SafeGatewaySDK',
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env': '{}',
      },
    },
    exclude: [
      '@safe-global/safe-apps-sdk',
      '@safe-global/safe-apps-provider',
    ],
  },
  resolve: {
    alias: {
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
    },
  },
  server: {
    port: 5173,
    https: false, // ✅ Disable HTTPS for local dev to avoid NET_RESET errors
    open: true,   // Auto open in browser
  },
});
