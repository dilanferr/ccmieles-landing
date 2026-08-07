import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // L1 resuelto: los efectos con setState sincrónico se refactorizaron
    // (IIFE async / reinicio en render). La regla vuelve a ser error; las
    // excepciones legítimas (p. ej. init desde localStorage) usan disable local.
    rules: {
      "react-hooks/set-state-in-effect": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Salidas de Playwright.
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
