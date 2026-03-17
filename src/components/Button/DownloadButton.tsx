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
  errorText,
  variant = ButtonVariant.secondary,
  disabled = false,
}: DownloadButtonProps) => {
  const { t } = useTranslation()
  const displayText = text ?? t('common:action.download_label', 'Download')
  const displayRetryText = retryText ?? t('common:action.retry_label', 'Retry')
  const displayErrorText = errorText ?? t('common:error.download_failed_check_connection', 'Download failed. Check connection and retry in a few seconds.')

  if (requestFailed) {
    return (
      <RetryButton
        onClick={() => void onClick?.()}
        className='Layer__download-retry-btn'
        error={displayErrorText}
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
