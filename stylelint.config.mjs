export default {
  // Define the files to lint
  files: ['src/**/*.scss', 'src/**/*.css'],

  plugins: ['@stylistic/stylelint-plugin'],

  // Extend the standard and SCSS configurations
  extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],

  // Add custom rules
  rules: {
    // Class names
    'selector-class-pattern': [
      '^(\\.?(Layer__)?(--)?[a-z]([a-z0-9-]+)?(__([a-z0-9]+-?)+)*(--([a-z0-9]+-?)+){0,2})$',
    ],

    // Disallow unknown at-rules
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

    // Disallow units for zero values
    'length-zero-no-unit': true,

    // Require a specific naming pattern for custom properties
    'custom-property-pattern': '^[a-z0-9-]+$',

    // Prohibit duplicate selectors
    'no-duplicate-selectors': true,

    // Indentation
    '@stylistic/indentation': 2,

    '@stylistic/max-empty-lines': 1,

    '@stylistic/no-eol-whitespace': true,

    '@stylistic/no-missing-end-of-source-newline': true,

    // Require a space after colon in declarations
    '@stylistic/declaration-colon-space-after': 'always',
  },
}
