import { BankTransactionCategoryComboBoxOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSuggestedMatchAsOption, isSplitAsOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { HStack } from '../ui/Stack/Stack'
import { Badge, BadgeSize } from '../Badge/Badge'
import MinimizeTwo from '../../icons/MinimizeTwo'
import Scissors from '../../icons/Scissors'
import { Span } from '../ui/Typography/Text'

type BankTransactionsUncategorizedSelectedValueProps = {
  selectedValue: BankTransactionCategoryComboBoxOption | null
}

export const BankTransactionsUncategorizedSelectedValue = ({ selectedValue }: BankTransactionsUncategorizedSelectedValueProps) => {
  if (!selectedValue) return null

  if (isSuggestedMatchAsOption(selectedValue)) {
    return (
      <HStack gap='3xs' align='center'>
        <Badge size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
          {selectedValue.original.details.type === 'Transfer_Match' ? 'Transfer' : 'Match'}
        </Badge>
        <Span ellipsis>{selectedValue.label}</Span>
      </HStack>
    )
  }

  if (isSplitAsOption(selectedValue) && selectedValue.original.length > 1) {
    return (
      <HStack gap='3xs' align='center'>
        <Badge size={BadgeSize.SMALL} icon={<Scissors size={11} />}>
          Split
        </Badge>
        <Span ellipsis>{selectedValue.label}</Span>
      </HStack>
    )
  }

  return <Span ellipsis>{selectedValue.label}</Span>
}
