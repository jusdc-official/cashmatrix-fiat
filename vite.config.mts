import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
      fastRefresh: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      util: "rollup-plugin-node-polyfills/polyfills/util",
      process: "rollup-plugin-node-polyfills/polyfills/process-es6",
      buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
    },
  },
  optimizeDeps: {
    exclude: ['@base-org/account'],
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'import-assertions': true,
      },
      define: {
        global: "globalThis",
        "process.env": "{}",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});
