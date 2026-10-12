import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getAccountsNeedingConfirmation } from '@utils/features/bankAccounts/bankAccount'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { Banner, BannerButton } from '@ui/Banner/Banner'
import { Modal } from '@ui/Modal/Modal'
import { LinkedAccountsConfirmationModalContent } from '@features/linkedAccounts/LinkedAccountsConfirmationModal/LinkedAccountsConfirmationModal'

export const PendingAccountConfirmationBanner = () => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { data } = useBankAccountsContext()
  const [isConfirming, setIsConfirming] = useState(false)
  const pendingCount = getAccountsNeedingConfirmation(data ?? []).length

  // The dialog outlives the banner: confirming refetches accounts, which empties the count before the dialog has closed itself.
  if (pendingCount === 0 && !isConfirming) return null

  return (
    <>
      {pendingCount > 0
        ? (
          <Banner
            variant='info'
            title={tPlural(t, 'linkedAccounts:PendingAccountConfirmationBanner.label.title', {
              count: pendingCount,
              one: 'Confirm your new account',
              other: 'Confirm your new accounts',
            })}
            description={tPlural(t, 'linkedAccounts:PendingAccountConfirmationBanner.label.description', {
              count: pendingCount,
              displayCount: formatNumber(pendingCount),
              one: 'We found {{displayCount}} new account. Confirm it belongs to your business so we can bring in its transactions.',
              other: 'We found {{displayCount}} new accounts. Confirm which belong to your business so we can bring in their transactions.',
            })}
            slots={{
              Button: (
                <BannerButton onPress={() => setIsConfirming(true)}>
                  {t('linkedAccounts:PendingAccountConfirmationBanner.action.review_accounts', 'Review accounts')}
                </BannerButton>
              ),
            }}
          />
        )
        : null}
      <Modal isOpen={isConfirming} onOpenChange={setIsConfirming}>
        {({ close }) => <LinkedAccountsConfirmationModalContent onClose={close} />}
      </Modal>
    </>
  )
}
