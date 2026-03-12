import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

import DownloadCloud from '@icons/DownloadCloud'
import { Button, type ButtonProps, ButtonVariant } from '@components/Button/Button'
import { RetryButton } from '@components/Button/RetryButton'

interface DownloadButtonProps {
  onClick?: () => void | Promise<void>
  iconOnly?: boolean
  isDownloading?: boolean
  requestFailed?: boolean
  text?: string
  retryText?: string
  errorText?: string
  tooltip?: ButtonProps['tooltip']
  variant?: ButtonVariant
  disabled?: boolean
}

export const DownloadButton = ({
  iconOnly,
  onClick,
  isDownloading,
  requestFailed,
  tooltip,
  text,
  retryText,
  errorText = i18next.t('downloadFailedCheckConnectionAndRetryInFewSeconds', 'Download failed. Check connection and retry in few seconds.'),
  variant = ButtonVariant.secondary,
  disabled = false,
}: DownloadButtonProps) => {
  const { t } = useTranslation()
  const displayText = text ?? t('download', 'Download')
  const displayRetryText = retryText ?? t('retry', 'Retry')

  if (requestFailed) {
    return (
      <RetryButton
        onClick={() => void onClick?.()}
        className='Layer__download-retry-btn'
        error={errorText}
        disabled={isDownloading || disabled}
        iconOnly={iconOnly}
      >
        {displayRetryText}
      </RetryButton>
    )
  }
  return (
    <Button
      variant={variant}
      rightIcon={<DownloadCloud size={12} />}
      onClick={() => void onClick?.()}
      disabled={isDownloading || disabled}
      iconAsPrimary={iconOnly}
      iconOnly={iconOnly}
      isProcessing={isDownloading}
      tooltip={tooltip}
    >
      {displayText}
    </Button>
  )
}
