import { ProfitAndLoss } from '../../types'
import { get } from './authenticated_http'

export const getProfitAndLoss = get<{
  data?: ProfitAndLoss
  error?: unknown
}>(
  ({ businessId, startDate, endDate, tagKey, tagValues, reportingBasis }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss?start_date=${
      startDate ? encodeURIComponent(startDate) : ''
    }&end_date=${endDate ? encodeURIComponent(endDate) : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }`,
)
