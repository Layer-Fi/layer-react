import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useAccountsNeedingConfirmation } from '@hooks/features/bankAccounts/useAccountsNeedingConfirmation'
import { Banner, BannerButton } from '@ui/Banner/Banner'
import { Modal } from '@ui/Modal/Modal'
import { LinkedAccountsConfirmationModalContent } from '@features/linkedAccounts/LinkedAccountsConfirmationModal/LinkedAccountsConfirmationModal'

type PendingAccountsBannerProps = {
  accounts: ReturnType<typeof useAccountsNeedingConfirmation>
  onReview: () => void
}

const PendingAccountsBanner = ({ accounts, onReview }: PendingAccountsBannerProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  if (accounts.length === 0) return null

  return (
    <Banner
      variant='info'
      title={tPlural(t, 'linkedAccounts:PendingAccountConfirmationBanner.label.title', {
        count: accounts.length,
        one: 'Confirm your new account',
        other: 'Confirm your new accounts',
      })}
      description={tPlural(t, 'linkedAccounts:PendingAccountConfirmationBanner.label.description', {
        count: accounts.length,
        displayCount: formatNumber(accounts.length),
        one: 'We found {{displayCount}} new account. Confirm it belongs to your business so we can bring in its transactions.',
        other: 'We found {{displayCount}} new accounts. Confirm which belong to your business so we can bring in their transactions.',
      })}
      slots={{
        Button: (
          <BannerButton onPress={onReview}>
            {t('linkedAccounts:PendingAccountConfirmationBanner.action.review_accounts', 'Review accounts')}
          </BannerButton>
        ),
      }}
    />
  )
}

export const PendingAccountConfirmationBanner = () => {
  const accounts = useAccountsNeedingConfirmation()
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    <>
      <PendingAccountsBanner accounts={accounts} onReview={() => setIsConfirming(true)} />
      <Modal isOpen={isConfirming} onOpenChange={setIsConfirming}>
        {({ close }) => <LinkedAccountsConfirmationModalContent onClose={close} />}
      </Modal>
    </>
  )
}
