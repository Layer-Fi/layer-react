import { DownloadButton } from '@components/Button/DownloadButton'
import { useAccountBalancesDownload } from '@components/ChartOfAccounts/download/useAccountBalancesDownload'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type AccountBalancesDownloadButtonProps = {
  startCutoff?: Date
  endCutoff?: Date
  iconOnly?: boolean
}

export function AccountBalancesDownloadButton({
  startCutoff,
  endCutoff,
  iconOnly,
}: AccountBalancesDownloadButtonProps) {
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { trigger, isMutating, error } = useAccountBalancesDownload({
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
