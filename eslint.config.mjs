import { readdirSync } from 'node:fs'

import globals from 'globals'

import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import stylisticPlugin from '@stylistic/eslint-plugin'
import tsEslint from 'typescript-eslint'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import pluginImport from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

// Import boundaries. See src/SKILL.md.
const BOUNDARY_SEVERITY = 'error'

const TEST_FILES = ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/*.stories.tsx', 'src/**/*.storyData.tsx']

// Lowest tier first. Drives the import-sort groups and the
// `no-relative-parent-imports` ignore list.
const TIER_ALIASES = [
  '@internal-types', '@schemas/common', '@schemas/features', '@schemas', '@utils', '@icons', '@assets',
  '@providers/global', '@providers/common',
  '@hooks/utils',
  '@api', '@hooks/api',
  '@providers/features', '@providers',
  '@hooks/legacy', '@hooks/features', '@hooks',
  '@components/utility', '@ui', '@components/ui', '@blocks', '@components/blocks',
  '@features', '@components/features', '@components',
  '@views',
]

const TEST_ALIASES = ['@fixtures', '@msw', '@testUtils']

const ALIASES = [...TIER_ALIASES, ...TEST_ALIASES]

/** @type {(alias: string) => string} */
const aliasSortGroup = alias => `^(?:type:)?${alias.replaceAll('/', '\\/')}\\/`

/**
 * @typedef {{ name: string, files: string[], imports: string[], nested?: string[] }} Layer
 * @typedef {{ dir: string, tier: string, aliases: string[], shared: string[], skipDomains?: string[] }} Partition
 * @typedef {{ group: string[], message: string }} RestrictedPattern
 */

/**
 * Lowest tier first; a tier may import strictly lower tiers only. `files` are the
 * tier's own sources, `imports` the specifiers that reach it.
 *
 * @type {Layer[]}
 */
const LAYERS = [
  {
    name: 'foundation',
    files: ['src/{types,schemas,utils,assets}/**/*.{ts,tsx}', 'src/components/icons/**/*.{ts,tsx}'],
    imports: ['@internal-types/**', '@schemas/**', '@utils/**', '@icons/**', '@assets/**'],
  },
  {
    name: 'context',
    files: ['src/providers/{global,common}/**/*.{ts,tsx}'],
    nested: ['src/providers/global/LayerProvider/**/*.{ts,tsx}'],
    imports: ['@providers/global/**', '@providers/common/**'],
  },
  {
    name: 'generic hooks',
    files: ['src/hooks/utils/**/*.{ts,tsx}'],
    imports: ['@hooks/utils/**'],
  },
  {
    name: 'data loading',
    files: ['src/hooks/api/**/*.{ts,tsx}'],
    imports: ['@api/**', '@hooks/api/**'],
  },
  {
    name: 'stores',
    files: ['src/providers/features/**/*.{ts,tsx}', 'src/hooks/legacy/**/*.{ts,tsx}'],
    nested: [
      // Frozen and being deleted: reachable from this tier, unchecked itself.
      'src/hooks/legacy/**/*.{ts,tsx}',
    ],
    imports: ['@providers/features/**', '@hooks/legacy/**'],
  },
  {
    name: 'feature hooks',
    files: ['src/hooks/features/**/*.{ts,tsx}'],
    imports: ['@hooks/features/**'],
  },
  {
    name: 'render helpers',
    files: ['src/components/utility/**/*.{ts,tsx}'],
    imports: ['@components/utility/**'],
  },
  {
    name: 'primitives',
    files: ['src/components/ui/**/*.{ts,tsx}'],
    imports: ['@ui/**', '@components/ui/**'],
  },
  {
    name: 'patterns',
    files: ['src/components/blocks/**/*.{ts,tsx}'],
    imports: ['@blocks/**', '@components/blocks/**'],
  },
  {
    name: 'feature UI',
    files: ['src/components/features/**/*.{ts,tsx}'],
    imports: ['@features/**', '@components/features/**'],
  },
  {
    name: 'views',
    files: ['src/views/**/*.{ts,tsx}'],
    imports: ['@views/**'],
  },
  {
    name: 'app root',
    files: ['src/providers/global/LayerProvider/**/*.{ts,tsx}', 'src/index.tsx'],
    imports: ['@providers/global/LayerProvider/**'],
  },
]

