import classNames from 'classnames'

import { type BankAccount } from '@internal-types/linkedAccounts'
import { getBankAccountDisplayName, getBankAccountInstitution, isBankAccountSyncing } from '@utils/bankAccount'
import { centsToDollars as formatMoney } from '@utils/money'
import InstitutionIcon from '@icons/InstitutionIcon'
import LoaderIcon from '@icons/Loader'
import { Text, type TextSize } from '@components/Typography/Text'

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
  slots,
}: LinkedAccountThumbProps) => {
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
    <Text as='span' className='account-balance'>
      {`${formatMoney(bankAccount.latest_balance_timestamp?.balance)}`}
    </Text>
  )

  return (
    <div className={linkedAccountThumbClassName}>
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
              <InstitutionIcon />
            )}
        </div>
      </div>
      {isSyncing
        ? (
          <div className='loadingbar'>
            <div className='loading-text Layer__text--sm'>
              <div>Syncing account data</div>
              <div className='syncing-data-description'>
                This may take up to 5 minutes
              </div>
            </div>
            <div className='loading-wrapper'>
              <LoaderIcon size={11} className='Layer__anim--rotating' />
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
                  Bank balance
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
                      Ledger balance
                    </Text>
                  )}
                <Text as='span' className='account-balance'>
                  {`${formatMoney(bankAccount.current_ledger_balance)}`}
                </Text>
              </div>
            )}
          </>
        )}
    </div>
  )
}
