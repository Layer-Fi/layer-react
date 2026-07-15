import { type ReactNode } from 'react'
import { Check } from 'lucide-react'

import { humanizeEnum } from '@utils/format'
import { COMBO_BOX_CLASS_NAMES } from '@ui/ComboBox/classnames'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import type { AccountOption } from '@components/CustomAccountComboBox/AccountOption'

type AccountOptionSlotProps = {
  option: AccountOption
  fallback: ReactNode
}

export const AccountOptionSlot = ({ option, fallback }: AccountOptionSlotProps) => {
  if (option.account && !option.__isNew__) {
    return (
      <HStack gap='xs' align='center'>
        <Check size={16} className={COMBO_BOX_CLASS_NAMES.OPTION_CHECK_ICON} />
        <VStack>
          <Span ellipsis>{option.account.accountName}</Span>
          <Span size='sm' variant='subtle' noWrap>
            {option.account.institutionName}
            {' · '}
            {humanizeEnum(option.account.accountSubtype!)}
          </Span>
        </VStack>
      </HStack>
    )
  }

  return fallback
}

export const AccountSingleValueSlot = ({ option, fallback }: AccountOptionSlotProps) => {
  if (option.account && !option.__isNew__) {
    return <Span ellipsis>{option.account.accountName}</Span>
  }

  return fallback
}
