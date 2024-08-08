import React from 'react'
import DownloadCloud from '../../icons/DownloadCloud'
import { Button, ButtonVariant } from './Button'
import { RetryButton } from './RetryButton'

interface DownloadButtonProps {
  onClick?: () => void | Promise<void>
  iconOnly?: boolean
  isDownloading?: boolean
  requestFailed?: boolean
  text?: string
  retryText?: string
  errorText?: string
}

export const DownloadButton = ({
  iconOnly,
  onClick,
  isDownloading,
  requestFailed,
  text = 'Download',
  retryText = 'Retry',
  errorText = 'Download failed. Check connection and retry in few seconds.',
}: DownloadButtonProps) => {
  if (requestFailed) {
    return (
      <RetryButton
        onClick={onClick}
        className='Layer__download-retry-btn'
        error={errorText}
        disabled={isDownloading}
        iconOnly={iconOnly}
      >
        {retryText}
      </RetryButton>
    )
  }
  return (
    <Button
      variant={iconOnly ? ButtonVariant.secondary : ButtonVariant.tertiary}
      rightIcon={<DownloadCloud size={12} />}
      onClick={onClick}
      disabled={isDownloading}
      iconAsPrimary={iconOnly}
      iconOnly={iconOnly}
      isProcessing={isDownloading}
    >
      {text}
    </Button>
  )
}