/**
 * A domain may import itself plus `shared`. Domain lists are read from disk.
 *
 * @type {Partition[]}
 */
const DOMAIN_PARTITIONS = [
  {
    dir: 'src/schemas/features',
    tier: 'foundation',
    aliases: ['@schemas/features'],
    // Accounting primitives every other contract builds on.
    shared: ['customerVendor', 'tags', 'business', 'generalLedger', 'bankTransactions'],
  },
  { dir: 'src/utils/features', tier: 'foundation', aliases: ['@utils/features'], shared: [] },
  {
    dir: 'src/components/features',
    tier: 'feature UI',
    aliases: ['@features', '@components/features'],
    // Reusable scaffolding: report shells, entity pickers, status badges.
    shared: ['reports', 'customerVendor', 'tags', 'customAccounts', 'bookkeeping', 'generalLedger'],
  },
  {
    dir: 'src/hooks/features',
    tier: 'feature hooks',
    aliases: ['@hooks/features'],
    shared: ['forms', 'calendly', 'business'],
  },
  {
    dir: 'src/providers/features',
    tier: 'stores',
    aliases: ['@providers/features'],
    // App-wide singletons; they fetch, so they sit here rather than global/.
    shared: ['business', 'bankAccounts', 'bookkeeping'],
  },
]

// Treated as one boundary.
const DOMAIN_GROUPS = [['bankTransactions', 'categorization']]

/** @type {(dir: string) => string[]} */
const domainsOf = (dir) => {
  // node:fs is untyped under the tsconfig that lints this file.
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
  const entries = /** @type {{ name: string, isDirectory: () => boolean }[]} */ (
    readdirSync(dir, { withFileTypes: true })
  )
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
}

/** @type {(domain: string) => string[]} */
const groupFor = domain => DOMAIN_GROUPS.find(group => group.includes(domain)) ?? [domain]

/** @type {(layer: Layer) => RestrictedPattern[]} */
const tierPatterns = (layer) => {
  const index = LAYERS.indexOf(layer)
  return LAYERS.slice(index + 1).map(higher => ({
    group: higher.imports,
    message: `Import boundary: ${layer.name} may not import ${higher.name}. Dependencies point down the tier stack — move the shared code down to a tier both sides reach, or pass it in at runtime. See AGENTS.md.`,
  }))
}

/** @type {(partition: Partition, domain: string, domains: string[]) => RestrictedPattern[]} */
const domainPatterns = (partition, domain, domains) => {
  const reachable = new Set([...groupFor(domain), ...partition.shared])
  const forbidden = domains.filter(other => !reachable.has(other))
  if (forbidden.length === 0) return []
  return [{
    group: partition.aliases.flatMap(alias => forbidden.map(other => `${alias}/${other}/**`)),
    message: `Import boundary: the ${domain} domain may not import sibling domains. It may reach itself plus ${partition.shared.join(', ') || '(no shared domains)'}. Move the shared code down a tier, or add the target to this partition's shared set in eslint.config.mjs.`,
  }]
}

