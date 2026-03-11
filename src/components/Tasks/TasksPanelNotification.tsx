import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18nPlural'
import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { useBookkeepingYearsStatus } from '@hooks/features/bookkeeping/useBookkeepingYearsStatus'
import { useGlobalDatePeriodAlignedActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import AlertCircle from '@icons/AlertCircle'
import ArrowRightCircle from '@icons/ArrowRightCircle'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

type TasksPanelNotificationProps = {
  onClickReconnectAccounts?: () => void
}

export const TasksPanelNotification = ({
  onClickReconnectAccounts,
}: TasksPanelNotificationProps) => {
  const { t } = useTranslation()
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()
  const { anyPreviousYearIncomplete, earliestIncompletePeriod } =
    useBookkeepingYearsStatus()
  const { disconnectedAccountsRequiringNotification, isLoading } =
    useListBankAccounts()

  if (!isLoading && disconnectedAccountsRequiringNotification > 0) {
    return (
      <div className='Layer__tasks-header__notification' data-status='error'>
        <div className='Layer__tasks-header__notification__text'>
          <Text>
            <AlertCircle size={11} />
          </Text>
          <Text size={TextSize.md} weight={TextWeight.bold}>
            {tPlural(t, 'bankAccountsAreDisconnected', {
              count: disconnectedAccountsRequiringNotification,
              one: '{{count}} bank account is disconnected',
              other: '{{count}} bank accounts are disconnected',
            })}
          </Text>
        </div>
        {onClickReconnectAccounts && (
          <button
            className='Layer__tasks-header__notification__button'
            onClick={() => {
              onClickReconnectAccounts()
            }}
          >
            <Text size={TextSize.sm} weight={TextWeight.bold}>
              {tPlural(t, 'reconnectCountAccounts', {
                count: disconnectedAccountsRequiringNotification,
                one: 'Reconnect {{count}} account',
                other: 'Reconnect {{count}} accounts',
              })}
            </Text>
            <ArrowRightCircle size={14} />
          </button>
        )}
      </div>
    )
  }

  if (anyPreviousYearIncomplete && earliestIncompletePeriod) {
    const unresolvedTasksCount = anyPreviousYearIncomplete.unresolvedTasks ?? 0
    return (
      <div className='Layer__tasks-header__notification' data-status='warning'>
        <div className='Layer__tasks-header__notification__text'>
          <Text status='warning' invertColor>
            <AlertCircle size={11} />
          </Text>
          <Text
            size={TextSize.sm}
            weight={TextWeight.bold}
            status='warning'
            invertColor
          >
            {tPlural(t, 'countOpenTasksInYear', {
              count: unresolvedTasksCount,
              year: anyPreviousYearIncomplete.year,
              one: '{{count}} open task in {{year}}',
              other: '{{count}} open tasks in {{year}}',
            })}
          </Text>
        </div>
        <button
          className='Layer__tasks-header__notification__button'
          onClick={() => {
            setMonthByPeriod({
              monthNumber: earliestIncompletePeriod.month,
              yearNumber: earliestIncompletePeriod.year,
            })
          }}
        >
          <Text size={TextSize.sm} weight={TextWeight.bold}>
            {t('viewAndComplete', 'View and complete')}
          </Text>
          <ArrowRightCircle size={14} />
        </button>
      </div>
    )
  }

  return null
}
