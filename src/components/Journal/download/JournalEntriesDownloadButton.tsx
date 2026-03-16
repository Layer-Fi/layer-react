import { useTranslation } from 'react-i18next'

import { useJournalEntriesDownload } from '@hooks/api/businesses/[business-id]/ledger/entries/exports/csv/useJournalEntriesDownload'
import { DownloadButton } from '@components/Button/DownloadButton'
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
  const { t } = useTranslation()
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
        text={t('common:downloadCsv', 'Download CSV')}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
