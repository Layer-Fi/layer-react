import { AlertCircle, FileSpreadsheet, FileText, Image, RotateCw, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getFileExtension, splitFileName } from '@utils/shared/file/fileName'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './fileRow.scss'

export type FileRowStatus = 'idle' | 'uploading' | 'failed'

export type FileRowProps = {
  name: string
  sizeInBytes?: number
  status?: FileRowStatus
  isDisabled?: boolean
  isGrouped?: boolean
  onReplace?: () => void
  onRetry?: () => void
  onRemove?: () => void
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg'])
const SPREADSHEET_EXTENSIONS = new Set(['csv', 'xlsx'])

const FileTypeIcon = ({ extension }: { extension: string }) => {
  if (IMAGE_EXTENSIONS.has(extension)) return <Image size={16} />
  if (SPREADSHEET_EXTENSIONS.has(extension)) return <FileSpreadsheet size={16} />
  return <FileText size={16} />
}

export const FileRow = ({
  name,
  sizeInBytes,
  status = 'idle',
  isDisabled = false,
  isGrouped = false,
  onReplace,
  onRetry,
  onRemove,
}: FileRowProps) => {
  const { t } = useTranslation()
  const { formatFileSize } = useIntlFormatter()

  const extension = getFileExtension(name)
  const { stem, extension: dottedExtension } = splitFileName(name)

  const getMeta = () => {
    if (status === 'uploading') return t('ui:FileRow.state.uploading', 'Uploading…')
    if (status === 'failed') return t('ui:FileRow.error.upload_failed', 'Upload failed. Check your connection.')

    return [
      extension ? extension.toUpperCase() : null,
      sizeInBytes !== undefined ? formatFileSize(sizeInBytes) : null,
    ].filter(part => part !== null).join(' · ')
  }

  const dataProperties = toDataProperties({ status, grouped: isGrouped })

  return (
    <HStack className='Layer__UI__FileRow' {...dataProperties} align='center' gap='sm'>
      <HStack className='Layer__UI__FileRow__Icon' {...dataProperties} align='center' justify='center'>
        {status === 'failed' ? <AlertCircle size={16} /> : <FileTypeIcon extension={extension} />}
      </HStack>
      <VStack className='Layer__UI__FileRow__Text' gap='4xs'>
        <HStack className='Layer__UI__FileRow__Name'>
          <Span ellipsis noWrap>{stem}</Span>
          <Span noWrap className='Layer__UI__FileRow__Extension'>{dottedExtension}</Span>
        </HStack>
        <Span size='sm' variant={status === 'failed' ? undefined : 'subtle'} status={status === 'failed' ? 'error' : undefined} numeric='tabular-nums'>
          {getMeta()}
        </Span>
      </VStack>
      <HStack className='Layer__UI__FileRow__Actions' align='center' gap='3xs'>
        {status === 'failed' && onRetry && (
          <Button variant='ghost' isDisabled={isDisabled} onPress={onRetry}>
            <RotateCw size={14} />
            {t('ui:FileRow.action.retry', 'Retry')}
          </Button>
        )}
        {status === 'idle' && onReplace && (
          <Button variant='ghost' isDisabled={isDisabled} onPress={onReplace}>
            {t('ui:FileRow.action.replace', 'Replace')}
          </Button>
        )}
        {onRemove && (
          <Button
            variant='ghost'
            icon
            isDisabled={isDisabled || status === 'uploading'}
            onPress={onRemove}
            aria-label={t('ui:FileRow.action.remove_file', 'Remove {{fileName}}', { fileName: name })}
          >
            <X size={16} />
          </Button>
        )}
      </HStack>
      {status === 'uploading' && <HStack className='Layer__UI__FileRow__Progress' />}
    </HStack>
  )
}
