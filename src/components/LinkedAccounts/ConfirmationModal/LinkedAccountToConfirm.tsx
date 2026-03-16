import { useTranslation } from 'react-i18next'

import type { ExternalAccountConnection } from '@internal-types/linkedAccounts'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { VStack } from '@ui/Stack/Stack'
import { BasicLinkedAccountContainer, BasicLinkedAccountContent } from '@components/LinkedAccounts/BasicLinkedAccount/BasicLinkedAccount'

type LinkedAccountConfirmationProps = {
  account: ExternalAccountConnection
  isConfirmed: boolean
  onChangeConfirmed: (isConfirmed: boolean) => void
}

export function LinkedAccountToConfirm({
  account,
  isConfirmed,
  onChangeConfirmed,
}: LinkedAccountConfirmationProps) {
  const { t } = useTranslation()
  return (
    <BasicLinkedAccountContainer isSelected={isConfirmed}>
      <BasicLinkedAccountContent account={account} />
      <VStack justify='center'>
        <Checkbox
          size='lg'
          variant='success'
          isSelected={isConfirmed}
          onChange={onChangeConfirmed}
          aria-label={t('linkedAccounts.confirmAccountInclusion', 'Confirm Account Inclusion')}
        />
      </VStack>
    </BasicLinkedAccountContainer>
  )
}
