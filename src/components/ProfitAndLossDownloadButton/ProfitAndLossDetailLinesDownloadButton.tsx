import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import type { S3PresignedUrl } from '@internal-types/general'
import { useProfitAndLossDetailLinesExport } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/lines/exports/excel/useProfitAndLossDetailLinesExport'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { DownloadButton } from '@components/Button/DownloadButton'
import type { ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type ProfitAndLossDetailLinesDownloadButtonProps = {
  pnlStructureLineItemName: string
  stringOverrides?: ProfitAndLossDownloadButtonStringOverrides
  iconOnly?: boolean
}

export function ProfitAndLossDetailLinesDownloadButton({
  pnlStructureLineItemName,
  stringOverrides,
  iconOnly,
}: ProfitAndLossDetailLinesDownloadButtonProps) {
  const { t } = useTranslation()
  const { businessId } = useLayerContext()
  const { tagFilter, dateRange } = useContext(ProfitAndLossContext)
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { trigger, isMutating, error } = useProfitAndLossDetailLinesExport({
    businessId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    pnlStructureLineItemName,
    tagFilter,
    onSuccess: (data: S3PresignedUrl) => {
      if (data?.presignedUrl) {
        triggerInvisibleDownload({ url: data.presignedUrl })
      }
    },
  })

  return (
    <>
      <DownloadButton
        iconOnly={iconOnly}
        onClick={() => { void trigger() }}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text={stringOverrides?.downloadButtonText || t('common:action.download_label', 'Download')}
        retryText={stringOverrides?.retryButtonText || t('common:action.retry_label', 'Retry')}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
