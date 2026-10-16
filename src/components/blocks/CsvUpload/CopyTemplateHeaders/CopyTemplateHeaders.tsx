import { CopyIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { HStack } from '@ui/Stack/Stack'

const copyTextToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => {})
}

type CopyTemplateHeadersProps = {
  headers: Record<string, string>
}

export const CopyTemplateHeaders = ({ headers }: CopyTemplateHeadersProps) => {
  const { t } = useTranslation()

  return (
    <HStack gap='3xs' align='center'>
      {Object.entries(headers).map(([key, header]) => (
        <Badge
          key={key}
          size={BadgeSize.SMALL}
          variant={BadgeVariant.NEUTRAL}
          icon={<CopyIcon size={11} />}
          iconPosition='right'
          tooltip={t('upload:action.copy_column_header', 'Copy “{{header}}”', { header })}
          onPress={() => copyTextToClipboard(header)}
        >
          {header}
        </Badge>
      ))}
    </HStack>
  )
}
