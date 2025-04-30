import { DownloadButton } from '../../Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '../../utility/InvisibleDownload'
import { useJournalEntriesDownload } from './useJournalEntriesDownload'

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
