import { translationKey } from '@utils/i18n/translationKey'

export const BALANCE_SHEET_ROWS_CONFIG = [
  {
    name: 'Assets',
    lineItem: 'assets',
    ...translationKey('reports.assets', 'Assets'),
  },
  {
    name: 'LiabilitiesAndEquity',
    lineItem: 'liabilities_and_equity',
    ...translationKey('reports.liabilitiesEquity', 'Liabilities & Equity'),
  },
] as const
