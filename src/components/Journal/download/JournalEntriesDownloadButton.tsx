import { useTranslation } from 'react-i18next'

import { useJournalEntriesDownload } from '@hooks/api/businesses/[business-id]/ledger/entries/exports/csv/useJournalEntriesDownload'
import { useLedgerDateRange } from '@providers/DateStoreProvider/LedgerDateStoreProvider'
import { DownloadButton } from '@ui/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type JournalEntriesDownloadButtonProps = {
  /** When true, export the range currently selected in the ledger date store. */
  filterByDateRange?: boolean
  icon?: boolean
}

export function JournalEntriesDownloadButton({
  filterByDateRange,
  icon,
}: JournalEntriesDownloadButtonProps) {
  const { t } = useTranslation()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })
  const { trigger, isMutating, error } = useJournalEntriesDownload({
    startDate: filterByDateRange ? startDate : undefined,
    endDate: filterByDateRange ? endDate : undefined,
    swrOptions: {
      onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
    },
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
