import { CopyIcon } from 'lucide-react'
import { HStack } from '../ui/Stack/Stack'
import { Button, ButtonVariant } from '../Button/Button'

const copyTextToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => {})
}

interface CopyTemplateHeadersButtonGroupProps {
  headers: Record<string, string>
}

export const CopyTemplateHeadersButtonGroup = ({ headers }: CopyTemplateHeadersButtonGroupProps) => {
  return (
    <HStack gap='3xs' className='Layer__csv-upload__copy-template-headers-button-group'>
      {Object.keys(headers).map(key => (
        <Button
          key={key}
          onClick={() => copyTextToClipboard(headers[key])}
          rightIcon={<CopyIcon strokeWidth={1} size={12} />}
          variant={ButtonVariant.secondary}
        >
          {headers[key]}
        </Button>
      ))}
    </HStack>
  )
}
