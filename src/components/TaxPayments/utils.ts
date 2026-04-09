import { type TaxPaymentsResponse } from '@schemas/taxEstimates/payments'

export interface CommonTaxPaymentsListProps {
  data: TaxPaymentsResponse | undefined
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}
