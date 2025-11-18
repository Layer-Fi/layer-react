import { useContext } from 'react'

import type { S3PresignedUrl } from '@internal-types/general'
import { useProfitAndLossDetailLinesExport } from '@hooks/useProfitAndLoss/useProfitAndLossDetailLinesExport'
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
        text={stringOverrides?.downloadButtonText || 'Download'}
        retryText={stringOverrides?.retryButtonText || 'Retry'}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
