import { BankTransactionCategoryComboBoxOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSuggestedMatchAsOption, isSplitAsOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { HStack } from '../ui/Stack/Stack'
import { Badge, BadgeSize } from '../Badge/Badge'
import MinimizeTwo from '../../icons/MinimizeTwo'
import Scissors from '../../icons/Scissors'
import { Span } from '../ui/Typography/Text'

type BankTransactionsUncategorizedSelectedValueProps = {
  selectedValue: BankTransactionCategoryComboBoxOption | null
  className?: string
}

export const BankTransactionsUncategorizedSelectedValue = ({ selectedValue, className }: BankTransactionsUncategorizedSelectedValueProps) => {
  if (!selectedValue) return null

  if (isSuggestedMatchAsOption(selectedValue)) {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
          {selectedValue.original.details.type === 'Transfer_Match' ? 'Transfer' : 'Match'}
        </Badge>
        <Span ellipsis size='sm'>{selectedValue.label}</Span>
      </HStack>
    )
  }

  if (isSplitAsOption(selectedValue) && selectedValue.original.length > 1) {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<Scissors size={11} />}>
          Split
        </Badge>
        <Span ellipsis size='sm'>{selectedValue.label}</Span>
      </HStack>
    )
  }

  return <Span ellipsis size='sm' className={className}>{selectedValue.label}</Span>
}
