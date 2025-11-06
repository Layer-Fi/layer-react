import { HStack } from '@components/ui/Stack/Stack'
import { Badge, BadgeSize } from '@components/Badge/Badge'
import MinimizeTwo from '@icons/MinimizeTwo'
import { Span } from '@components/ui/Typography/Text'
import Scissors from '@icons/Scissors'

export type BankTransactionsBaseSelectedValueProps = {
  type: 'match' | 'transfer' | 'split' | 'category'
  label: string
  size?: 'sm' | 'md'
  className?: string
}

export const BankTransactionsBaseSelectedValue = (props: BankTransactionsBaseSelectedValueProps) => {
  const { type, size = 'md', className, label } = props

  if (type === 'match' || type === 'transfer') {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
          {type === 'transfer' ? 'Transfer' : 'Match'}
        </Badge>
        <Span ellipsis size={size}>{label}</Span>
      </HStack>
    )
  }

  if (type === 'split') {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<Scissors size={11} />}>
          Split
        </Badge>
        <Span ellipsis size={size}>{label}</Span>
      </HStack>
    )
  }

  return <Span ellipsis size={size} className={className}>{label}</Span>
}
