import type { TaxPaymentQuarter } from '@schemas/taxEstimates/payments'

export type TaxPaymentQuarterWithId = TaxPaymentQuarter & { id: string }

export interface CommonTaxPaymentsListProps {
  data: TaxPaymentQuarterWithId[] | undefined
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}

export const getQuarterLabel = (quarter: number): string => {
  return `Q${quarter}`
}
