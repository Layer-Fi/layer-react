import { CloudDownload, Eye, Loader, Trash2 } from 'lucide-react'

import { ROTATING_CLASS_NAME } from '@utils/shared/styles/animationClassNames'
import { createOwnLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Button } from '@ui/Button/Button'
import { LinkButton } from '@ui/Button/LinkButton'
import { Span } from '@ui/Typography/Text'

import './fileThumb.scss'

const legacyClassNames = createOwnLegacyClassNames()({
  'Layer__FileThumb': 'Layer__file-thumb',
  'Layer__FileThumb__Main': 'Layer__file-thumb__main',
  'Layer__FileThumb__Image': 'Layer__file-thumb__img',
  'Layer__FileThumb__Details': 'Layer__file-thumb__details',
  'Layer__FileThumb__Name': 'Layer__file-thumb__details__name',
  'Layer__FileThumb__Date': 'Layer__file-thumb__details__date',
  'Layer__FileThumb__Uploading': 'Layer__file-thumb__details__uploading',
  'Layer__FileThumb__Actions': 'Layer__file-thumb__actions',
  'Layer__FileThumb__RemoveIcon': 'Layer__file-thumb__actions__remove',
  'Layer__FileThumb__DownloadIcon': 'Layer__file-thumb__actions__download',
  'Layer__FileThumb__OpenIcon': 'Layer__file-thumb__actions__open',
  'state:floating': 'Layer__file-thumb--floating',
  'state:floatingActions': 'Layer__file-thumb__actions--floating',
})

type FileThumbProps = {
  url?: string
  type?: string
  floatingActions?: boolean
  uploadPending?: boolean
  deletePending?: boolean
  name?: string
  date?: string
  onDelete?: () => void
  enableOpen?: boolean
  onOpen?: () => void
  enableDownload?: boolean
  error?: string
}

export const FileThumb = ({
  url,
  floatingActions = false,
  uploadPending,
  deletePending,
  name,
  date,
  onDelete,
  enableOpen,
  onOpen,
  enableDownload,
  error,
}: FileThumbProps) => {
  const disabled = uploadPending || deletePending
  const floatingProperties = toDataProperties({ floating: floatingActions })

  return (
    <div
      className={legacyClassNames('Layer__FileThumb', floatingActions && 'state:floating')}
      {...floatingProperties}
    >
      <div className={legacyClassNames('Layer__FileThumb__Main')}>
        <div className={legacyClassNames('Layer__FileThumb__Image')}>
          {url && (
            <img
              src={url}
              alt={name}
              onError={({ currentTarget }) =>
                (currentTarget.style.display = 'none')}
            />
          )}
        </div>
        <div className={legacyClassNames('Layer__FileThumb__Details')}>
          <div className={legacyClassNames('Layer__FileThumb__Name')}>{name}</div>
          {uploadPending || deletePending
            ? (
              <div className={legacyClassNames('Layer__FileThumb__Uploading')}>
                <Span size='sm' status='info'>
                  {deletePending ? 'Deleting...' : 'Uploading'}
                </Span>
                <Loader className={ROTATING_CLASS_NAME} size={11} />
              </div>
            )
            : error
              ? (
                <Span size='sm' status='error'>{error}</Span>
              )
              : (
                <div className={legacyClassNames('Layer__FileThumb__Date')}>{date}</div>
              )}
        </div>
      </div>
      {enableOpen || enableDownload || onDelete
        ? (
          <div
            className={legacyClassNames(
              'Layer__FileThumb__Actions',
              floatingActions && 'state:floatingActions',
            )}
            {...floatingProperties}
          >
            {onDelete && (
              <Button
                variant='ghost'
                icon
                onPress={onDelete}
                isDisabled={disabled}
                aria-label='Delete'
              >
                <Trash2 className={legacyClassNames('Layer__FileThumb__RemoveIcon')} size={18} />
              </Button>
            )}
            {enableDownload && url
              ? (
                <LinkButton
                  variant='ghost'
                  icon
                  href={url}
                  download={name ?? 'receipt'}
                  isDisabled={disabled}
                  aria-label='Download'
                >
                  <CloudDownload className={legacyClassNames('Layer__FileThumb__DownloadIcon')} size={18} />
                </LinkButton>
              )
              : null}
            {onOpen
              ? (
                <Button
                  variant='ghost'
                  icon
                  onPress={onOpen}
                  isDisabled={disabled}
                  aria-label='Open'
                >
                  <Eye className={legacyClassNames('Layer__FileThumb__OpenIcon')} size={18} />
                </Button>
              )
              : null}
            {enableOpen && url && !onOpen
              ? (
                <LinkButton
                  variant='ghost'
                  icon
                  href={url}
                  external
                  isDisabled={disabled}
                  aria-label='Open'
                >
                  <Eye className={legacyClassNames('Layer__FileThumb__OpenIcon')} size={18} />
                </LinkButton>
              )
              : null}
          </div>
        )
        : null}
    </div>
  )
}
