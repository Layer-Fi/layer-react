import { type ReportConfig, ReportControl, type ReportGroup } from '@schemas/reports/reportConfig'

const makeReport = (config: {
  key: string
  reportRoute: string
  displayName: string
  controls: readonly ReportControl[]
  isDefaultReport?: boolean
}): ReportConfig => ({
  baseQueryParameters: {},
  ...config,
})

export const defaultReportGroups: readonly ReportGroup[] = [
  {
    groupType: 'accounting',
    displayName: 'Accounting',
    reports: [
      makeReport({
        key: 'PROFIT_AND_LOSS',
        reportRoute: 'profit-and-loss',
        displayName: 'Profit & Loss',
        controls: [ReportControl.DateRange, ReportControl.GroupBy, ReportControl.ReportingBasis],
        isDefaultReport: true,
      }),
      makeReport({
        key: 'BALANCE_SHEET',
        reportRoute: 'balance-sheet',
        displayName: 'Balance Sheet',
        controls: [ReportControl.Date, ReportControl.ReportingBasis],
      }),
      makeReport({
        key: 'CASHFLOW_STATEMENT',
        reportRoute: 'cashflow-statement',
        displayName: 'Cash Flow Statement',
        controls: [ReportControl.DateRange],
      }),
      makeReport({
        key: 'TRIAL_BALANCE',
        reportRoute: 'trial-balance',
        displayName: 'Trial Balance',
        controls: [ReportControl.Date],
      }),
    ],
  },
  {
    groupType: 'invoice',
    displayName: 'Invoices',
    reports: [
      makeReport({
        key: 'AR_AGING',
        reportRoute: 'ar-aging',
        displayName: 'A/R Aging',
        controls: [ReportControl.Date],
      }),
      makeReport({
        key: 'AP_AGING',
        reportRoute: 'ap-aging',
        displayName: 'A/P Aging',
        controls: [ReportControl.Date],
      }),
    ],
  },
  {
    groupType: 'expenses',
    displayName: 'Expenses',
    reports: [
      makeReport({
        key: 'BUSINESS_EXPENSES',
        reportRoute: 'business-expenses',
        displayName: 'Business Expenses',
        controls: [ReportControl.DateRange, ReportControl.GroupBy],
      }),
      makeReport({
        key: 'PERSONAL_EXPENSES',
        reportRoute: 'personal-expenses',
        displayName: 'Personal Expenses',
        controls: [ReportControl.DateRange],
      }),
    ],
  },
  {
    groupType: 'income',
    displayName: 'Income',
    reports: [
      makeReport({
        key: 'BUSINESS_INCOME',
        reportRoute: 'business-income',
        displayName: 'Business Income',
        controls: [ReportControl.DateRange],
      }),
      makeReport({
        key: 'PERSONAL_INCOME',
        reportRoute: 'personal-income',
        displayName: 'Personal Income',
        controls: [ReportControl.DateRange],
      }),
    ],
  },
  {
    groupType: 'mileage',
    displayName: 'Mileage',
    reports: [
      makeReport({
        key: 'BUSINESS_MILEAGE',
        reportRoute: 'business-mileage',
        displayName: 'Business Mileage',
        controls: [ReportControl.DateRange],
      }),
      makeReport({
        key: 'PERSONAL_MILEAGE',
        reportRoute: 'personal-mileage',
        displayName: 'Personal Mileage',
        controls: [ReportControl.DateRange],
      }),
    ],
  },
  {
    groupType: 'time_tracking',
    displayName: 'Time Tracking',
    reports: [
      makeReport({
        key: 'TIME_TRACKING',
        reportRoute: 'time-tracking',
        displayName: 'Time Tracking',
        controls: [ReportControl.DateRange],
      }),
    ],
  },
  {
    groupType: 'tax',
    displayName: 'Tax',
    reports: [
      makeReport({
        key: 'SCHEDULE_C',
        reportRoute: 'tax/schedule-c',
        displayName: 'Schedule C',
        controls: [ReportControl.Year],
      }),
    ],
  },
]
