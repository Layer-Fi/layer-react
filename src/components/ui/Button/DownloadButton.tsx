import { CloudDownload, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'

interface DownloadButtonProps {
  onClick?: () => void | Promise<void>
  iconOnly?: boolean
  isDownloading?: boolean
  requestFailed?: boolean
  text?: string
  retryText?: string
  errorText?: string
  tooltip?: ButtonProps['tooltip']
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
  disabled = false,
}: DownloadButtonProps) => {
  const { t } = useTranslation()
  const displayText = text ?? t('common:action.download_label', 'Download')
  const displayRetryText = retryText ?? t('common:action.retry_label', 'Retry')
  const displayErrorText = errorText ?? t('common:error.download_failed_check_connection', 'Download failed. Check connection and retry in a few seconds.')

  if (requestFailed) {
    return (
      <Button
        variant='outlined'
        onPress={() => void onClick?.()}
        isDisabled={isDownloading || disabled}
        icon={iconOnly}
        aria-label={iconOnly ? displayRetryText : undefined}
        tooltip={displayErrorText}
      >
        {!iconOnly && displayRetryText}
        <RefreshCcw size={12} />
      </Button>
    )
  }

  return (
    <Button
      variant='outlined'
      onPress={() => void onClick?.()}
      isDisabled={isDownloading || disabled}
      isPending={isDownloading}
      icon={iconOnly}
      aria-label={iconOnly ? displayText : undefined}
      tooltip={tooltip}
    >
      {!iconOnly && displayText}
      <CloudDownload size={12} />
    </Button>
  )
}
