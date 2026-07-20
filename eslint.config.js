import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";

/*
  Flat config (ESLint 9+). Using explicit rule objects rather than a plugin's named
  "recommended"/"recommended-latest" export, since that export's shape has changed between
  plugin versions (see eslint-plugin-react-hooks issues around v6). This is more verbose but
  won't silently break on a minor version bump.
*/
export default [
  { ignores: ["dist", "build", "coverage", "node_modules", "playwright-report", "test-results"] },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Rules of Hooks — catches the exact class of bug we hit with the speech-recognition
      // hook (stale closures / missing dependencies), so these are errors, not warnings.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React 17+ with the automatic JSX runtime (Vite's default) doesn't need React in scope
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
    settings: {
      react: { version: "detect" },
    },
  },

  {
    files: ["**/*.test.{js,jsx}", "src/test/**/*.{js,jsx}", "e2e/**/*.{js,jsx}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Must be last — disables ESLint stylistic rules that would conflict with Prettier.
  prettierConfig,
];
