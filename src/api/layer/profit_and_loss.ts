import { ProfitAndLoss } from '../../types'
import { get } from './authenticated_http'

export const getProfitAndLoss = get<{
  data?: ProfitAndLoss
  error?: unknown
}>(
  ({ businessId, startDate, endDate }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss?start_date=${
      startDate ? encodeURIComponent(startDate) : ''
    }&end_date=${endDate ? encodeURIComponent(endDate) : ''}`,
)
