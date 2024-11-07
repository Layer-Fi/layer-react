import React from 'react'
import type { LinkedAccount } from '../../../types/linked_accounts'
import { Heading } from '../../ui/Typography/Heading'
import { P } from '../../ui/Typography/Text'
import { VStack } from '../../ui/Stack/Stack'
import { Checkbox } from  '../../ui/Checkbox/Checkbox'

type LinkedAccountConfirmationProps = {
  account: LinkedAccount
  isConfirmed: boolean
  onChangeConfirmed: (isConfirmed: boolean) => void
}

const CLASS_NAME = 'Layer__LinkedAccountToConfirm'

export function LinkedAccountToConfirm({
  account,
  isConfirmed,
  onChangeConfirmed,
}: LinkedAccountConfirmationProps) {
  return (
    <div className={CLASS_NAME}>
      <VStack>
        <Heading level={3} size='sm'>{account.external_account_name}</Heading>
        <P slot='mask'>
          ••• {account.mask}
        </P>
        <P slot='institution'>
          {account.institution.name}
        </P>
      </VStack>
      <VStack justify='center'>
        <Checkbox
          isSelected={isConfirmed}
          onChange={onChangeConfirmed}
          aria-label='Confirm Account Inclusion'
        />
      </VStack>
    </div>
  )
}
