import React from 'react'
import DownloadCloud from '../../icons/DownloadCloud'
import EyeIcon from '../../icons/Eye'
import LoaderIcon from '../../icons/Loader'
import TrashIcon from '../../icons/Trash'
import { IconButton } from '../Button'
import { Text, TextSize } from '../Typography'

export interface FileThumbProps {
  url?: string
  type?: string
  uploadPending?: boolean
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
  type,
  uploadPending,
  name,
  date,
  onDelete,
  enableOpen,
  onOpen,
  enableDownload,
  error,
}: FileThumbProps) => {
  return (
    <div className='Layer__file-thumb'>
      <div className='Layer__file-thumb__img'>
        {url && (
          <img
            src={url}
            alt={name}
            onError={({ currentTarget }) =>
              (currentTarget.style.display = 'none')
            }
          />
        )}
      </div>
      <div className='Layer__file-thumb__details'>
        <div className='Layer__file-thumb__details__name'>{name}</div>
        {uploadPending ? (
          <div className='Layer__file-thumb__details__uploading'>
            <Text as='span' size={TextSize.sm}>
              Uploading
            </Text>
            <LoaderIcon className='Layer__anim--rotating' size={11} />
          </div>
        ) : error ? (
          <Text
            as='span'
            size={TextSize.sm}
            className='Layer__file-thumb__details__error'
          >
            {error}
          </Text>
        ) : (
          <div className='Layer__file-thumb__details__date'>{date}</div>
        )}
      </div>
      {enableOpen || enableDownload || onDelete ? (
        <div className='Layer__file-thumb__actions'>
          {onDelete && (
            <IconButton
              onClick={() => onDelete}
              active={!uploadPending}
              icon={
                <TrashIcon className='Layer__file-thumb__actions__remove' />
              }
            />
          )}
          {enableDownload && url ? (
            <IconButton
              active={!uploadPending}
              href={url}
              download={name ?? 'receipt'}
              icon={
                <DownloadCloud className='Layer__file-thumb__actions__download' />
              }
            />
          ) : null}
          {onOpen ? (
            <IconButton
              active={!uploadPending}
              icon={<EyeIcon className='Layer__file-thumb__actions__open' />}
              onClick={e => {
                console.log('opening pdf 0')
                onOpen(e as React.MouseEvent<HTMLAnchorElement, MouseEvent>)
              }}
            />
          ) : null}
          {enableOpen && url && !onOpen ? (
            <IconButton
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              active={!uploadPending}
              icon={<EyeIcon className='Layer__file-thumb__actions__open' />}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
