import { translationKey } from '@utils/i18n/translationKey'

export const BALANCE_SHEET_ROWS_CONFIG = [
  {
    name: 'Assets',
    lineItem: 'assets',
    ...translationKey('reports:label.assets', 'Assets'),
  },
  {
    name: 'LiabilitiesAndEquity',
    lineItem: 'liabilities_and_equity',
    ...translationKey('reports:label.liabilities_equity', 'Liabilities & Equity'),
  },
] as const
