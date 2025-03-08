import type { LinkedAccount } from '../../../types/linked_accounts'
import { VStack } from '../../ui/Stack/Stack'
import { Checkbox } from '../../ui/Checkbox/Checkbox'
import { BasicLinkedAccountContainer, BasicLinkedAccountContent } from '../BasicLinkedAccount/BasicLinkedAccount'

type LinkedAccountConfirmationProps = {
  account: LinkedAccount
  isConfirmed: boolean
  onChangeConfirmed: (isConfirmed: boolean) => void
}

export function LinkedAccountToConfirm({
  account,
  isConfirmed,
  onChangeConfirmed,
}: LinkedAccountConfirmationProps) {
  return (
    <BasicLinkedAccountContainer isSelected={isConfirmed}>
      <BasicLinkedAccountContent account={account} />
      <VStack justify='center'>
        <Checkbox
          size='lg'
          variant='success'
          isSelected={isConfirmed}
          onChange={onChangeConfirmed}
          aria-label='Confirm Account Inclusion'
        />
      </VStack>
    </BasicLinkedAccountContainer>
  )
}
