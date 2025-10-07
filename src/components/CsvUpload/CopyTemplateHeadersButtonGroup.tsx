import { CopyIcon } from 'lucide-react'
import { HStack } from '../ui/Stack/Stack'
import { DeprecatedButton, ButtonVariant } from '../Button/Button'
import classNames from 'classnames'

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
      {Object.keys(headers).map(key => (
        <DeprecatedButton
          key={key}
          onClick={() => copyTextToClipboard(headers[key])}
          rightIcon={<CopyIcon strokeWidth={1} size={12} />}
          variant={ButtonVariant.secondary}
        >
          {headers[key]}
        </DeprecatedButton>
      ))}
    </HStack>
  )
}
