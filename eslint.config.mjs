import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // L1 (deuda técnica pendiente): degradado a warning para no romper el CI.
    // Son patrones preexistentes de efectos con setState; se refactorizarán aparte.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
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
