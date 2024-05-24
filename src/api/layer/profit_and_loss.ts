import { ProfitAndLoss } from '../../types'
import { ProfitAndLossSummaries } from '../../types/profit_and_loss'
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

export const getProfitAndLossSummaries = get<{
  data?: ProfitAndLossSummaries
  error?: unknown
}>(
  ({
    businessId,
    startYear,
    startMonth,
    endYear,
    endMonth,
    tagKey,
    tagValues,
    reportingBasis,
  }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss-summaries?start_year=${
      startYear ? encodeURIComponent(startYear) : ''
    }&start_month=${
      startMonth ? encodeURIComponent(startMonth) : ''
    }&end_year=${endYear ? encodeURIComponent(endYear) : ''}&end_month=${
      endMonth ? encodeURIComponent(endMonth) : ''
    }${reportingBasis ? `&reporting_basis=${reportingBasis}` : ''}${
      tagKey ? `&tag_key=${tagKey}` : ''
    }${tagValues ? `&tag_values=${tagValues}` : ''}`,
)
