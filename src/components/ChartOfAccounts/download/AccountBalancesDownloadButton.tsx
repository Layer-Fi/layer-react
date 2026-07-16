import { useTranslation } from 'react-i18next'

import { useAccountBalancesDownload } from '@hooks/api/businesses/[business-id]/ledger/balances/exports/csv/useAccountBalancesDownload'
import { useLedgerDateRange } from '@providers/DateStoreProvider/LedgerDateStoreProvider'
import { DownloadButton } from '@ui/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type AccountBalancesDownloadButtonProps = {
  /** When true, export the range currently selected in the ledger date store. */
  filterByDateRange?: boolean
  icon?: boolean
}

export function AccountBalancesDownloadButton({
  filterByDateRange,
  icon,
}: AccountBalancesDownloadButtonProps) {
  const { t } = useTranslation()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })

  const { trigger, isMutating, error } = useAccountBalancesDownload({
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
