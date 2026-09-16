import classNames from 'classnames'
import { CopyIcon } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'

import './copyTemplateHeadersButtonGroup.scss'

const copyTextToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => {})
}

interface CopyTemplateHeadersButtonGroupProps {
  headers: Record<string, string>
  className?: string
}

export const CopyTemplateHeadersButtonGroup = ({ headers, className }: CopyTemplateHeadersButtonGroupProps) => {
  return (
    <HStack gap='3xs' className={classNames('Layer__csv-upload__copy-template-headers-button-group', className)}>
      {Object.entries(headers).map(([key, header]) => (
        <Button
          key={key}
          onPress={() => copyTextToClipboard(header)}
          variant='outlined'
        >
          {header}
          <CopyIcon strokeWidth={1} size={12} />
        </Button>
      ))}
    </HStack>
  )
}
