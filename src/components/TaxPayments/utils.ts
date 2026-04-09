import { type TaxPaymentRow, type TaxPaymentsResponse } from '@schemas/taxEstimates/payments'

export type { TaxPaymentRow }

export interface CommonTaxPaymentsListProps {
  data: TaxPaymentsResponse | undefined
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}
