import { FileSpreadsheet, X } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'

import './csvUploadFileRow.scss'

type CsvUploadFileRowProps = {
  file: File
  onClearFile: () => void
  asDropTarget?: boolean
}

export const CsvUploadFileRow = ({ file, onClearFile, asDropTarget }: CsvUploadFileRowProps) => {
  if (asDropTarget) {
    return (
      <VStack className='Layer__csv-upload__file-row Layer__csv-upload__file-row--drop-target'>
        <HStack>
          <Spacer />
          <Button variant='ghost' inset icon onClick={onClearFile}>
            <X size={16} />
          </Button>
        </HStack>
        <HStack align='center' justify='center' gap='xs'>
          <FileSpreadsheet size={24} />
          <P size='md'>{file.name}</P>
        </HStack>
      </VStack>
    )
  }

  return (
    <HStack align='center' gap='xs' className='Layer__csv-upload__file-row'>
      <FileSpreadsheet size={24} />
      <P size='md'>{file.name}</P>
      <Spacer />
      <Button variant='ghost' inset icon onClick={onClearFile}>
        <X size={16} />
      </Button>
    </HStack>
  )
}
