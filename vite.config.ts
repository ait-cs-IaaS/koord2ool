import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
	  host: "0.0.0.0"
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#outputmanualchunks
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'],
          vuetify: [
            'vuetify',
            'vuetify/components',
            'vuetify/directives',
          ],
          materialdesignicons: ['@mdi/font/css/materialdesignicons.css'],
        },
      },
    },
  }
})
