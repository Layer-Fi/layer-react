import React from 'react'
import { DownloadButton } from '../../Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '../../utility/InvisibleDownload'
import { useCashflowStatementDownload } from './useCashflowStatementDownload'

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
  const { trigger, isMutating, error } = useCashflowStatementDownload({
    startDate,
    endDate,
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
