import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type MoneyFormat } from '@internal-types/general'
import { getProfitAndLossExcel } from '@hooks/legacy/useDownloadProfitAndLoss'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { DownloadButton as DownloadButtonComponent } from '@ui/Button/DownloadButton'
import type { ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'

export interface ProfitAndLossReportDownloadButtonProps {
  stringOverrides?: ProfitAndLossDownloadButtonStringOverrides
  moneyFormat?: MoneyFormat
  icon?: boolean
}

export const ProfitAndLossFullReportDownloadButton = ({
  stringOverrides,
  moneyFormat,
  icon,
}: ProfitAndLossReportDownloadButtonProps) => {
  const { t } = useTranslation()
  const { dateRange, tagFilter } = useContext(ProfitAndLossContext)

  const { businessId, auth } = useBuildKeyInputs()

  const [requestFailed, setRequestFailed] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const tagKey = tagFilter?.key && tagFilter.values.length > 0
    ? tagFilter?.key
    : undefined

  const tagValues = tagFilter?.key && tagFilter.values.length > 0
    ? tagFilter?.values.join(',')
    : undefined

  const handleClick = async () => {
    if (!auth) return
    setIsDownloading(true)
    const getProfitAndLossExcelCall = getProfitAndLossExcel(
      auth.apiUrl,
      auth.access_token,
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
      const result = await getProfitAndLossExcelCall()
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
      icon={icon}
      onPress={() => { void handleClick() }}
      isPending={isDownloading}
      requestFailed={requestFailed}
      text={stringOverrides?.downloadButtonText || t('common:action.download_label', 'Download')}
      retryText={stringOverrides?.retryButtonText || t('common:action.retry_label', 'Retry')}
    />
  )
}
