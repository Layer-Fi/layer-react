import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankAccount, type PcMsoOwner } from '@schemas/features/bankAccounts/bankAccount'
import { getBankAccountDisplayName } from '@utils/features/bankAccounts/bankAccount'
import { useAssignPcMsoOwner } from '@api/businesses/[business-id]/bank-accounts/[bank-account-id]/pc-mso-owner/put'
import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

export function PcMsoOwnerModal({ account, onOpenChange }: {
  account: BankAccount
  onOpenChange: (isOpen: boolean) => void
}) {
  const { t } = useTranslation()
  const [owner, setOwner] = useState<PcMsoOwner | ''>('')
  const { trigger } = useAssignPcMsoOwner({ bankAccountId: account.id })

  return (
    <BaseConfirmationModal
      isOpen
      onOpenChange={onOpenChange}
      title={t('linkedAccounts:PcMsoOwnerModal.label.assign_owner_to_account', 'Assign owner for {{account}}', {
        account: getBankAccountDisplayName(account),
      })}
      description={t('linkedAccounts:PcMsoOwnerModal.label.future_imports_only', 'Choose the legal owner only if you know it. New imports will use this owner. Existing transactions won’t change.')}
      content={(
        <RadioGroup<PcMsoOwner | ''> aria-label={t('linkedAccounts:PcMsoOwnerModal.label.legal_owner', 'Legal owner')} value={owner} onChange={setOwner}>
          <Radio value='PC'>{t('linkedAccounts:PcMsoOwnerModal.label.pc', 'PC (Professional Corporation)')}</Radio>
          <Radio value='MSO'>{t('linkedAccounts:PcMsoOwnerModal.label.mso', 'MSO (Management Services Organization)')}</Radio>
        </RadioGroup>
      )}
      onConfirm={async () => { if (owner) await trigger({ owner }) }}
      confirmDisabled={owner === ''}
      confirmLabel={t('linkedAccounts:PcMsoOwnerModal.action.save_owner', 'Save owner')}
      cancelLabel={t('linkedAccounts:PcMsoOwnerModal.action.do_later', 'Do this later')}
      errorText={t('linkedAccounts:PcMsoOwnerModal.error.owner_not_saved', 'Couldn’t save the owner. You can retry or do this later. Imports are not affected.')}
    />
  )
}
