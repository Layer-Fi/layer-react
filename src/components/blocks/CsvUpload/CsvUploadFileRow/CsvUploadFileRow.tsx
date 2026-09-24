import { FileSpreadsheet, X } from 'lucide-react'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Button } from '@ui/Button/Button'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'

import './csvUploadFileRow.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__CsvUploadFileRow': 'Layer__csv-upload__file-row',
  'state:dropTarget': 'Layer__csv-upload__file-row--drop-target',
} satisfies LegacyClassNameMapFor<'Layer__CsvUploadFileRow', `state:${string}`>)

type CsvUploadFileRowProps = {
  file: File
  onClearFile: () => void
  asDropTarget?: boolean
}

export const CsvUploadFileRow = ({ file, onClearFile, asDropTarget }: CsvUploadFileRowProps) => {
  if (asDropTarget) {
    return (
      <VStack
        className={legacyClassNames('Layer__CsvUploadFileRow', 'state:dropTarget')}
        {...toDataProperties({ 'drop-target': true })}
      >
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
    <HStack align='center' gap='xs' className={legacyClassNames('Layer__CsvUploadFileRow')}>
      <FileSpreadsheet size={24} />
      <P size='md'>{file.name}</P>
      <Spacer />
      <Button variant='ghost' inset icon onClick={onClearFile}>
        <X size={16} />
      </Button>
    </HStack>
  )
}
