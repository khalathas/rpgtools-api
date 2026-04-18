import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["devnotes/**"] },
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node }, rules: { "no-console": "error", "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }] } },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
]);
