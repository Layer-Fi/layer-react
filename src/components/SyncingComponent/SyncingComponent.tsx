import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import RefreshCcw from '@icons/RefreshCcw'
import { IconButton } from '@components/Button/IconButton'
import { SmallLoader } from '@components/Loader/SmallLoader'

interface SyncingComponentProps {
  titleVariant?: 'default' | 'historical'
  onRefresh?: () => void
  timeSync?: number
  inProgress?: boolean
  hideContent?: boolean
}

/**
 * SyncingComponent
 * @param titleVariant - Title variant for the component
 * @param onRefresh - Function to refresh the component
 * @param timeSync - Time to sync in minutes
 * @param inProgress - Show progress icon besides button
 * @param hideContent - Hide content of the component
 *
 * @example
 * <SyncingComponent
 *  titleVariant='default'
 *  onRefresh={() => console.log('refresh')}
 *  timeSync={1440}
 *  inProgress={false}
 *  hideContent={false}
 * />
 */
export const SyncingComponent = ({
  titleVariant = 'default',
  onRefresh,
  inProgress = false,
  timeSync = 1440,
  hideContent = false,
}: SyncingComponentProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const handleRefresh = () => {
    if (onRefresh) onRefresh()
  }

  const getSyncDurationMessage = () => {
    if (timeSync > 60) {
      const hours = Math.floor(timeSync / 60)
      return tPlural(t, 'linkedAccounts:label.may_take_up_to_hours', {
        count: hours,
        displayCount: formatNumber(hours),
        one: 'This may take up to {{displayCount}} hour.',
        other: 'This may take up to {{displayCount}} hours.',
      })
    }
    return tPlural(t, 'linkedAccounts:label.may_take_up_to_minutes', {
      count: timeSync,
      displayCount: formatNumber(timeSync),
      one: 'This may take up to {{displayCount}} minute.',
      other: 'This may take up to {{displayCount}} minutes.',
    })
  }

  const title = titleVariant === 'historical'
    ? t('linkedAccounts:state.syncing_historical_account_data', 'Syncing historical account data')
    : t('linkedAccounts:state.syncing_account_data', 'Syncing account data')

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
            <IconButton icon={<RefreshCcw />} onClick={handleRefresh} />
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
