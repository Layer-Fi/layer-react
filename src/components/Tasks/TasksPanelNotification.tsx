import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { useBookkeepingYearsStatus } from '@hooks/features/bookkeeping/useBookkeepingYearsStatus'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
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
  const { formatNumber } = useIntlFormatter()
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
            {tPlural(t, 'bookkeeping:label.bank_accounts_disconnected', {
              count: disconnectedAccountsRequiringNotification,
              displayCount: formatNumber(disconnectedAccountsRequiringNotification),
              one: '{{displayCount}} bank account is disconnected',
              other: '{{displayCount}} bank accounts are disconnected',
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
              {tPlural(t, 'bookkeeping:label.reconnect_count_accounts', {
                count: disconnectedAccountsRequiringNotification,
                displayCount: formatNumber(disconnectedAccountsRequiringNotification),
                one: 'Reconnect {{displayCount}} account',
                other: 'Reconnect {{displayCount}} accounts',
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
    const displayYear = formatNumber(anyPreviousYearIncomplete.year, { useGrouping: false, maximumFractionDigits: 0 })
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
            {tPlural(t, 'bookkeeping:label.count_open_tasks', {
              count: unresolvedTasksCount,
              displayCount: formatNumber(unresolvedTasksCount),
              displayYear,
              one: '{{displayCount}} open task in {{displayYear}}',
              other: '{{displayCount}} open tasks in {{displayYear}}',
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
            {t('bookkeeping:action.view_and_complete', 'View and complete')}
          </Text>
          <ArrowRightCircle size={14} />
        </button>
      </div>
    )
  }

  return null
}
