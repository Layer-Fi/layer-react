import { DownloadButton } from '@components/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'
import { useCashflowStatementDownload } from '@components/StatementOfCashFlow/download/useCashflowStatementDownload'

type CashflowStatementDownloadButtonProps = {
  startDate: Date
  endDate: Date
  iconOnly?: boolean
}

export function CashflowStatementDownloadButton({
  startDate,
  endDate,
  iconOnly,
}: CashflowStatementDownloadButtonProps) {
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { trigger, isMutating, error } = useCashflowStatementDownload({
    startDate,
    endDate,
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
