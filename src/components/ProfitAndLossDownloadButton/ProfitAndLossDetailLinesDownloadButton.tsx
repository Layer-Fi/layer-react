import { useContext } from 'react'
import { DownloadButton } from '../Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '../utility/InvisibleDownload'
import { useProfitAndLossDetailLinesExport } from '../../hooks/useProfitAndLoss/useProfitAndLossDetailLinesExport'
import { useLayerContext } from '../../contexts/LayerContext'
import type { S3PresignedUrl } from '../../types/general'
import { ProfitAndLossContext } from '../../contexts/ProfitAndLossContext/ProfitAndLossContext'
import type { ProfitAndLossDownloadButtonStringOverrides } from './types'

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
  const { businessId } = useLayerContext()
  const { tagFilter, dateRange } = useContext(ProfitAndLossContext)
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

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
        text={stringOverrides?.downloadButtonText || 'Download'}
        retryText={stringOverrides?.retryButtonText || 'Retry'}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
