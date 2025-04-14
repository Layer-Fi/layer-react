import { useContext, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { MoneyFormat } from '../../types'
import { View as ViewType } from '../../types/general'
import { DownloadButton as DownloadButtonComponent } from '../Button'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { useAuth } from '../../hooks/useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'

type ViewBreakpoint = ViewType | undefined

export interface PnLDownloadButtonStringOverrides {
  downloadButtonText?: string
  retryButtonText?: string
}

export interface ProfitAndLossDownloadButtonProps {
  stringOverrides?: PnLDownloadButtonStringOverrides
  useComparisonPnl?: boolean
  moneyFormat?: MoneyFormat
  view: ViewBreakpoint
}

export const ProfitAndLossDownloadButton = ({
  stringOverrides,
  useComparisonPnl = false,
  moneyFormat,
  view,
}: ProfitAndLossDownloadButtonProps) => {
  const { dateRange, tagFilter } = useContext(ProfitAndLoss.Context)
  const { getProfitAndLossComparisonCsv } = useContext(
    ProfitAndLoss.ComparisonContext,
  )

  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [requestFailed, setRequestFailed] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleClick = async () => {
    setIsDownloading(true)
    const getProfitAndLossExcel = Layer.getProfitAndLossExcel(
      apiUrl,
      auth?.access_token,
      {
        businessId: businessId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        moneyFormat: moneyFormat,
        tagKey:
          tagFilter?.key && tagFilter.values.length > 0
            ? tagFilter?.key
            : undefined,
        tagValues:
          tagFilter?.key && tagFilter.values.length > 0
            ? tagFilter?.values.join(',')
            : undefined,
      },
    )
    try {
      const result = useComparisonPnl
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
      iconOnly={view === 'mobile'}
      onClick={handleClick}
      isDownloading={isDownloading}
      requestFailed={requestFailed}
      text={stringOverrides?.downloadButtonText || 'Download'}
      retryText={stringOverrides?.retryButtonText || 'Retry'}
    />
  )
}
