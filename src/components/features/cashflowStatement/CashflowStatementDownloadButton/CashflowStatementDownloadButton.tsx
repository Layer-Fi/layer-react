import { useGetCashflowStatementDownload } from '@api/businesses/[business-id]/reports/cashflow-statement/exports/csv/get'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'
import { DownloadButton } from '@ui/Button/DownloadButton'

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
  const { trigger, isMutating, isError } = useGetCashflowStatementDownload({
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
