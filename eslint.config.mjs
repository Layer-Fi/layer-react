import globals from 'globals'

import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import stylisticPlugin from '@stylistic/eslint-plugin'
import tsEslint from 'typescript-eslint'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'

export default tsEslint.config([
  {
    ignores: [
      'build/*',
      'dist/*',
      'bin/*',
    ],
  },
  js.configs.recommended,
  tsEslint.configs.recommendedTypeChecked,
  stylisticPlugin.configs['recommended-flat'],
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  {
    plugins: {
      'unused-imports': unusedImportsPlugin,
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals['shared-node-browser'],
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-console': ['error', {
        allow: ['warn', 'error', 'debug'],
      }],

      '@stylistic/quotes': ['error', 'single', { avoidEscape: false }],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/operator-linebreak': [
        'error',
        'before',
        {
          overrides: {
            '=': 'after',
          },
        },
      ],
      '@stylistic/max-len': [
        'error',
        {
          code: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
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

      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.tsx', '**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['*.css'] }],
    },
  },
])