// One object per zone: flat config replaces rule options rather than merging them,
// so a file must never be matched by two objects setting the same rule.
const boundaryConfigs = LAYERS.flatMap((layer) => {
  const partitions = DOMAIN_PARTITIONS.filter(partition => partition.tier === layer.name)
  const domainZones = partitions.flatMap((partition) => {
    const domains = domainsOf(partition.dir)
    return domains
      .filter(domain => !(partition.skipDomains ?? []).includes(domain))
      .map(domain => ({
        files: [`${partition.dir}/${domain}/**/*.{ts,tsx}`],
        ignores: TEST_FILES,
        rules: {
          '@typescript-eslint/no-restricted-imports': [BOUNDARY_SEVERITY, {
            patterns: [...tierPatterns(layer), ...domainPatterns(partition, domain, domains)],
          }],
        },
      }))
  })

  const patterns = tierPatterns(layer)

  if (patterns.length === 0) return domainZones

  const tierZone = {
    files: layer.files,
    ignores: [
      ...TEST_FILES,
      ...(layer.nested ?? []),
      ...domainZones.flatMap(zone => zone.files),
    ],
    rules: { '@typescript-eslint/no-restricted-imports': [BOUNDARY_SEVERITY, { patterns }] },
  }

  return [tierZone, ...domainZones]
})

// Translation key namespaces. See src/assets/locales/SKILL.md.
// Cross-cutting namespaces every zone may reuse; they carry no owner segment.
const SHARED_NAMESPACES = ['common', 'date', 'upload', 'usStates']

// Roots whose second segment is a feature domain, and which therefore own the
// same-named translation namespace.
const I18N_DOMAIN_ROOTS = ['components', 'hooks', 'providers', 'schemas', 'types', 'utils']

/**
 * Flags a namespaced key literal whose namespace is not one this zone owns. The trailing shape
 * check keeps URLs and other `word:` strings out of it. The owner segment is path-derived, so
 * `npm run i18n:check` enforces that half.
 *
 * @type {(namespaces: string[]) => string}
 */
const foreignKeyPattern = (namespaces) => {
  const allowed = [...namespaces, ...SHARED_NAMESPACES].join('|')
  return `/^(?!(?:${allowed}):)[a-z][A-Za-z]*:[A-Za-z0-9_]+(?:\\.[A-Za-z0-9_]+)*$/`
}

/** @type {(files: string[], namespaces: string[], describe: string) => object} */
const i18nZone = (files, namespaces, describe) => {
  const pattern = foreignKeyPattern(namespaces)
  const message = `Translation keys used here must be ${describe} or a shared namespace (${SHARED_NAMESPACES.join(', ')}). See src/assets/locales/SKILL.md.`
  return {
    files,
    ignores: TEST_FILES,
    rules: {
      'no-restricted-syntax': [BOUNDARY_SEVERITY,
        // t('ns:Owner.category.key', …) and translationKey('ns:…', …)
        { selector: `CallExpression[callee.name=/^(?:t|translationKey)$/][arguments.0.value=${pattern}]`, message },
        // tPlural(t, 'ns:…', …) and tConditional(t, 'ns:…', …)
        { selector: `CallExpression[callee.name=/^(?:tPlural|tConditional)$/][arguments.1.value=${pattern}]`, message },
        // <Trans i18nKey='ns:…' />
        { selector: `JSXAttribute[name.name="i18nKey"][value.value=${pattern}]`, message },
      ],
    },
  }
}

const i18nConfigs = [
  ...I18N_DOMAIN_ROOTS.flatMap(root =>
    domainsOf(`src/${root}/features`).map(domain =>
      i18nZone([`src/${root}/features/${domain}/**/*.{ts,tsx}`], [domain], `${domain}:`),
    ),
  ),
  i18nZone(['src/components/blocks/**/*.{ts,tsx}'], ['blocks'], 'blocks:'),
  i18nZone(['src/components/ui/**/*.{ts,tsx}'], ['ui'], 'ui:'),
  // A view composes several domains, so it may reach any of them alongside 'views:'.
  i18nZone(
    ['src/views/**/*.{ts,tsx}'],
    ['views', ...new Set(I18N_DOMAIN_ROOTS.flatMap(root => domainsOf(`src/${root}/features`)))],
    'views: or a feature domain',
  ),
]

