import { DownloadButton } from '../../Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '../../utility/InvisibleDownload'
import { useBalanceSheetDownload } from './useBalanceSheetDownload'

type BalanceSheetDownloadButtonProps = {
  effectiveDate: Date
  iconOnly?: boolean
}

export function BalanceSheetDownloadButton({
  effectiveDate,
  iconOnly,
}: BalanceSheetDownloadButtonProps) {
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const { trigger, isMutating, error } = useBalanceSheetDownload({
    effectiveDate,
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  return (
    <>
      <DownloadButton
        iconOnly={iconOnly}
        onClick={() => { trigger() }}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text='Download'
        retryText='Retry'
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
