import i18next from 'i18next'
export const STATEMENT_OF_CASH_FLOW_ROWS = [
  {
    name: 'OperatingActivities',
    displayName: i18next.t('operatingActivities', 'Operating Activities'),
    lineItem: 'operating_activities',
    type: 'line_item',
    summarize: true,
  },
  {
    name: 'InvestingActivities',
    displayName: i18next.t('investingActivities', 'Investing Activities'),
    lineItem: 'investing_activities',
    type: 'line_item',
    summarize: true,
  },
  {
    name: 'FinancingActivities',
    displayName: i18next.t('financingActivities', 'Financing Activities'),
    lineItem: 'financing_activities',
    type: 'line_item',
    summarize: true,
  },
  {
    name: 'PeriodNetCashIncrease',
    displayName: i18next.t('netCashIncreaseForPeriod', 'Net Cash Increase For Period'),
    lineItem: 'period_net_cash_increase',
    type: 'summary_value',
    summarize: false,
  },
  {
    name: 'CashAtBeginningOfPeriod',
    displayName: i18next.t('cashAtBeginningOfPeriod', 'Cash at Beginning of Period'),
    lineItem: 'cash_at_start_of_period',
    type: 'summary_value',
    summarize: false,
  },
  {
    name: 'CashAtEndOfPeriod',
    displayName: i18next.t('cashAtEndOfPeriod', 'Cash at End of Period'),
    lineItem: 'cash_at_end_of_period',
    type: 'summary_value',
    summarize: false,
  },
]

export const ADJUSTMENTS_ROW_NAME = i18next.t('adjustmentsToNetIncome', 'Adjustments to Net Income')
