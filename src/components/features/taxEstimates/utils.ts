import { type TaxPaymentsResponse } from '@schemas/features/taxEstimates/payments'

export interface CommonTaxPaymentsListProps {
  data: TaxPaymentsResponse['data'] | undefined
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}
