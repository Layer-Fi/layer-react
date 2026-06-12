import classNames from 'classnames'
import { CloudDownload, Eye, Loader, Trash2 } from 'lucide-react'

import { Span } from '@ui/Typography/Text'
import { IconButton } from '@components/Button/IconButton'

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
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
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
              <IconButton
                onClick={onDelete}
                active={!disabled}
                disabled={disabled}
                icon={
                  <Trash2 className='Layer__file-thumb__actions__remove' size={18} />
                }
              />
            )}
            {enableDownload && url
              ? (
                <IconButton
                  active={!disabled}
                  href={url}
                  disabled={disabled}
                  download={name ?? 'receipt'}
                  icon={
                    <CloudDownload className='Layer__file-thumb__actions__download' size={18} />
                  }
                />
              )
              : null}
            {onOpen
              ? (
                <IconButton
                  active={!disabled}
                  icon={<Eye className='Layer__file-thumb__actions__open' size={18} />}
                  disabled={disabled}
                  onClick={(e) => {
                    onOpen(e as React.MouseEvent<HTMLAnchorElement, MouseEvent>)
                  }}
                />
              )
              : null}
            {enableOpen && url && !onOpen
              ? (
                <IconButton
                  href={url}
                  target='_blank'
                  rel='noopener noreferrer'
                  active={!disabled}
                  disabled={disabled}
                  icon={<Eye className='Layer__file-thumb__actions__open' size={18} />}
                />
              )
              : null}
          </div>
        )
        : null}
    </div>
  )
}
