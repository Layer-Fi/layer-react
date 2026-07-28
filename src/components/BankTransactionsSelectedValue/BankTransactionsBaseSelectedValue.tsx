import { Layers2Icon, Minimize2, Scissors, SparklesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize } from '@components/Badge/Badge'

import './bankTransactionsSelectedValue.scss'

export type BankTransactionsBaseSelectedValueProps = {
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

export const BankTransactionsBaseSelectedValue = (props: BankTransactionsBaseSelectedValueProps) => {
  const { t } = useTranslation()
  const { type, className, label, slotProps, showCategoryBadge = false, showAiSparkle = false, isCategorized = false } = props

  const sparkle = showAiSparkle
    ? <SparklesIcon size={14} className='Layer__BankTransactionsSelectedValue__AiSparkle' />
    : null

  if (type === 'placeholder') {
    return (
      <HStack gap='xs' align='center' className={className}>
        {sparkle}
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
        {sparkle}
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
        {sparkle}
        <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
      </HStack>
    )
  }

  return (
    <HStack gap='xs' align='center' className={className}>
      {showCategoryBadge && (
        <Badge size={BadgeSize.SMALL} icon={<Layers2Icon size={11} />}>
          {isCategorized ? t('common:label.category', 'Category') : t('bankTransactions:label.suggested_category', 'Suggested category')}
        </Badge>
      )}
      {sparkle}
      <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
    </HStack>
  )
}
