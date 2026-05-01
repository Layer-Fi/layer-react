import { GridListItem } from 'react-aria-components'

import ChevronRight from '@icons/ChevronRight'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './businessFormMobileItem.scss'

export interface BusinessFormOptionValue {
  label: string
  value: string
}

export interface BusinessFormMobileItemOption<T extends BusinessFormOptionValue = BusinessFormOptionValue> {
  value: T
  asLink?: boolean
}

interface BusinessFormMobileItemProps<T extends BusinessFormOptionValue> {
  option: BusinessFormMobileItemOption<T>
}

export const BusinessFormMobileItem = <T extends BusinessFormOptionValue,>({
  option,
}: BusinessFormMobileItemProps<T>) => {
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

        <Span size='sm'>{label}</Span>

        {option.asLink && (
          <ChevronRight
            size={16}
          />
        )}
      </HStack>
    </GridListItem>
  )
}
