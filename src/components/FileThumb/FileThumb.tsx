import React from 'react'
import DownloadCloud from '../../icons/DownloadCloud'
import EyeIcon from '../../icons/Eye'
import LoaderIcon from '../../icons/Loader'
import TrashIcon from '../../icons/Trash'
import { IconButton } from '../Button'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

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
                <Text as='span' size={TextSize.sm}>
                  {deletePending ? 'Deleting...' : 'Uploading'}
                </Text>
                <LoaderIcon className='Layer__anim--rotating' size={11} />
              </div>
            )
            : error
              ? (
                <Text
                  as='span'
                  size={TextSize.sm}
                  className='Layer__file-thumb__details__error'
                >
                  {error}
                </Text>
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
                  <TrashIcon className='Layer__file-thumb__actions__remove' />
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
                    <DownloadCloud className='Layer__file-thumb__actions__download' />
                  }
                />
              )
              : null}
            {onOpen
              ? (
                <IconButton
                  active={!disabled}
                  icon={<EyeIcon className='Layer__file-thumb__actions__open' />}
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
                  icon={<EyeIcon className='Layer__file-thumb__actions__open' />}
                />
              )
              : null}
          </div>
        )
        : null}
    </div>
  )
}
