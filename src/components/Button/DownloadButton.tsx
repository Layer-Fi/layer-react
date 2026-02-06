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
  text = 'Download',
  retryText = 'Retry',
  errorText = 'Download failed. Check connection and retry in few seconds.',
  variant = ButtonVariant.secondary,
  disabled = false,
}: DownloadButtonProps) => {
  if (requestFailed) {
    return (
      <RetryButton
        onClick={() => void onClick?.()}
        className='Layer__download-retry-btn'
        error={errorText}
        disabled={isDownloading || disabled}
        iconOnly={iconOnly}
      >
        {retryText}
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
      {text}
    </Button>
  )
}
