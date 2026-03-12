export const getBalanceSheetRows = (t: (key: string, defaultValue: string) => string) => [
  {
    name: 'Assets',
    displayName: t('assets', 'Assets'),
    lineItem: 'assets',
  },
  {
    name: 'LiabilitiesAndEquity',
    displayName: t('liabilitiesEquity', 'Liabilities & Equity'),
    lineItem: 'liabilities_and_equity',
  },
]
