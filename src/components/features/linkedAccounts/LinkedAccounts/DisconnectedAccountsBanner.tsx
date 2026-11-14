import { type TFunction } from 'i18next'
import { CircleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { type DisconnectedBankAccountsSummary, getDisconnectedBankAccountsSummary } from '@utils/features/bankAccounts/refresh'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Banner } from '@ui/Banner/Banner'
import { HStack } from '@ui/Stack/Stack'

type FormatNumber = ReturnType<typeof useIntlFormatter>['formatNumber']

function getTitle(t: TFunction, formatNumber: FormatNumber, { count, bankCount, institutionName, soleAccount }: DisconnectedBankAccountsSummary) {
  if (soleAccount) {
    const accountLabel = soleAccount.mask
      ? t('linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.label.account_with_mask', '{{accountName}} •••{{mask}}', soleAccount)
      : soleAccount.accountName

    return t('linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.account_disconnected', '{{accountLabel}} is disconnected', { accountLabel })
  }

  const displayCount = formatNumber(count)

  if (bankCount > 1) {
    return tPlural(t, 'linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.accounts_at_banks_disconnected', {
      count,
      displayCount,
      displayBankCount: formatNumber(bankCount),
      one: '{{displayCount}} account at {{displayBankCount}} banks is disconnected',
      other: '{{displayCount}} accounts at {{displayBankCount}} banks are disconnected',
    })
  }

  return institutionName
    ? tPlural(t, 'linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.accounts_at_institution_disconnected', {
      count,
      displayCount,
      institutionName,
      one: '{{displayCount}} account at {{institutionName}} is disconnected',
      other: '{{displayCount}} accounts at {{institutionName}} are disconnected',
    })
    : tPlural(t, 'linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.title.accounts_disconnected', {
      count,
      displayCount,
      one: '{{displayCount}} account is disconnected',
      other: '{{displayCount}} accounts are disconnected',
    })
}

type DisconnectedAccountsBannerProps = {
  bankAccounts: ReadonlyArray<BankAccount> | undefined
}

export const DisconnectedAccountsBanner = ({ bankAccounts }: DisconnectedAccountsBannerProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const summary = getDisconnectedBankAccountsSummary(bankAccounts)

  if (!summary) return null

  return (
    <HStack pi='lg' pbe='md'>
      <Banner
        variant='error'
        title={getTitle(t, formatNumber, summary)}
        description={tPlural(t, 'linkedAccounts:LinkedAccounts.DisconnectedAccountsBanner.label.reconnect_accounts_below', {
          count: summary.count,
          one: 'Reconnect your account below to resume syncing transactions.',
          other: 'Reconnect your accounts below to resume syncing transactions.',
        })}
        slots={{ Icon: <CircleAlert size={20} /> }}
      />
    </HStack>
  )
}
