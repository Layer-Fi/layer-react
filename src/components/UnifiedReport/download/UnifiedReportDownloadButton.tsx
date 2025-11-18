import DownloadCloud from '@icons/DownloadCloud'
import RefreshCcw from '@icons/RefreshCcw'
import { Button } from '@ui/Button/Button'
import { useUnifiedReportDownload } from '@components/UnifiedReport/download/useUnifiedReportDownload'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

export function UnifiedReportDownloadButton() {
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, isMutating, isError } = useUnifiedReportDownload({
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
