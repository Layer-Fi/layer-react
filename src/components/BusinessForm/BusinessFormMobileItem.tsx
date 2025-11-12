import { HStack } from '@components/ui/Stack/Stack'
import { Span } from '@components/ui/Typography/Text'
import { GridListItem } from 'react-aria-components'
import { Checkbox } from '@components/ui/Checkbox/Checkbox'
import ChevronRight from '@icons/ChevronRight'
import { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export type BusinessFormOptionValue = BankTransactionCategoryComboBoxOption

export interface BusinessFormMobileItemOption {
  value: BusinessFormOptionValue
  asLink?: boolean
}

interface BusinessFormMobileItemProps {
  option: BusinessFormMobileItemOption
}

export const BusinessFormMobileItem = ({
  option,
}: BusinessFormMobileItemProps) => {
  const value = option.value.value
  const label = option.value.label

  return (
    <GridListItem
      id={value}
      key={value}
      textValue={label}
    >
      <HStack gap='md' pi='md' pb='sm'>
        {!option.asLink && (
          <Checkbox
            slot='selection'
            variant='round'
          />
        )}

        <Span size='sm'>{label}</Span>

        {option.asLink && (
          <ChevronRight
            size={16}
            className='Layer__BusinessFormMobileItem__link-icon'
          />
        )}
      </HStack>
    </GridListItem>
  )
}
