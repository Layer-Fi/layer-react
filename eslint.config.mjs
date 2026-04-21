import globals from 'globals'

import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import stylisticPlugin from '@stylistic/eslint-plugin'
import tsEslint from 'typescript-eslint'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import pluginImport from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

const layerNamingPlugin = {
  rules: {
    'constant-enum-casing': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'enforce SCREAMING_SNAKE_CASE for exported static constants and PascalCase for enum string values',
        },
        schema: [],
        messages: {
          constantCase: 'Exported static constants should use SCREAMING_SNAKE_CASE.',
          enumMemberCase: 'Enum members should use PascalCase.',
        },
      },
      create(context) {
        const screamingSnakeCasePattern = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/
        const pascalCasePattern = /^[A-Z][A-Za-z0-9]*$/

        function isStaticConstantExpression(node) {
          if (!node) {
            return false
          }

          switch (node.type) {
            case 'Literal':
              return true
            case 'TemplateLiteral':
              return node.expressions.length === 0
            case 'ArrayExpression':
              return node.elements.every((element) => {
                if (!element) {
                  return true
                }
                if (element.type === 'SpreadElement') {
                  return false
                }
                return isStaticConstantExpression(element)
              })
            case 'ObjectExpression':
              return node.properties.every((prop) => {
                if (prop.type !== 'Property') {
                  return false
                }
                if (prop.computed || prop.method) {
                  return false
                }
                return isStaticConstantExpression(prop.value)
              })
            default:
              return false
          }
        }

        function isExportedConst(declarator) {
          const declaration = declarator.parent
          if (!declaration || declaration.type !== 'VariableDeclaration' || declaration.kind !== 'const') {
            return false
          }

          const exportNode = declaration.parent
          return exportNode && exportNode.type === 'ExportNamedDeclaration'
        }

        return {
          VariableDeclarator(node) {
            if (node.id.type !== 'Identifier') {
              return
            }

            if (!isExportedConst(node)) {
              return
            }

            if (!isStaticConstantExpression(node.init)) {
              return
            }

            if (!screamingSnakeCasePattern.test(node.id.name)) {
              context.report({
                node: node.id,
                messageId: 'constantCase',
              })
            }
          },
          TSEnumMember(node) {
            if (node.id.type !== 'Identifier') {
              return
            }

            const enumDeclaration = node.parent
            if (enumDeclaration?.type !== 'TSEnumDeclaration') {
              return
            }

            // Incremental rollout: only enforce local enums first.
            if (enumDeclaration.parent?.type === 'ExportNamedDeclaration') {
              return
            }

            if (!pascalCasePattern.test(node.id.name)) {
              context.report({
                node: node.id,
                messageId: 'enumMemberCase',
              })
            }
          },
        }
      },
    },
  },
}

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
            'i18next.config.ts',
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
    files: ['eslint.config.mjs'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/hooks/features/**/*.{ts,tsx}'],
    plugins: {
      layerNaming: layerNamingPlugin,
    },
    rules: {
      'no-restricted-imports': ['error', { patterns: ['*.css'] }],
      'layerNaming/constant-enum-casing': 'error',
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
          '@components/',
          '@ui/',
          '@blocks/',
          '@contexts/',
          '@hooks/',
          '@providers/',
          '@utils/',
          '@internal-types/',
          '@schemas/',
          '@views/',
          '@icons/',
          '@assets/',
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

            // Cross-cutting helpers (used by api, hooks, components, etc.)
            '^(?:type:)?@utils/',

            // Data layer: hooks
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
