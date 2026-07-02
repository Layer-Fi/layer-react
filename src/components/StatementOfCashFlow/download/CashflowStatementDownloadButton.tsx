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
  const { trigger, isMutating, isError } = useCashflowStatementDownload({
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
        requestFailed={isError}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
