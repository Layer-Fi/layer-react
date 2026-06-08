import classNames from 'classnames'
import { Landmark, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankAccount } from '@schemas/bankAccounts/bankAccount'
import { getBankAccountDisplayName, getBankAccountInstitution, isBankAccountSyncing } from '@utils/bankAccount'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Text, type TextSize } from '@components/Typography/Text'

export interface LinkedAccountThumbProps {
  bankAccount: BankAccount
  asWidget?: boolean
  showLedgerBalance?: boolean
  isFilterSelectable?: boolean
  isFilterSelected?: boolean
  onToggleFilter?: () => void
  slots: {
    Pill: React.ReactNode
  }
}

const AccountNumber = ({ accountNumber }: { accountNumber: string }) => (
  <div className='account-number'>
    <Text size={'sm' as TextSize}>
      •••
      {accountNumber}
    </Text>
  </div>
)

export const LinkedAccountThumb = ({
  bankAccount,
  asWidget,
  showLedgerBalance,
  isFilterSelectable = false,
  isFilterSelected = false,
  onToggleFilter,
  slots,
}: LinkedAccountThumbProps) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const isSyncing = isBankAccountSyncing(bankAccount)
  const displayName = getBankAccountDisplayName(bankAccount)
  const institution = getBankAccountInstitution(bankAccount)
  const institutionName = institution?.name
  const institutionLogo = institution?.logo

  const isFilterInteractive = isFilterSelectable && onToggleFilter != null

  const linkedAccountThumbClassName = classNames(
    'Layer__linked-account-thumb',
    asWidget && '--as-widget',
    isSyncing && '--is-syncing',
    isSyncing && 'skeleton-loader',
    showLedgerBalance && '--show-ledger-balance',
    isFilterInteractive && '--selectable',
    isFilterSelected && '--selected',
  )

  const isEventFromNestedControl = (event: React.SyntheticEvent) => {
    const target = event.target as Element | null
    const interactive = target?.closest('button, a, input, select, textarea, [role="button"], [role="menuitem"]')
    return interactive != null && interactive !== event.currentTarget
  }

  const filterToggleProps = isFilterInteractive
    ? {
      'role': 'button',
      'tabIndex': 0,
      'aria-pressed': isFilterSelected,
      'onClick': (event: React.MouseEvent<HTMLDivElement>) => {
        if (isEventFromNestedControl(event)) return
        onToggleFilter()
      },
      'onKeyDown': (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        if (isEventFromNestedControl(event)) return
        event.preventDefault()
        onToggleFilter()
      },
    }
    : {}

  const linkedAccountInfoClassName = classNames(
    'topbar',
    isSyncing && '--is-syncing',
    !(showLedgerBalance || isSyncing) && '--hide-ledger-balance',
  )

  const bankBalance = slots.Pill ?? (
    <Text as='span' className='account-balance'>
      {formatCurrencyFromCents(bankAccount.latestBalanceTimestamp?.balance)}
    </Text>
  )

  return (
    <div className={linkedAccountThumbClassName} {...filterToggleProps}>
      <div className={linkedAccountInfoClassName}>
        <div className='topbar-details'>
          <Text as='div' className='account-name'>
            {displayName}
          </Text>
          {!asWidget && bankAccount.mask && (
            <AccountNumber accountNumber={bankAccount.mask} />
          )}
          <Text
            as='span'
            className='account-institution'
            size={'sm' as TextSize}
          >
            {institutionName || displayName}
          </Text>
        </div>
        <div className='topbar-logo'>
          {institutionLogo != undefined
            ? (
              <img
                width={28}
                height={28}
                src={`data:image/png;base64,${institutionLogo}`}
                alt={institutionName || displayName}
              />
            )
            : (
              <Landmark size={18} />
            )}
        </div>
      </div>
      {isSyncing
        ? (
          <div className='loadingbar'>
            <div className='loading-text Layer__text--sm'>
              <div>{t('linkedAccounts:state.syncing_account_data', 'Syncing account data')}</div>
              <div className='syncing-data-description'>
                {t('linkedAccounts:label.may_take_up_to_5_minutes', 'This may take up to 5 minutes')}
              </div>
            </div>
            <div className='loading-wrapper'>
              <Loader size={11} className='Layer__anim--rotating' />
            </div>
          </div>
        )
        : (
          <>
            {!asWidget && (
              <div className='middlebar'>
                <Text
                  as='span'
                  className={classNames(
                    'account-balance-text',
                    !showLedgerBalance && '--hide-ledger-balance',
                  )}
                  size={'sm' as TextSize}
                >
                  {t('linkedAccounts:label.bank_balance', 'Bank balance')}
                </Text>
                {bankBalance}
              </div>
            )}
            {showLedgerBalance && (
              <div className='bottombar'>
                {asWidget && bankAccount.mask
                  ? (
                    <AccountNumber accountNumber={bankAccount.mask} />
                  )
                  : (
                    <Text
                      as='span'
                      className='account-balance-text'
                      size={'sm' as TextSize}
                    >
                      {t('linkedAccounts:label.ledger_balance', 'Ledger balance')}
                    </Text>
                  )}
                <Text as='span' className='account-balance'>
                  {formatCurrencyFromCents(bankAccount.currentLedgerBalance)}
                </Text>
              </div>
            )}
          </>
        )}
    </div>
  )
}
