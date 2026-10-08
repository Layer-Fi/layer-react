import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getAccountsNeedingConfirmation } from '@utils/features/bankAccounts/bankAccount'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { Banner } from '@ui/Banner/Banner'
import { Button } from '@ui/Button/Button'
import { LinkedAccountsConfirmationModal } from '@features/linkedAccounts/LinkedAccountsConfirmationModal/LinkedAccountsConfirmationModal'

export const PendingAccountConfirmationBanner = () => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { data } = useBankAccountsContext()
  const [isConfirming, setIsConfirming] = useState(false)

  const pendingCount = getAccountsNeedingConfirmation(data ?? []).length

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
                <Button variant='outlined' onPress={() => setIsConfirming(true)}>
                  {t('linkedAccounts:PendingAccountConfirmationBanner.action.review_accounts', 'Review accounts')}
                </Button>
              ),
            }}
          />
        )
        : null}
      <LinkedAccountsConfirmationModal isOpen={isConfirming} onOpenChange={setIsConfirming} />
    </>
  )
}
