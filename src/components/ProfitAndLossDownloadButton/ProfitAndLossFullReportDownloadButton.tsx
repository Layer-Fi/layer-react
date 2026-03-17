import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type MoneyFormat } from '@internal-types/general'
import { getProfitAndLossExcel } from '@hooks/legacy/useDownloadProfitAndLoss'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { DownloadButton as DownloadButtonComponent } from '@components/Button/DownloadButton'
import type { ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'

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
  const { t } = useTranslation()
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
      text={stringOverrides?.downloadButtonText || t('common:action.download_label', 'Download')}
      retryText={stringOverrides?.retryButtonText || t('common:action.retry_label', 'Retry')}
    />
  )
}
