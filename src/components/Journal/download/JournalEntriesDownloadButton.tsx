import { useTranslation } from 'react-i18next'

import { useJournalEntriesDownload } from '@hooks/api/businesses/[business-id]/ledger/entries/exports/csv/useJournalEntriesDownload'
import { DownloadButton } from '@ui/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type JournalEntriesDownloadButtonProps = {
  startCutoff?: Date
  endCutoff?: Date
  icon?: boolean
}

export function JournalEntriesDownloadButton({
  startCutoff,
  endCutoff,
  icon,
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
        icon={icon}
        onPress={() => { void trigger() }}
        isPending={isMutating}
        requestFailed={Boolean(error)}
        text={t('common:action.download_csv', 'Download CSV')}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
