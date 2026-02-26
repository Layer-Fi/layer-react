import classNames from 'classnames'
import { CopyIcon } from 'lucide-react'

import { HStack } from '@ui/Stack/Stack'
import { Button, ButtonVariant } from '@components/Button/Button'

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
      {Object.entries(headers).map(([key, value]) => (
        <Button
          key={key}
          onClick={() => copyTextToClipboard(value)}
          rightIcon={<CopyIcon strokeWidth={1} size={12} />}
          variant={ButtonVariant.secondary}
        >
          {value}
        </Button>
      ))}
    </HStack>
  )
}
