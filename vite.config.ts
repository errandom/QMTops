import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  preview: {
    allowedHosts: ['qmtops.azurewebsites.net'], // Your Azure App Service hostname
    host: true, // Bind to 0.0.0.0 so Azure can access it
    port: 8080
  },
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
