import type { S3PresignedUrl } from '@internal-types/general'
import { get } from '@utils/api/authenticatedHttp'
import { toLocalDateString } from '@utils/time/timeUtils'

type GetProfitAndLossExcelParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
  month?: string
  year?: string
  tagKey?: string
  tagValues?: string
  reportingBasis?: string
  moneyFormat?: string
}

export const getProfitAndLossExcel = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossExcelParams) => {
  const { businessId, startDate, endDate, month, year, tagKey, tagValues, reportingBasis, moneyFormat } = params
  return get<{
    data?: S3PresignedUrl
    error?: unknown
  }>(({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/exports/excel?${
      startDate ? `start_date=${encodeURIComponent(toLocalDateString(startDate))}` : ''
    }${endDate ? `&end_date=${encodeURIComponent(toLocalDateString(endDate))}` : ''}${
      month ? `&month=${month}` : ''
    }${year ? `&year=${year}` : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }${moneyFormat ? `&money_format=${moneyFormat}` : ''}`,
  )(apiUrl, accessToken, { params: { businessId } })
}
