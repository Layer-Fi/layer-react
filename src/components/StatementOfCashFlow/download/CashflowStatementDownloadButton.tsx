import { useCashflowStatementDownload } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/exports/csv/useCashflowStatementDownload'
import { DownloadButton } from '@ui/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type CashflowStatementDownloadButtonProps = {
  startDate: Date
  endDate: Date
  icon?: boolean
}

export function CashflowStatementDownloadButton({
  startDate,
  endDate,
  icon,
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
        icon={icon}
        onPress={() => { void trigger() }}
        isPending={isMutating}
        requestFailed={Boolean(error)}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
