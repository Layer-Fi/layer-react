import { DownloadButton } from '@components/Button/DownloadButton'
import { useUnifiedReportDownload } from '@components/UnifiedReport/download/useUnifiedReportDownload'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

export function UnifiedReportDownloadButton() {
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, isMutating, isError } = useUnifiedReportDownload({
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  return (
    <>
      <DownloadButton
        iconOnly
        onClick={() => { void trigger() }}
        isDownloading={isMutating}
        requestFailed={isError}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
