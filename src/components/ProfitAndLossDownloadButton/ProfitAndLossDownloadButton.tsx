import React, { useContext, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { useProfitAndLossComparison } from '../../hooks/useProfitAndLossComparison'
import { MoneyFormat } from '../../types'
import { View as ViewType } from '../../types/general'
import { DownloadButton as DownloadButtonComponent } from '../Button'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossCompareOptionsProps } from '../ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'

type ViewBreakpoint = ViewType | undefined

export interface PnLDownloadButtonStringOverrides {
  downloadButtonText?: string
  retryButtonText?: string
}

export interface ProfitAndLossDownloadButtonProps {
  stringOverrides?: PnLDownloadButtonStringOverrides
  comparisonConfig?: ProfitAndLossCompareOptionsProps
  moneyFormat?: MoneyFormat
  view: ViewBreakpoint
}

export const ProfitAndLossDownloadButton = ({
  stringOverrides,
  comparisonConfig,
  moneyFormat,
  view,
}: ProfitAndLossDownloadButtonProps) => {
  const { dateRange } = useContext(ProfitAndLoss.Context)
  const { getProfitAndLossComparisonCsv } = useContext(
    ProfitAndLoss.ComparisonContext,
  )
  const { auth, businessId, apiUrl } = useLayerContext()
  const [requestFailed, setRequestFailed] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleClick = async () => {
    setIsDownloading(true)
    const month = (dateRange.startDate.getMonth() + 1).toString()
    const year = dateRange.startDate.getFullYear().toString()
    const getProfitAndLossCsv = Layer.getProfitAndLossCsv(
      apiUrl,
      auth.access_token,
      {
        params: {
          businessId: businessId,
          year: year,
          month: month,
          moneyFormat: moneyFormat,
        },
      },
    )
    try {
      const result = comparisonConfig
        ? await getProfitAndLossComparisonCsv(dateRange, moneyFormat)
        : await getProfitAndLossCsv()
      if (result?.data?.presignedUrl) {
        window.location.href = result.data.presignedUrl
        setRequestFailed(false)
      } else {
        setRequestFailed(true)
      }
    } catch (e) {
      setRequestFailed(true)
    } finally {
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
