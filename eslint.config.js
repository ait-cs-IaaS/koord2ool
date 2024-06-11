
import globals from "globals";
import js from "@eslint/js";
import pluginVue from 'eslint-plugin-vue'
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...compat.extends("@vue/eslint-config-typescript/recommended"),
  ...compat.extends("@vue/eslint-config-prettier"),
  {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    globals: {
      ...globals.node
    }
  },
  files: ["**/*.ts", "**/*.vue"],
  rules: {
    "space-before-function-paren": 0,
    "vue/valid-v-slot": ["error", {
      "allowModifiers": true
    }]
  },
}]
