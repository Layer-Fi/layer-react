import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { type DropZonePromptProps } from '@ui/DropZone/DropZonePrompt'
import { type DropZoneRejection } from '@ui/DropZone/dropZoneValidation'

type FileUploadMessagesOptions = {
  accept: ReadonlyArray<string>
  multiple: boolean
  maxFileSizeInBytes?: number
  heldCount: number
  fileLimit?: number
  /** How many more files fit; undefined when a multiple field has no limit. */
  remaining?: number
}

export const useFileUploadMessages = ({ accept, multiple, maxFileSizeInBytes, heldCount, fileLimit, remaining }: FileUploadMessagesOptions) => {
  const { t } = useTranslation()
  const { formatList, formatNumber, formatFileSize } = useIntlFormatter()
  const { isMobile } = useSizeClass()

  const fileTypes = accept.length > 0
    ? formatList(accept.map(extension => extension.toUpperCase()), { type: 'disjunction' })
    : null

  const getWrongTypeMessage = () => (fileTypes === null
    ? null
    : t('blocks:Form.useFileUploadMessages.error.files_not_added', 'Some files couldn’t be added. Upload a {{fileTypes}} file instead.', { fileTypes }))

  const getTooLargeMessage = (tooLarge: ReadonlyArray<File>) => {
    const [first] = tooLarge
    if (!first || maxFileSizeInBytes === undefined) return null

    return tPlural(t, 'blocks:Form.useFileUploadMessages.error.file_too_large', {
      count: tooLarge.length,
      fileName: first.name,
      fileSize: formatFileSize(first.size),
      maxSize: formatFileSize(maxFileSizeInBytes),
      one: '{{fileName}} is {{fileSize}}. Files must be under {{maxSize}}.',
      other: 'Some files are too large. Files must be under {{maxSize}}.',
    })
  }

  const getOverLimitMessage = () => {
    if (fileLimit === undefined) return null
    if (remaining !== undefined && remaining < fileLimit) {
      return tPlural(t, 'blocks:Form.useFileUploadMessages.error.over_remaining_capacity', {
        count: remaining,
        displayCount: formatNumber(remaining),
        one: 'You can add {{displayCount}} more file.',
        other: 'You can add {{displayCount}} more files.',
      })
    }
    return tPlural(t, 'blocks:Form.useFileUploadMessages.error.too_many_files', {
      count: fileLimit,
      displayCount: formatNumber(fileLimit),
      one: 'Upload {{displayCount}} file at a time.',
      other: 'Upload up to {{displayCount}} files at a time.',
    })
  }

  const getRejectionMessage = (rejections: ReadonlyArray<DropZoneRejection>) => {
    const reasons = new Set(rejections.map(({ reason }) => reason))
    const tooLarge = rejections.filter(({ reason }) => reason === 'size').map(({ file }) => file)

    const messages = [
      reasons.has('type') ? getWrongTypeMessage() : null,
      getTooLargeMessage(tooLarge),
      reasons.has('count') ? getOverLimitMessage() : null,
    ].filter(message => message !== null)

    return messages.length > 0 ? messages.join(' ') : undefined
  }

  const getPrompt = (): DropZonePromptProps => {
    const description = [
      multiple && fileLimit !== undefined && heldCount > 0
        ? t('blocks:Form.useFileUploadMessages.label.added_count', '{{count}} of {{limit}} added', { count: heldCount, limit: formatNumber(fileLimit) })
        : null,
      fileTypes ?? t('blocks:Form.useFileUploadMessages.label.any_file_type', 'Any file type'),
      maxFileSizeInBytes === undefined
        ? null
        : t('blocks:Form.useFileUploadMessages.label.max_size', 'Up to {{maxSize}}', { maxSize: formatFileSize(maxFileSizeInBytes) }),
    ].filter(part => part !== null).join(' · ')

    if (isMobile) {
      return {
        title: multiple
          ? t('blocks:Form.useFileUploadMessages.action.add_files', 'Add files')
          : t('blocks:Form.useFileUploadMessages.action.add_file', 'Add a file'),
        description,
      }
    }
    if (!multiple) {
      return {
        title: t('blocks:Form.useFileUploadMessages.label.drag_drop_file', 'Drag and drop a file here'),
        description,
        actionLabel: t('blocks:Form.useFileUploadMessages.action.choose_file', 'Choose file'),
      }
    }
    if (heldCount > 0) {
      return {
        title: t('blocks:Form.useFileUploadMessages.label.drag_drop_more_files', 'Drag and drop more files here'),
        description,
        actionLabel: t('blocks:Form.useFileUploadMessages.action.add_files', 'Add files'),
      }
    }
    return {
      title: t('blocks:Form.useFileUploadMessages.label.drag_drop_files', 'Drag and drop files here'),
      description,
      actionLabel: t('blocks:Form.useFileUploadMessages.action.choose_files', 'Choose files'),
    }
  }

  const isAtLimit = remaining !== undefined && remaining <= 0
  const limitNotice = isAtLimit && fileLimit !== undefined
    ? t('blocks:Form.useFileUploadMessages.label.at_limit', '{{count}} of {{limit}} files added. Remove one to add another.', {
      count: heldCount,
      limit: formatNumber(fileLimit),
    })
    : undefined

  return {
    getRejectionMessage,
    prompt: getPrompt(),
    limitNotice,
    uploadFailed: t('blocks:Form.useFileUploadMessages.error.upload_failed', 'Some files couldn’t be uploaded. Try again.'),
    noFiles: t('blocks:Form.useFileUploadMessages.label.no_files', 'No files uploaded'),
  }
}
