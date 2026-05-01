import { GridListItem } from 'react-aria-components'

import ChevronRight from '@icons/ChevronRight'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

import './businessFormMobileItem.scss'

export interface BusinessFormMobileItemOption {
  value: BankTransactionCategoryComboBoxOption
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
      className='Layer__BusinessFormMobileItem'
    >
      <HStack gap='md' pi='md' pb='sm'>
        {!option.asLink && (
          <Checkbox
            slot='selection'
            variant='round'
          />
        )}

        <HStack fluid justify={option.asLink ? 'space-between' : 'start'}>
          <Span size='sm'>{label}</Span>

          {option.asLink && (
            <ChevronRight
              size={16}
            />
          )}
        </HStack>

      </HStack>
    </GridListItem>
  )
}
