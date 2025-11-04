import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import prettierConfig from "@vue/eslint-config-prettier";

export default defineConfigWithVueTs(pluginVue.configs["flat/recommended"], vueTsConfigs.recommended, prettierConfig, {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: {
      projectService: true,
    },
    globals: {
      ...globals.node,
    },
  },
  files: ["src/**/*.ts", "src/**/*.vue"],
  rules: {
    "space-before-function-paren": 0,
    "vue/valid-v-slot": ["error", { allowModifiers: true }],
  },
});
