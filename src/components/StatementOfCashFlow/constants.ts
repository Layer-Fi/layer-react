import { translationKey } from '@utils/i18n/translationKey'

export const STATEMENT_OF_CASH_FLOW_ROWS_CONFIG = [
  {
    name: 'OperatingActivities',
    lineItem: 'operating_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('reports:operatingActivities', 'Operating Activities'),
  },
  {
    name: 'InvestingActivities',
    lineItem: 'investing_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('reports:investingActivities', 'Investing Activities'),
  },
  {
    name: 'FinancingActivities',
    lineItem: 'financing_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('reports:financingActivities', 'Financing Activities'),
  },
  {
    name: 'PeriodNetCashIncrease',
    lineItem: 'period_net_cash_increase',
    type: 'summary_value',
    summarize: false,
    ...translationKey('reports:netCashIncreaseForPeriod', 'Net Cash Increase For Period'),
  },
  {
    name: 'CashAtBeginningOfPeriod',
    lineItem: 'cash_at_start_of_period',
    type: 'summary_value',
    summarize: false,
    ...translationKey('reports:cashAtBeginningOfPeriod', 'Cash at Beginning of Period'),
  },
  {
    name: 'CashAtEndOfPeriod',
    lineItem: 'cash_at_end_of_period',
    type: 'summary_value',
    summarize: false,
    ...translationKey('reports:cashAtEndOfPeriod', 'Cash at End of Period'),
  },
] as const

export const ADJUSTMENTS_ROW_I18N = translationKey('reports:adjustmentsToNetIncome', 'Adjustments to Net Income')
