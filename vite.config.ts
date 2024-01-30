import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  plugins: [vue(), vuetify({ autoImport: true })],
  build: {
    sourcemap: true,
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
