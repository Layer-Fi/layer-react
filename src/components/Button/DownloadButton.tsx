import DownloadCloud from '../../icons/DownloadCloud'
import { DeprecatedButton, DeprecatedButtonProps, ButtonVariant } from './Button'
import { RetryButton } from './RetryButton'

interface DownloadButtonProps {
  onClick?: () => void | Promise<void>
  iconOnly?: boolean
  isDownloading?: boolean
  requestFailed?: boolean
  text?: string
  retryText?: string
  errorText?: string
  tooltip?: DeprecatedButtonProps['tooltip']
  variant?: ButtonVariant
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
}: DownloadButtonProps) => {
  if (requestFailed) {
    return (
      <RetryButton
        onClick={() => void onClick?.()}
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
    <DeprecatedButton
      variant={variant}
      rightIcon={<DownloadCloud size={12} />}
      onClick={() => void onClick?.()}
      disabled={isDownloading}
      iconAsPrimary={iconOnly}
      iconOnly={iconOnly}
      isProcessing={isDownloading}
      tooltip={tooltip}
    >
      {text}
    </DeprecatedButton>
  )
}
