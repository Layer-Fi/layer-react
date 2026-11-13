import { CircleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { getBankAccountDisplayName, getBankAccountInstitution } from '@utils/features/bankAccounts/bankAccount'
import { getBankAccountDisconnection, getRefreshConnectionKey } from '@utils/features/bankAccounts/refresh'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Banner } from '@ui/Banner/Banner'
import { HStack } from '@ui/Stack/Stack'

type DisconnectedAccountsBannerProps = {
  bankAccounts: ReadonlyArray<BankAccount>
}

export const DisconnectedAccountsBanner = ({ bankAccounts }: DisconnectedAccountsBannerProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  const disconnected = bankAccounts.flatMap((bankAccount) => {
    const disconnection = getBankAccountDisconnection(bankAccount)
    return disconnection ? [{ bankAccount, institutionName: getBankAccountInstitution(bankAccount)?.name ?? null, disconnection }] : []
  })

  const [first] = disconnected
  if (!first) return null

  const count = disconnected.length
  const bankCount = new Set(disconnected.map(({ institutionName, disconnection }) =>
    institutionName ?? getRefreshConnectionKey(disconnection),
  )).size
  const { institutionName } = first

  const getSoleAccountTitle = () => {
    const accountName = getBankAccountDisplayName(first.bankAccount)
    const accountLabel = first.bankAccount.mask
      ? t('linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.label.account_with_mask', '{{accountName}} •••{{mask}}', {
        accountName,
        mask: first.bankAccount.mask,
      })
      : accountName

    return institutionName
      ? t('linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.account_at_institution_disconnected', '{{accountLabel}} at {{institutionName}} is disconnected', {
        accountLabel,
        institutionName,
      })
      : t('linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.account_disconnected', '{{accountLabel}} is disconnected', { accountLabel })
  }

  const getTitle = () => {
    if (count === 1) return getSoleAccountTitle()

    if (bankCount > 1) {
      return tPlural(t, 'linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.accounts_at_banks_disconnected', {
        count,
        displayCount: formatNumber(count),
        displayBankCount: formatNumber(bankCount),
        one: '{{displayCount}} account at {{displayBankCount}} banks is disconnected',
        other: '{{displayCount}} accounts at {{displayBankCount}} banks are disconnected',
      })
    }

    return institutionName
      ? tPlural(t, 'linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.accounts_at_institution_disconnected', {
        count,
        displayCount: formatNumber(count),
        institutionName,
        one: '{{displayCount}} account at {{institutionName}} is disconnected',
        other: '{{displayCount}} accounts at {{institutionName}} are disconnected',
      })
      : tPlural(t, 'linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.accounts_disconnected', {
        count,
        displayCount: formatNumber(count),
        one: '{{displayCount}} account is disconnected',
        other: '{{displayCount}} accounts are disconnected',
      })
  }

  return (
    <HStack pi='lg' pbe='md'>
      <Banner
        variant='error'
        title={getTitle()}
        description={tPlural(t, 'linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.label.reconnect_accounts_below', {
          count,
          one: 'Reconnect your account below to resume syncing transactions.',
          other: 'Reconnect your accounts below to resume syncing transactions.',
        })}
        slots={{ Icon: <CircleAlert size={20} /> }}
      />
    </HStack>
  )
}
