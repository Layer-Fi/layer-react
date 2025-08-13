import { useContext } from 'react'
import { DownloadButton } from '../Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '../utility/InvisibleDownload'
import { useProfitAndLossDetailLinesExport } from '../../hooks/useProfitAndLoss/useProfitAndLossDetailLinesExport'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { useLayerContext } from '../../contexts/LayerContext'

type ProfitAndLossDetailLinesDownloadButtonProps = {
  pnlStructureLineItemName: string
  iconOnly?: boolean
}

export function ProfitAndLossDetailLinesDownloadButton({
  pnlStructureLineItemName,
  iconOnly,
}: ProfitAndLossDetailLinesDownloadButtonProps) {
  const { businessId } = useLayerContext()
  const { tagFilter, dateRange } = useContext(ProfitAndLoss.Context)
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  
  const { trigger, isMutating, error } = useProfitAndLossDetailLinesExport({
    businessId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    pnlStructureLineItemName,
    tagFilter,
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  return (
    <>
      <DownloadButton
        iconOnly={iconOnly}
        onClick={() => { trigger() }}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text='Download'
        retryText='Retry'
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}