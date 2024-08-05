module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
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
  plugins: ['react', '@typescript-eslint', 'prettier', 'import'],
  rules: {
    'prettier/prettier': 'error',
    indent: ['off', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    quotes: ['error', 'single'],
    'react/react-in-jsx-scope': 'off',
    semi: ['error', 'never'],
    'object-curly-spacing': ['error', 'always', { objectsInObjects: true }],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
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
}
