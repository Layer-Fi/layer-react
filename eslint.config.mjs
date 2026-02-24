import globals from 'globals'

import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import stylisticPlugin from '@stylistic/eslint-plugin'
import tsEslint from 'typescript-eslint'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import pluginImport from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default tsEslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'vite/**', 'scripts/**', '.vim_backups/**'],
  },
  js.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  stylisticPlugin.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    plugins: { 'unused-imports': unusedImportsPlugin },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mjs',
            '*.js',
            '*.cjs',
            '*.mjs',
          ],
        },
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],

      '@stylistic/quotes': ['error', 'single', { avoidEscape: false }],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
      '@stylistic/max-len': [
        'error',
        { code: 160, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true },
      ],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['*.css'] }],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: { import: pluginImport },
    settings: { 'import/resolver': { typescript: true, node: true } },
    rules: {
      'import/no-relative-parent-imports': [
        'error',
        { ignore: [
          '@api/',
          '@components/',
          '@ui/',
          '@blocks/',
          '@contexts/',
          '@features/',
          '@hooks/',
          '@i18n/',
          '@providers/',
          '@utils/',
          '@internal-types/',
          '@schemas/',
          '@views/',
          '@config/',
          '@icons/',
          '@assets/',
          '@models/',
        ],
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      }],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': ['error', {
        groups: [
          [
            // React + react-dom
            '^(?:type:)?react(?:$|/)',
            '^(?:type:)?react-dom(?:$|/)',

            // Node + external dependencies
            '^(?:type:)?node:',
            '^(?:type:)?@?\\w',
          ],
          [
            // Domain & data contracts
            '^(?:type:)?@internal-types/',
            '^(?:type:)?@schemas/',
            '^(?:type:)?@models/',

            // App/environment configuration
            '^(?:type:)?@config/',

            // Cross-cutting helpers (used by api, hooks, components, etc.)
            '^(?:type:)?@utils/',

            // Data layer: API definitions, then hooks that consume them
            '^(?:type:)?@api/',
            '^(?:type:)?@hooks/',

            // App wiring & global state (can depend on hooks/api)
            '^(?:type:)?@providers/',
            '^(?:type:)?@contexts/',

            // Design system primitives
            '^(?:type:)?@icons/',
            '^(?:type:)?@ui/',
            '^(?:type:)?@blocks/',

            // Reusable and feature-level UI
            '^(?:type:)?@components/',
            '^(?:type:)?@features/',
            '^(?:type:)?@views/',

            // Static resources
            '^(?:type:)?@assets/',
          ],
          [
            // Styles
            '.*\\.s?css$',
          ],
        ],
      }],
      'simple-import-sort/exports': 'error',
    },
  },
)
