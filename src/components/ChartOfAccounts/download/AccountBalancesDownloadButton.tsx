import React from 'react'
import { DownloadButton } from '../../Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '../../utility/InvisibleDownload'
import { useAccountBalancesDownload } from './useAccountBalancesDownload'

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
  const { trigger, isMutating, error } = useAccountBalancesDownload({
    startCutoff,
    endCutoff,
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  return (
    <>
      <DownloadButton
        iconOnly={iconOnly}
        onClick={() => { trigger() }}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text='Download CSV'
        retryText='Retry'
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
