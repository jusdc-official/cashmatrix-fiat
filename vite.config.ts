import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  build: {
    rollupOptions: {
      external: [
        /^@safe-global\/.*/,
        /^@safe-globalThis\/.*/
      ],
      output: {
        globals: {
          '@safe-global/safe-apps-sdk': 'SafeAppsSDK',
          '@safe-globalThis/safe-gateway-typescript-sdk': 'SafeGatewaySDK'
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    exclude: [
      '@safe-global/safe-apps-sdk',
      '@safe-global/safe-apps-provider'
    ]
  }
})
