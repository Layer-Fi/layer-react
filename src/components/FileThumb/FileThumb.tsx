import classNames from 'classnames'
import { CloudDownload, Eye, Loader, Trash2 } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { LinkButton } from '@ui/Button/LinkButton'
import { Span } from '@ui/Typography/Text'

import './fileThumb.scss'

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

  return (
    <div
      className={classNames(
        'Layer__file-thumb',
        floatingActions && 'Layer__file-thumb--floating',
      )}
    >
      <div className='Layer__file-thumb__main'>
        <div className='Layer__file-thumb__img'>
          {url && (
            <img
              src={url}
              alt={name}
              onError={({ currentTarget }) =>
                (currentTarget.style.display = 'none')}
            />
          )}
        </div>
        <div className='Layer__file-thumb__details'>
          <div className='Layer__file-thumb__details__name'>{name}</div>
          {uploadPending || deletePending
            ? (
              <div className='Layer__file-thumb__details__uploading'>
                <Span size='sm' status='info'>
                  {deletePending ? 'Deleting...' : 'Uploading'}
                </Span>
                <Loader className='Layer__anim--rotating' size={11} />
              </div>
            )
            : error
              ? (
                <Span size='sm' status='error'>{error}</Span>
              )
              : (
                <div className='Layer__file-thumb__details__date'>{date}</div>
              )}
        </div>
      </div>
      {enableOpen || enableDownload || onDelete
        ? (
          <div
            className={classNames(
              'Layer__file-thumb__actions',
              floatingActions && 'Layer__file-thumb__actions--floating',
            )}
          >
            {onDelete && (
              <Button
                variant='ghost'
                icon
                onPress={onDelete}
                isDisabled={disabled}
                aria-label='Delete'
              >
                <Trash2 className='Layer__file-thumb__actions__remove' size={18} />
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
                  <CloudDownload className='Layer__file-thumb__actions__download' size={18} />
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
                  <Eye className='Layer__file-thumb__actions__open' size={18} />
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
                  <Eye className='Layer__file-thumb__actions__open' size={18} />
                </LinkButton>
              )
              : null}
          </div>
        )
        : null}
    </div>
  )
}
