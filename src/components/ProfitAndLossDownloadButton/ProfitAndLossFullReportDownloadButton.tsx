import { useContext, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { MoneyFormat } from '../../types'
import { DownloadButton as DownloadButtonComponent } from '../Button'
import { useAuth } from '../../hooks/useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { ProfitAndLossComparisonContext } from '../../contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '../../contexts/ProfitAndLossContext/ProfitAndLossContext'
import type { ProfitAndLossDownloadButtonStringOverrides } from './types'

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
    const getProfitAndLossExcel = Layer.getProfitAndLossExcel(
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
        : await getProfitAndLossExcel()
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