export default tsEslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'vite/**', 'scripts/**', '.vim_backups/**', '.claude/**', '**/*.gen.ts', '.storybook/public/**', 'storybook-static/**', 'consumer-fixtures/**'],
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
            '.storybook/main.ts',
            '.storybook/tags.ts',
            '.storybook/mocks/react-plaid-link.ts',
            '.storybook/mocks/systemDate.ts',
            '.storybook/preview.tsx',
            '.storybook/manager.tsx',
            '.storybook/StorybookLayerProvider.tsx',
            '.storybook/RealBackendBadge.tsx',
            '.storybook/realBackend.ts',
            '.storybook/businessHistory.ts',
            'api/storybook-token.ts',
            'eslint.config.mjs',
            'i18next.config.ts',
            'vite.config.ts',
            'vitest.config.ts',
            'vitest.setup.ts',
            '*.js',
            '*.cjs',
            '*.mjs',
          ],
          // The globs above can legitimately match more than the default cap of 8.
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 20,
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
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: { import: pluginImport },
    settings: { 'import/resolver': { typescript: true, node: true } },
    rules: {
      // Resolves specifiers, so aliased imports match too and must be ignored.
      'import/no-relative-parent-imports': ['error', { ignore: ALIASES.map(alias => `${alias}/`) }],
    },
  },
  {
    // Storybook config and the Vercel functions live outside src, so they can only reach it
    // relatively.
    files: ['.storybook/**/*.{ts,tsx}', 'api/**/*.ts'],
    rules: {
      'import/no-relative-parent-imports': 'off',
    },
  },
  {
    // The self-reference resolves to `dist/`, which the rule reads as a parent import. Reaching the
    // built package is the entire point of these tests.
    files: ['type-tests/**/*.ts'],
    rules: {
      'import/no-relative-parent-imports': 'off',
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
    // The `../*` pattern backs `import/no-relative-parent-imports`, which skips
    // specifiers it cannot resolve.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
      'src/**/*.stories.tsx',
      'src/**/*.storyData.tsx',
      'src/msw/**/*',
      'src/fixtures/**/*',
      'src/testUtils/**/*',
      'src/utils/shared/env/packageVersion.ts',
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['*.css', '*.stories*', '*.storyData*', '@msw/*', '@fixtures/*', '@testUtils/*'],
            message: 'Production source may not import test-only code or stylesheets by path.',
          },
          {
            group: ['../*'],
            message: 'No parent-relative imports — use the most specific path alias.',
          },
        ],
      }],
    },
  },
  {
    // Exempt from the boundary rules, but not from the relative-import rule.
    files: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.stories.tsx',
      'src/**/*.storyData.tsx',
      'src/{msw,fixtures,testUtils}/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../*'],
          message: 'No parent-relative imports — use the most specific path alias.',
        }],
      }],
    },
  },
  {
    files: ['src/msw/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [BOUNDARY_SEVERITY, {
        patterns: [
          {
            group: ['@api/*', '@hooks/*'],
            message: 'MSW handlers load in every vitest run before per-test mocks apply, so importing hook modules breaks unrelated tests. Share schemas via @schemas instead; type-only imports are fine.',
            allowTypeImports: true,
          },
          {
            group: ['@providers/**', '@components/**', '@ui/**', '@blocks/**', '@features/**', '@views/**'],
            message: 'MSW handlers describe the API surface, so they may only reach contracts (@schemas, @internal-types), pure helpers (@utils) and @fixtures.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/fixtures/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [BOUNDARY_SEVERITY, {
        patterns: [{
          group: ['@providers/**', '@hooks/**', '@api/**', '@components/**', '@ui/**', '@blocks/**', '@features/**', '@views/**', '@msw/**', '@testUtils/**'],
          message: 'Fixtures are data, so they may only reach contracts (@schemas, @internal-types) and pure helpers (@utils).',
        }],
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
          // Tier order. Each regex is its own sub-block; only outer arrays get a
          // blank line between them.
          TIER_ALIASES.map(aliasSortGroup),
          TEST_ALIASES.map(aliasSortGroup),
          [
            // Styles
            '.*\\.s?css$',
          ],
        ],
      }],
      'simple-import-sort/exports': 'error',
    },
  },
  ...boundaryConfigs,
  ...i18nConfigs,
)
