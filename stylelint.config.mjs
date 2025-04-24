/** @type {import('stylelint').Config} */
export default {
  plugins: [
    '@stylistic/stylelint-plugin'
  ],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    '@stylistic/stylelint-config',
  ],
  rules: {
    'selector-class-pattern': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'mixin',
          'include',
          'extend',
          'if',
          'else',
          'for',
          'each',
          'while',
        ],
      },
    ],
    'declaration-empty-line-before': [
      'always',
      {
        'except': ['first-nested'],
        'ignore': ['after-comment', 'after-declaration']
      }
    ],
    'length-zero-no-unit': true,
    'custom-property-pattern': '^[a-z0-9-]+$',
    'no-duplicate-selectors': true,
    'no-descending-specificity': null,

    '@stylistic/declaration-colon-space-after': 'always-single-line',
    '@stylistic/indentation': 2,
    '@stylistic/max-empty-lines': 1,
    '@stylistic/no-eol-whitespace': true,
    '@stylistic/no-missing-end-of-source-newline': true,
  },
}
