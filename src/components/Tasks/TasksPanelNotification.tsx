import pluralize from 'pluralize'

import { useBookkeepingYearsStatus } from '@hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import { useBankAccounts } from '@hooks/bookkeeping/useBankAccounts'
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
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()
  const { anyPreviousYearIncomplete, earliestIncompletePeriod } =
    useBookkeepingYearsStatus()
  const { disconnectedAccountsRequiringNotification, isLoading } =
    useBankAccounts()

  if (!isLoading && disconnectedAccountsRequiringNotification > 0) {
    return (
      <div className='Layer__tasks-header__notification' data-status='error'>
        <div className='Layer__tasks-header__notification__text'>
          <Text>
            <AlertCircle size={11} />
          </Text>
          <Text size={TextSize.md} weight={TextWeight.bold}>
            {disconnectedAccountsRequiringNotification === 1
              ? '1 bank account is disconnected'
              : `${disconnectedAccountsRequiringNotification} bank accounts are disconnected`}
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
              Reconnect
              {' '}
              {pluralize('account', disconnectedAccountsRequiringNotification)}
            </Text>
            <ArrowRightCircle size={14} />
          </button>
        )}
      </div>
    )
  }

  if (anyPreviousYearIncomplete && earliestIncompletePeriod) {
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
            {pluralize(
              'open task',
              anyPreviousYearIncomplete.unresolvedTasks,
              true,
            )}
            {' in '}
            {anyPreviousYearIncomplete.year}
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
            View and complete
          </Text>
          <ArrowRightCircle size={14} />
        </button>
      </div>
    )
  }

  return null
}
