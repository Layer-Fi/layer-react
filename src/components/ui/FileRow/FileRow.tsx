import { FileSpreadsheet, FileText, Image, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getFileExtension } from '@utils/shared/file/fileName'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './fileRow.scss'

export type FileRowProps = {
  name: string
  sizeInBytes?: number
  isUploading?: boolean
  isDisabled?: boolean
  onReplace?: () => void
  onRemove?: () => void
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'])
const SPREADSHEET_EXTENSIONS = new Set(['csv', 'xls', 'xlsx'])

const FileTypeIcon = ({ extension }: { extension: string }) => {
  if (IMAGE_EXTENSIONS.has(extension)) return <Image size={16} />
  if (SPREADSHEET_EXTENSIONS.has(extension)) return <FileSpreadsheet size={16} />
  return <FileText size={16} />
}

export const FileRow = ({
  name,
  sizeInBytes,
  isUploading = false,
  isDisabled = false,
  onReplace,
  onRemove,
}: FileRowProps) => {
  const { t } = useTranslation()
  const { formatFileSize } = useIntlFormatter()

  const extension = getFileExtension(name)

  const meta = isUploading
    ? t('ui:FileRow.state.uploading', 'Uploading…')
    : [extension ? extension.toUpperCase() : null, sizeInBytes !== undefined ? formatFileSize(sizeInBytes) : null]
      .filter(part => part !== null)
      .join(' · ')

  return (
    <HStack className='Layer__UI__FileRow' pi='xs' pb='xs' align='center' gap='sm'>
      <HStack className='Layer__UI__FileRow__Icon' align='center' justify='center'>
        <FileTypeIcon extension={extension} />
      </HStack>
      <VStack className='Layer__UI__FileRow__Text' fluid gap='4xs'>
        <Span ellipsis noWrap>{name}</Span>
        <Span size='sm' variant='subtle' numeric='tabular-nums'>{meta}</Span>
      </VStack>
      <HStack align='center' gap='3xs'>
        {onReplace && (
          <Button variant='ghost' isDisabled={isDisabled} onPress={onReplace}>
            {t('ui:FileRow.action.replace', 'Replace')}
          </Button>
        )}
        {onRemove && (
          <Button
            variant='ghost'
            icon
            isDisabled={isDisabled}
            onPress={onRemove}
            aria-label={t('ui:FileRow.action.remove_file', 'Remove {{fileName}}', { fileName: name })}
          >
            <X size={16} />
          </Button>
        )}
      </HStack>
      {isUploading && <HStack className='Layer__UI__FileRow__Progress' />}
    </HStack>
  )
}
