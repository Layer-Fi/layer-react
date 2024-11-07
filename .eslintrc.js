/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['build/*', 'dist/*', 'bin/*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', '@stylistic', 'unused-imports'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],

    '@stylistic/quotes': ['error', 'single', { avoidEscape: false }],
    '@stylistic/jsx-quotes': ['error', 'prefer-single'],
    '@stylistic/semi': ['error', 'never'],

    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    'react/prop-types': 'off',
  },
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['*.css'],
          },
        ],
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
}
