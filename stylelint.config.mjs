/** @type {import('stylelint').Config} */
export default {
  plugins: [
    'stylelint-order',
    '@stylistic/stylelint-plugin'
  ],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    '@stylistic/stylelint-config',
  ],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'each',
          'else',
          'extend',
          'for',
          'forward',
          'if',
          'include',
          'mixin',
          'while',
        ],
      },
    ],
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-empty-line-before': [
      'always',
      {
        'except': ['first-nested'],
        'ignore': ['after-comment', 'after-declaration']
      }
    ],
    'custom-property-pattern': '^[a-z0-9-]+$',
    'custom-property-empty-line-before': [
      'always',
      {
        'except': ['first-nested'],
        'ignore': ['after-comment', 'after-custom-property']
      }
    ],

    'length-zero-no-unit': true,
    'no-descending-specificity': null,
    'no-duplicate-selectors': true,

    'selector-class-pattern': null,
    'selector-id-pattern': null,

    'order/properties-order': [
      {
        groupName: 'all',
        properties: [
          'all'
        ],
      },
      {
        groupName: 'box-sizing',
        properties: [
          'box-sizing'
        ],
      },
      {
        groupName: 'positioning',
        properties: [
          'position',
          'z-index',
          'top',
          'right',
          'bottom',
          'left',
          'inset'
        ],
      },
      {
        groupName: 'display',
        properties: [
          'display',
          'visibility'
        ],
      },
      {
        groupName: 'flex',
        properties: [
          'flex',
          'flex-basis',
          'flex-direction',
          'flex-flow',
          'flex-grow',
          'flex-shrink',
          'flex-wrap'
        ],
      },
      {
        groupName: 'grid',
        properties: [
          'grid',
          'grid-area',
          'grid-template',
          'grid-template-areas',
          'grid-template-rows',
          'grid-template-columns',
          'grid-row',
          'grid-row-start',
          'grid-row-end',
          'grid-column',
          'grid-column-start',
          'grid-column-end',
          'grid-auto-rows',
          'grid-auto-columns',
          'grid-auto-flow',
          'grid-gap',
          'grid-row-gap',
          'grid-column-gap',
        ],
      },
      {
        groupName: 'gap',
        properties: [
          'gap',
          'row-gap',
          'column-gap'
        ],
      },
      {
        groupName: 'alignment',
        properties: [
          'align-content',
          'align-items',
          'align-self',
        ],
      },
      {
        groupName: 'justify',
        properties: [
          'justify-content',
          'justify-items',
          'justify-self'
        ],
      },
      {
        groupName: 'overflow',
        properties: [
          'overflow',
          'overflow-x',
          'overflow-y'
        ],
      },
      {
        groupName: 'box-model-sizing',
        properties: [
          'height',
          'block-size',
          'min-height',
          'min-block-size',
          'max-height',
          'max-block-size',
          'width',
          'inline-size',
          'min-width',
          'min-inline-size',
          'max-width',
          'max-inline-size'
        ],
      },
      {
        groupName: 'padding',
        properties: [
          'padding',
          'padding-block',
          'padding-block-start',
          'padding-block-end',
          'padding-inline',
          'padding-inline-start',
          'padding-inline-end',
          'padding-top',
          'padding-right',
          'padding-bottom',
          'padding-left'
        ],
      },
      {
        groupName: 'border-radius',
        properties: [
          'border-radius',
          'border-start-start-radius',
          'border-start-end-radius',
          'border-end-start-radius',
          'border-end-end-radius',
          'border-top-left-radius',
          'border-top-right-radius',
          'border-bottom-left-radius',
          'border-bottom-right-radius'
        ],
      },
      {
        groupName: 'border',
        properties: [
          'border',
          'border-width',
          'border-block',
          'border-inline',
          'border-top',
          'border-right',
          'border-bottom',
          'border-left'
        ],
      },
      {
        groupName: 'effects',
        properties: [
          'box-shadow',
          'outline'
        ],
      },
      {
        groupName: 'margin',
        properties: [
          'margin',
          'margin-block',
          'margin-block-start',
          'margin-block-end',
          'margin-inline',
          'margin-inline-start',
          'margin-inline-end',
          'margin-top',
          'margin-right',
          'margin-bottom',
          'margin-left'
        ],
      },
      {
        groupName: 'background',
        properties: [
          'background',
          'background-color',
          'background-image',
          'background-position',
          'background-repeat',
          'background-size',
          'background-clip',
          'background-origin',
          'background-attachment'
        ],
      },
      {
        groupName: 'cursor',
        properties: [
          'cursor',
          'user-select'
        ],
      },
      {
        groupName: 'typography',
        properties: [
          'font-size',
          'line-height',
          'font-family',
          'font-weight',
          'font-style',
          'text-align',
          'text-transform',
          'word-spacing',
          'color'
        ],
      }
    ],

    '@stylistic/declaration-colon-space-after': 'always-single-line',
    '@stylistic/indentation': 2,
    '@stylistic/max-empty-lines': 1,
    '@stylistic/max-line-length': 170,
    '@stylistic/no-eol-whitespace': true,
    '@stylistic/no-missing-end-of-source-newline': true,
    '@stylistic/string-quotes': 'single',
  },
}
