import { useBalanceSheetDownload } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/exports/excel/useBalanceSheetDownload'
import { DownloadButton } from '@ui/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type BalanceSheetDownloadButtonProps = {
  effectiveDate: Date
  icon?: boolean
}

export function BalanceSheetDownloadButton({
  effectiveDate,
  icon,
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
        icon={icon}
        onPress={() => { void trigger() }}
        isPending={isMutating}
        requestFailed={Boolean(error)}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
