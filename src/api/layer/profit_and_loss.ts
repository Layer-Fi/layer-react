import { ProfitAndLoss } from '../../types'
import { S3PresignedUrl } from '../../types/general'
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
    startDate,
    endDate,
    month,
    year,
    tagKey,
    tagValues,
    reportingBasis,
  }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss-summaries?start_date=${
      startDate ? encodeURIComponent(startDate) : ''
    }&end_date=${endDate ? encodeURIComponent(endDate) : ''}${
      month ? `&month=${month}` : ''
    }${year ? `&year=${year}` : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }`,
)

export const getProfitAndLossCsv = get<{
  data?: S3PresignedUrl
  error?: unknown
}>(
  ({ businessId, startDate, endDate, tagKey, tagValues, reportingBasis }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/exports/csv?start_date=${
      startDate ? encodeURIComponent(startDate) : ''
    }&end_date=${endDate ? encodeURIComponent(endDate) : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }`,
)
