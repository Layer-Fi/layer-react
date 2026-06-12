import classNames from 'classnames'
import { Landmark, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankAccount } from '@schemas/bankAccounts/bankAccount'
import { getBankAccountDisplayName, getBankAccountInstitution, isBankAccountSyncing } from '@utils/bankAccount'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

export interface LinkedAccountThumbProps {
  bankAccount: BankAccount
  asWidget?: boolean
  showLedgerBalance?: boolean
  slots: {
    Pill: React.ReactNode
  }
}

const AccountNumber = ({ accountNumber }: { accountNumber: string }) => (
  <div className='account-number'>
    <Span size='sm' variant='inherit'>
      •••
      {accountNumber}
    </Span>
  </div>
)

export const LinkedAccountThumb = ({
  bankAccount,
  asWidget,
  showLedgerBalance,
  slots,
}: LinkedAccountThumbProps) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const isSyncing = isBankAccountSyncing(bankAccount)
  const displayName = getBankAccountDisplayName(bankAccount)
  const institution = getBankAccountInstitution(bankAccount)
  const institutionName = institution?.name
  const institutionLogo = institution?.logo

  const linkedAccountThumbClassName = classNames(
    'Layer__linked-account-thumb',
    asWidget && '--as-widget',
    isSyncing && '--is-syncing',
    isSyncing && 'skeleton-loader',
    showLedgerBalance && '--show-ledger-balance',
  )

  const linkedAccountInfoClassName = classNames(
    'topbar',
    isSyncing && '--is-syncing',
    !(showLedgerBalance || isSyncing) && '--hide-ledger-balance',
  )

  const bankBalance = slots.Pill ?? (
    <Span>
      {formatCurrencyFromCents(bankAccount.latestBalanceTimestamp?.balance)}
    </Span>
  )

  return (
    <div className={linkedAccountThumbClassName}>
      <div className={linkedAccountInfoClassName}>
        <div className='topbar-details'>
          <Span variant='inherit' ellipsis>{displayName}</Span>
          {!asWidget && bankAccount.mask && (
            <AccountNumber accountNumber={bankAccount.mask} />
          )}
          <Span size='sm' variant='subtle' noWrap>
            {institutionName || displayName}
          </Span>
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
            <VStack className='loading-text'>
              <Span size='sm' variant='inherit'>
                {t('linkedAccounts:state.syncing_account_data', 'Syncing account data')}
              </Span>
              <Span size='sm' variant='subtle'>
                {t('linkedAccounts:label.may_take_up_to_5_minutes', 'This may take up to 5 minutes')}
              </Span>
            </VStack>
            <div className='loading-wrapper'>
              <Loader size={11} className='Layer__anim--rotating' />
            </div>
          </div>
        )
        : (
          <>
            {!asWidget && (
              <div className='middlebar'>
                <Span size='sm' variant='subtle' pb='sm'>
                  {t('linkedAccounts:label.bank_balance', 'Bank balance')}
                </Span>
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
                    <Span size='sm' variant='subtle'>
                      {t('linkedAccounts:label.ledger_balance', 'Ledger balance')}
                    </Span>
                  )}
                <MoneySpan amount={bankAccount.currentLedgerBalance} />
              </div>
            )}
          </>
        )}
    </div>
  )
}
