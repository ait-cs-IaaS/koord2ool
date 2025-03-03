import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    proxy: {
      '/api/limesurvey': {
        target: 'http://limesurvey:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/limesurvey/, '/index.php/admin/remotecontrol')
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [vue(), vuetify({ autoImport: true })],
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#outputmanualchunks
      output: {
        manualChunks: {
          vue: ["vue", "vue-router"],
          vuetify: ["vuetify", "vuetify/components", "vuetify/directives"],
          materialdesignicons: ["@mdi/font/css/materialdesignicons.css"],
        },
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});