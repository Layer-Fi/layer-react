import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import DownloadCloud from '@icons/DownloadCloud'
import RefreshCcw from '@icons/RefreshCcw'
import { Button } from '@ui/Button/Button'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'
import { useUnifiedReportExcel } from '@features/reports/api/useUnifiedReportExcel'

type UnifiedReportDownloadButtonProps = {
  dateSelectionMode: DateSelectionMode
}

export function UnifiedReportDownloadButton({ dateSelectionMode }: UnifiedReportDownloadButtonProps) {
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, isMutating, isError } = useUnifiedReportExcel({
    dateSelectionMode,
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  return (
    <>
      <Button
        variant='outlined'
        onPress={() => { void trigger() }}
        isPending={isMutating}
        isDisabled={isMutating}
      >
        {isError ? 'Retry' : 'Download'}
        {isError ? <RefreshCcw size={12} /> : <DownloadCloud size={16} /> }
      </Button>
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
