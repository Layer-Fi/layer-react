import { RetryButton } from '@components/Button/RetryButton'
import DownloadCloud from '@icons/DownloadCloud'
import { ButtonProps, Button, ButtonVariant } from '@components/Button/Button'

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
  variant = iconOnly ? ButtonVariant.secondary : ButtonVariant.tertiary,
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
