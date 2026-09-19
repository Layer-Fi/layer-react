import { useTranslation } from 'react-i18next'

import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'

type LegacyTaskFileListProps = {
  documents: LegacyBusinessTask['documents']
  selectedFiles?: File[]
}

export const LegacyTaskFileList = ({ documents, selectedFiles }: LegacyTaskFileListProps) => {
  const { t } = useTranslation()

  const header = selectedFiles
    ? t('bookkeeping:TasksListItem.LegacyTaskFileList.label.selected_files', 'Selected Files:')
    : documents
      ? t('bookkeeping:TasksListItem.LegacyTaskFileList.label.uploaded_files', 'Uploaded Files:')
      : null

  return (
    <div className='Layer__tasks-list__link-list'>
      {header ? <div className='Layer__tasks-list__link-list-header'>{header}</div> : null}
      <ul className='Layer__tasks-list__links-list'>
        {documents?.map((document, idx) => (
          <li key={`uploaded-doc-name-${idx}`}>
            <a className='Layer__tasks-list-item__link' href={document.presignedUrl.presignedUrl}>{document.fileName}</a>
          </li>
        ))}
        {selectedFiles?.map((file, idx) => (
          <li key={`selected-file-name-${idx}`}><a className='Layer__tasks-list-item__link'>{file.name}</a></li>
        ))}
      </ul>
    </div>
  )
}
