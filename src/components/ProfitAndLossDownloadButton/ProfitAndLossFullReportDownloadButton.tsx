import { useContext, useState } from 'react'

import type { S3PresignedUrl } from '@internal-types/general'
import { type MoneyFormat } from '@internal-types/general'
import { get } from '@utils/api/authenticatedHttp'
import { toLocalDateString } from '@utils/time/timeUtils'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { DownloadButton as DownloadButtonComponent } from '@components/Button/DownloadButton'
import type { ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'

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

const getProfitAndLossExcel = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossExcelParams) => {
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

export interface ProfitAndLossReportDownloadButtonProps {
  stringOverrides?: ProfitAndLossDownloadButtonStringOverrides
  moneyFormat?: MoneyFormat
  iconOnly?: boolean
}

export const ProfitAndLossFullReportDownloadButton = ({
  stringOverrides,
  moneyFormat,
  iconOnly,
}: ProfitAndLossReportDownloadButtonProps) => {
  const { dateRange, tagFilter } = useContext(ProfitAndLossContext)
  const { getProfitAndLossComparisonCsv, comparisonConfig } = useContext(
    ProfitAndLossComparisonContext,
  )

  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [requestFailed, setRequestFailed] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const tagKey = tagFilter?.key && tagFilter.values.length > 0
    ? tagFilter?.key
    : undefined

  const tagValues = tagFilter?.key && tagFilter.values.length > 0
    ? tagFilter?.values.join(',')
    : undefined

  const handleClick = async () => {
    setIsDownloading(true)
    const getProfitAndLossExcelCall = getProfitAndLossExcel(
      apiUrl,
      auth?.access_token,
      {
        businessId,
        moneyFormat,
        tagKey,
        tagValues,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    )
    try {
      const result = comparisonConfig
        ? await getProfitAndLossComparisonCsv(dateRange, moneyFormat)
        : await getProfitAndLossExcelCall()
      if (result?.data?.presignedUrl) {
        window.location.href = result.data.presignedUrl
        setRequestFailed(false)
      }
      else {
        setRequestFailed(true)
      }
    }
    catch (_e) {
      setRequestFailed(true)
    }
    finally {
      setIsDownloading(false)
    }
  }

  return (
    <DownloadButtonComponent
      iconOnly={iconOnly}
      onClick={handleClick}
      isDownloading={isDownloading}
      requestFailed={requestFailed}
      text={stringOverrides?.downloadButtonText || 'Download'}
      retryText={stringOverrides?.retryButtonText || 'Retry'}
    />
  )
}
