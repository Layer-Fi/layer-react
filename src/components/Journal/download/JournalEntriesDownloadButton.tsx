import { DownloadButton } from '@components/Button/DownloadButton'
import { useJournalEntriesDownload } from '@components/Journal/download/useJournalEntriesDownload'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type JournalEntriesDownloadButtonProps = {
  startCutoff?: Date
  endCutoff?: Date
  iconOnly?: boolean
}

export function JournalEntriesDownloadButton({
  startCutoff,
  endCutoff,
  iconOnly,
}: JournalEntriesDownloadButtonProps) {
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const { trigger, isMutating, error } = useJournalEntriesDownload({
    startCutoff,
    endCutoff,
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  return (
    <>
      <DownloadButton
        iconOnly={iconOnly}
        onClick={() => { void trigger() }}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text='Download CSV'
        retryText='Retry'
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
