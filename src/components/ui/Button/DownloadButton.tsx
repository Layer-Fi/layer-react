import { CloudDownload, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'

interface DownloadButtonProps {
  onPress?: ButtonProps['onPress']
  icon?: boolean
  isPending?: boolean
  requestFailed?: boolean
  text?: string
  retryText?: string
  errorText?: string
  tooltip?: ButtonProps['tooltip']
  isDisabled?: boolean
}

export const DownloadButton = ({
  icon,
  onPress,
  isPending,
  requestFailed,
  tooltip,
  text,
  retryText,
  errorText,
  isDisabled = false,
}: DownloadButtonProps) => {
  const { t } = useTranslation()
  const displayText = text ?? t('common:action.download_label', 'Download')
  const displayRetryText = retryText ?? t('common:action.retry_label', 'Retry')
  const displayErrorText = errorText ?? t('common:error.download_failed_check_connection', 'Download failed. Check connection and retry in a few seconds.')

  if (requestFailed) {
    return (
      <Button
        variant='outlined'
        onPress={onPress}
        isDisabled={isPending || isDisabled}
        icon={icon}
        aria-label={icon ? displayRetryText : undefined}
        tooltip={displayErrorText}
      >
        {!icon && displayRetryText}
        <RefreshCcw size={12} />
      </Button>
    )
  }

  return (
    <Button
      variant='outlined'
      onPress={onPress}
      isDisabled={isPending || isDisabled}
      isPending={isPending}
      icon={icon}
      aria-label={icon ? displayText : undefined}
      tooltip={tooltip}
    >
      {!icon && displayText}
      <CloudDownload size={12} />
    </Button>
  )
}
