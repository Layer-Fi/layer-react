import i18next from 'i18next'
export const BALANCE_SHEET_ROWS = [
  {
    name: 'Assets',
    displayName: i18next.t('assets', 'Assets'),
    lineItem: 'assets',
  },
  {
    name: 'LiabilitiesAndEquity',
    displayName: i18next.t('liabilitiesEquity', 'Liabilities & Equity'),
    lineItem: 'liabilities_and_equity',
  },
]
