import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    ignores: ['dist', 'node_modules', 'build', 'src/shared/api/generated/**'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  {
    files: ['*.config.{js,cjs}', 'postcss.config.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
