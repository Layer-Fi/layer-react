import { useTranslation } from 'react-i18next'

import type { ExternalAccountConnection } from '@schemas/bankAccounts/externalAccountConnection'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { VStack } from '@ui/Stack/Stack'
import { LinkedAccountRowContainer, LinkedAccountRowContent } from '@features/linkedAccounts/LinkedAccountRow/LinkedAccountRow'

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
    <LinkedAccountRowContainer isSelected={isConfirmed}>
      <LinkedAccountRowContent account={account} />
      <VStack justify='center'>
        <Checkbox
          size='lg'
          variant='branded'
          isSelected={isConfirmed}
          onChange={onChangeConfirmed}
          aria-label={t('linkedAccounts:label.confirm_account_inclusion', 'Confirm Account Inclusion')}
        />
      </VStack>
    </LinkedAccountRowContainer>
  )
}
