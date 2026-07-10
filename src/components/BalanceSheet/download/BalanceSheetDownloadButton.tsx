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
  const { trigger, isMutating, isError } = useBalanceSheetDownload({
    effectiveDate,
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
