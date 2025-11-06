import { DownloadButton } from '@components/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'
import { useBalanceSheetDownload } from '@components/BalanceSheet/download/useBalanceSheetDownload'

type BalanceSheetDownloadButtonProps = {
  effectiveDate: Date
  iconOnly?: boolean
}

export function BalanceSheetDownloadButton({
  effectiveDate,
  iconOnly,
}: BalanceSheetDownloadButtonProps) {
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { trigger, isMutating, error } = useBalanceSheetDownload({
    effectiveDate,
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  return (
    <>
      <DownloadButton
        iconOnly={iconOnly}
        onClick={() => { void trigger() }}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text='Download'
        retryText='Retry'
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
