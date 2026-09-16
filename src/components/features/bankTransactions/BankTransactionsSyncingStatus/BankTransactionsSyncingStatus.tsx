import classNames from 'classnames'
import { RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { SmallLoader } from '@ui/Loader/SmallLoader'

import './bankTransactionsSyncingStatus.scss'

interface BankTransactionsSyncingStatusProps {
  titleVariant?: 'default' | 'historical'
  onRefresh?: () => void
  timeSync?: number
  inProgress?: boolean
  hideContent?: boolean
}

export const BankTransactionsSyncingStatus = ({
  titleVariant = 'default',
  onRefresh,
  inProgress = false,
  timeSync = 1440,
  hideContent = false,
}: BankTransactionsSyncingStatusProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const handleRefresh = () => {
    if (onRefresh) onRefresh()
  }

  const getSyncDurationMessage = () => {
    if (timeSync > 60) {
      const hours = Math.floor(timeSync / 60)
      return tPlural(t, 'bankTransactions:BankTransactionsSyncingStatus.label.may_take_up_to_hours', {
        count: hours,
        displayCount: formatNumber(hours),
        one: 'This may take up to {{displayCount}} hour.',
        other: 'This may take up to {{displayCount}} hours.',
      })
    }
    return tPlural(t, 'bankTransactions:BankTransactionsSyncingStatus.label.may_take_up_to_minutes', {
      count: timeSync,
      displayCount: formatNumber(timeSync),
      one: 'This may take up to {{displayCount}} minute.',
      other: 'This may take up to {{displayCount}} minutes.',
    })
  }

  const title = titleVariant === 'historical'
    ? t('bankTransactions:BankTransactionsSyncingStatus.state.syncing_historical_account_data', 'Syncing historical account data')
    : t('bankTransactions:BankTransactionsSyncingStatus.state.syncing_account_data', 'Syncing account data')

  return (
    <div
      className={classNames(
        'Layer__syncing-component',
        inProgress ? 'Layer__syncing-component--with-border' : '',
      )}
    >
      <div className='Layer__syncing-component__actions'>
        {inProgress
          ? (
            <SmallLoader />
          )
          : (
            <Button variant='ghost' icon onPress={handleRefresh} aria-label={t('common:action.refresh_label', 'Refresh')}>
              <RefreshCcw size={18} />
            </Button>
          )}
      </div>
      {!hideContent && (
        <div className='Layer__syncing-component__content'>
          <div className='Layer__syncing-component__title'>{title}</div>
          <div className='Layer__syncing-component__message'>{getSyncDurationMessage()}</div>
        </div>
      )}
    </div>
  )
}
