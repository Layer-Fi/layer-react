/** @type {import('stylelint').Config} */
export default {
  plugins: ['@stylistic/stylelint-plugin'],
  extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],
  rules: {
    'selector-class-pattern': [
      '^(\\.?(Layer__)?(--)?[a-z]([a-z0-9-]+)?(__([a-z0-9]+-?)+)*(--([a-z0-9]+-?)+){0,2})$',
    ],
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
    'length-zero-no-unit': true,
    'custom-property-pattern': '^[a-z0-9-]+$',
    'no-duplicate-selectors': true,
    '@stylistic/indentation': 2,
    '@stylistic/max-empty-lines': 1,
    '@stylistic/no-eol-whitespace': true,
    '@stylistic/no-missing-end-of-source-newline': true,
    '@stylistic/declaration-colon-space-after': 'always',
  },
}
