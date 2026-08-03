import { Layers2Icon, Minimize2, Scissors, SparklesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge, BadgeSize } from '@ui/Badge/Badge'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './bankTransactionsSelectedValue.scss'

export type BankTransactionsSelectedValueProps = {
  type: 'match' | 'transfer' | 'split' | 'category' | 'placeholder'
  label: string
  showCategoryBadge?: boolean
  showAiSparkle?: boolean
  isCategorized?: boolean
  className?: string
  slotProps?: {
    Label?: {
      size?: 'sm' | 'md'
    }
  }
}

export const BankTransactionsSelectedValue = (props: BankTransactionsSelectedValueProps) => {
  const { t } = useTranslation()
  const { type, className, label, slotProps, showCategoryBadge = false, showAiSparkle = false, isCategorized = false } = props

  if (type === 'placeholder') {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
      </HStack>
    )
  }

  if (type === 'match' || type === 'transfer') {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<Minimize2 size={11} />}>
          {type === 'transfer' ? t('bankTransactions:label.transfer', 'Transfer') : t('bankTransactions:label.match', 'Match')}
        </Badge>
        <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
      </HStack>
    )
  }

  if (type === 'split') {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<Scissors size={11} />}>
          {t('bankTransactions:action.split_label', 'Split')}
        </Badge>
        <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
      </HStack>
    )
  }

  return (
    <HStack gap='xs' align='center' className={className}>
      {showCategoryBadge && (
        <Badge size={BadgeSize.SMALL} icon={isCategorized ? <Layers2Icon size={11} /> : <SparklesIcon size={11} />}>
          {isCategorized ? t('common:label.category', 'Category') : t('bankTransactions:label.suggested_category', 'Suggested category')}
        </Badge>
      )}
      {showAiSparkle && <SparklesIcon size={14} className='Layer__BankTransactionsSelectedValue__AiSparkle' />}
      <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
    </HStack>
  )
}
