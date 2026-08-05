import { translationKey } from '@utils/shared/i18n/translationKey'

export const BALANCE_SHEET_ROWS_CONFIG = [
  {
    name: 'Assets',
    lineItem: 'assets',
    ...translationKey('balanceSheet:BalanceSheet.constants.label.assets', 'Assets'),
  },
  {
    name: 'LiabilitiesAndEquity',
    lineItem: 'liabilities_and_equity',
    ...translationKey('balanceSheet:BalanceSheet.constants.label.liabilities_equity', 'Liabilities & Equity'),
  },
] as const
