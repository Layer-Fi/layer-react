import { Landmark, Loader, Unlink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { getBankAccountDisplayName, getBankAccountInstitution } from '@utils/features/bankAccounts/bankAccount'
import { isBankAccountReadyForRefresh } from '@utils/features/bankAccounts/refresh'
import { isBankAccountSyncing } from '@utils/features/bankAccounts/sync'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { ROTATING_CLASS_NAME } from '@utils/shared/styles/animationClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './linkedAccountCard.scss'

export interface LinkedAccountCardProps {
  bankAccount: BankAccount
  asWidget?: boolean
  showLedgerBalance?: boolean
  disconnection?: Pick<DisconnectedFooterProps, 'lastSyncedAt' | 'onReconnect'>
  slots: {
    Pill: React.ReactNode
  }
}

const AccountNumber = ({ accountNumber }: { accountNumber: string }) => (
  <div className='Layer__LinkedAccountCard__AccountNumber'>
    <Span size='sm' variant='inherit'>
      •••
      {accountNumber}
    </Span>
  </div>
)

type DisconnectedFooterProps = {
  institutionName: string | undefined
  lastSyncedAt: Date | null
  onReconnect: () => void
}

const DisconnectedFooter = ({ institutionName, lastSyncedAt, onReconnect }: DisconnectedFooterProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()

  return (
    <div className='Layer__LinkedAccountCard__Disconnected'>
      <VStack gap='4xs' className='Layer__LinkedAccountCard__DisconnectedText'>
        <HStack gap='2xs' align='center' className='Layer__LinkedAccountCard__DisconnectedLabel'>
          <Unlink size={12} strokeWidth={2.5} />
          <Span size='sm' weight='bold' variant='inherit'>
            {t('linkedAccounts:LinkedAccountCard.state.disconnected', 'Disconnected')}
          </Span>
        </HStack>
        {lastSyncedAt && (
          <Span size='sm' variant='subtle'>
            {t('linkedAccounts:LinkedAccountCard.label.last_sync_date', 'Last sync {{date}}', {
              date: formatDate(lastSyncedAt, DateFormat.MonthDayShort),
            })}
          </Span>
        )}
      </VStack>
      <Button
        variant='outlined'
        inset
        onPress={onReconnect}
        aria-label={institutionName
          ? t('linkedAccounts:LinkedAccountCard.action.reconnect_institution', 'Reconnect {{institutionName}}', { institutionName })
          : undefined}
      >
        {t('linkedAccounts:LinkedAccountCard.action.reconnect', 'Reconnect')}
      </Button>
    </div>
  )
}

export const LinkedAccountCard = ({
  bankAccount,
  asWidget,
  showLedgerBalance,
  disconnection,
  slots,
}: LinkedAccountCardProps) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const isSyncing = isBankAccountSyncing(bankAccount)
  const isReadyForRefresh = isBankAccountReadyForRefresh(bankAccount)
  const displayName = getBankAccountDisplayName(bankAccount)
  const institution = getBankAccountInstitution(bankAccount)
  const institutionName = institution?.name
  const institutionLogo = institution?.logo

  const dataProperties = toDataProperties({
    'as-widget': asWidget,
    'ready-for-refresh': isReadyForRefresh,
    'syncing': isSyncing,
    'show-ledger-balance': showLedgerBalance,
  })

  const headerDataProperties = toDataProperties({
    'syncing': isSyncing,
    'hide-ledger-balance': !(showLedgerBalance || isSyncing),
  })

  const bankBalance = slots.Pill ?? (
    <Span>
      {formatCurrencyFromCents(bankAccount.latestBalanceTimestamp?.balance)}
    </Span>
  )

  return (
    <div {...dataProperties} className='Layer__LinkedAccountCard'>
      <div {...headerDataProperties} className='Layer__LinkedAccountCard__Header'>
        <div className='Layer__LinkedAccountCard__HeaderDetails'>
          <Span variant='inherit' ellipsis withTooltip>{displayName}</Span>
          {!asWidget && bankAccount.mask && (
            <AccountNumber accountNumber={bankAccount.mask} />
          )}
          <Span size='sm' variant='subtle' ellipsis withTooltip>
            {institutionName || displayName}
          </Span>
        </div>
        <div className='Layer__LinkedAccountCard__HeaderLogo'>
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
          <div className='Layer__LinkedAccountCard__Syncing'>
            <VStack className='Layer__LinkedAccountCard__SyncingText'>
              <Span size='sm' variant='inherit'>
                {t('linkedAccounts:LinkedAccountCard.state.syncing_account_data', 'Syncing account data')}
              </Span>
              <Span size='sm' variant='subtle'>
                {t('linkedAccounts:LinkedAccountCard.label.may_take_up_to_5_minutes', 'This may take up to 5 minutes')}
              </Span>
            </VStack>
            <div className='Layer__LinkedAccountCard__SyncingIcon'>
              <Loader size={11} className={ROTATING_CLASS_NAME} />
            </div>
          </div>
        )
        : (
          <>
            {disconnection && (
              <DisconnectedFooter institutionName={institutionName} {...disconnection} />
            )}
            {!disconnection && !asWidget && (
              <div className='Layer__LinkedAccountCard__Balance'>
                <Span size='sm' variant='subtle' pb='sm'>
                  {t('linkedAccounts:LinkedAccountCard.label.bank_balance', 'Bank balance')}
                </Span>
                {bankBalance}
              </div>
            )}
            {!disconnection && showLedgerBalance && (
              <div className='Layer__LinkedAccountCard__Footer'>
                {asWidget && bankAccount.mask
                  ? (
                    <AccountNumber accountNumber={bankAccount.mask} />
                  )
                  : (
                    <Span size='sm' variant='subtle'>
                      {t('linkedAccounts:LinkedAccountCard.label.ledger_balance', 'Ledger balance')}
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
