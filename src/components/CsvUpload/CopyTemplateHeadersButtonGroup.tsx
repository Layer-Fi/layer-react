import { CopyIcon } from 'lucide-react'
import { HStack } from '../ui/Stack/Stack'
import { Button, ButtonVariant } from '../Button/Button'

const copyTextToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => {})
}

interface CopyTemplateHeadersButtonGroupProps {
  templateHeaders: string[]
}

export const CopyTemplateHeadersButtonGroup = ({ templateHeaders }: CopyTemplateHeadersButtonGroupProps) => {
  return (
    <HStack gap='3xs' className='Layer__csv-upload__copy_template_headers_button_group'>
      {templateHeaders.map(header => (
        <Button
          key={header}
          onClick={() => copyTextToClipboard(header)}
          rightIcon={<CopyIcon strokeWidth={1} size={12} />}
          variant={ButtonVariant.secondary}
        >
          {header}
        </Button>
      ))}
    </HStack>
  )
}
