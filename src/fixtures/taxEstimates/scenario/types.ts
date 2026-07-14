import { type USStateCode } from '@internal-types/location'
import { type FilingStatus } from '@schemas/taxEstimates/filingStatus'
import { type TaxPaymentRow } from '@schemas/taxEstimates/payments'

export type LineItem = {
  rowKey: string
  label: string
  amount: number
}

export type ScenarioQuarter = {
  quarter: number
  federalOwed: number
  stateOwed: number
  federalPaid: number
  statePaid: number
}

export type TaxScenario = {
  year: number
  filingStatus: FilingStatus
  stateCode: USStateCode
  stateLabel: string
  income: LineItem[]
  deductions: LineItem[]
  quarters: ScenarioQuarter[]
  uncategorized: {
    count: number
    moneyIn: number
    moneyOut: number
    earliestAt: Date | null
    latestAt: Date | null
  }
}

export type QuarterBalance = Omit<TaxPaymentRow, 'rowKey' | 'label' | 'breakdown'>
