import { HStack } from '@components/ui/Stack/Stack'
import { Badge, BadgeSize } from '@components/Badge/Badge'
import MinimizeTwo from '@icons/MinimizeTwo'
import { Span } from '@components/ui/Typography/Text'
import Scissors from '@icons/Scissors'
import { Layers2Icon } from 'lucide-react'

export type BankTransactionsBaseSelectedValueProps = {
  type: 'match' | 'transfer' | 'split' | 'category' | 'placeholder'
  label: string
  className?: string
  slotProps?: {
    Label?: {
      size?: 'sm' | 'md'
    }
  }
}

export const BankTransactionsBaseSelectedValue = (props: BankTransactionsBaseSelectedValueProps) => {
  const { type, className, label, slotProps } = props

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
        <Badge size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
          {type === 'transfer' ? 'Transfer' : 'Match'}
        </Badge>
        <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
      </HStack>
    )
  }

  if (type === 'split') {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<Scissors size={11} />}>
          Split
        </Badge>
        <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
      </HStack>
    )
  }

  return (
    <HStack gap='xs' align='center' className={className}>
      <Badge size={BadgeSize.SMALL} icon={<Layers2Icon size={11} />}>
        Category
      </Badge>
      <Span ellipsis size={slotProps?.Label?.size ?? 'md'}>{label}</Span>
    </HStack>
  )
}
