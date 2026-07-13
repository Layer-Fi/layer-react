import { useTranslation } from 'react-i18next'

import { useAccountBalancesDownload } from '@hooks/api/businesses/[business-id]/ledger/balances/exports/csv/useAccountBalancesDownload'
import { DownloadButton } from '@ui/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type AccountBalancesDownloadButtonProps = {
  startDate?: Date
  endDate?: Date
  icon?: boolean
}

export function AccountBalancesDownloadButton({
  startDate,
  endDate,
  icon,
}: AccountBalancesDownloadButtonProps) {
  const { t } = useTranslation()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, isMutating, error } = useAccountBalancesDownload({
    startDate,
    endDate,
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
