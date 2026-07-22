import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

// extra
import simpleImportSort from "eslint-plugin-simple-import-sort";
import reactHooks from "eslint-plugin-react-hooks";
import eslintNextPlugin from "@next/eslint-plugin-next";

export default defineConfig([
    js.configs.recommended,
    {
        files: [
            "**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"
        ],
        plugins: {
            js,
            "react": pluginReact,
            "simple-import-sort": simpleImportSort,
            "react-hooks": reactHooks,
            "@next/next": eslintNextPlugin,
        },
        settings: {
            react: {
                version: "detect",
                runtime: "automatic",
            }
        },
        rules: {
            // default
            ...eslintNextPlugin.configs.recommended.rules,
            ...eslintNextPlugin.configs[ "core-web-vitals" ].rules,

            // override jsx runtime
            ...pluginReact.configs.flat[ "jsx-runtime" ].rules,

            "simple-import-sort/imports": "warn",
            "simple-import-sort/exports": "warn",
            "react-hooks/rules-of-hooks": "warn",
            "react-hooks/exhaustive-deps": "warn",
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
    },
    tseslint.configs.recommended,
    {
        ignores: [
            ".next/**",
            "out/**",
            "build/**",
            "dist/**",
            "node_modules/**",
            "*.config.js",
            "*.config.mjs",
        ]
    }
]);
