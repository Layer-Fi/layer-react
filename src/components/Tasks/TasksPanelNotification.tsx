import { CircleAlert, CircleArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DateFormat } from '@utils/i18n/date/patterns'
import { tPlural } from '@utils/i18n/plural'
import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { useBookkeepingYearsStatus } from '@hooks/features/bookkeeping/useBookkeepingYearsStatus'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDatePeriodAlignedActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { P } from '@ui/Typography/Text'

type TasksPanelNotificationProps = {
  onClickReconnectAccounts?: () => void
}

export const TasksPanelNotification = ({
  onClickReconnectAccounts,
}: TasksPanelNotificationProps) => {
  const { t } = useTranslation()
  const { formatNumber, formatDate } = useIntlFormatter()
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()
  const { anyPreviousYearIncomplete, earliestIncompletePeriod } =
    useBookkeepingYearsStatus()
  const { disconnectedAccountsRequiringNotification, isLoading } =
    useListBankAccounts()

  if (!isLoading && disconnectedAccountsRequiringNotification > 0) {
    return (
      <div className='Layer__tasks-header__notification' data-status='error'>
        <div className='Layer__tasks-header__notification__text'>
          <P variant='inherit'>
            <CircleAlert size={11} />
          </P>
          <P weight='bold' variant='inherit'>
            {tPlural(t, 'bookkeeping:label.bank_accounts_disconnected', {
              count: disconnectedAccountsRequiringNotification,
              displayCount: formatNumber(disconnectedAccountsRequiringNotification),
              one: '{{displayCount}} bank account is disconnected',
              other: '{{displayCount}} bank accounts are disconnected',
            })}
          </P>
        </div>
        {onClickReconnectAccounts && (
          <button
            className='Layer__tasks-header__notification__button'
            onClick={() => {
              onClickReconnectAccounts()
            }}
          >
            <P size='sm' weight='bold' variant='inherit'>
              {tPlural(t, 'bookkeeping:label.reconnect_count_accounts', {
                count: disconnectedAccountsRequiringNotification,
                displayCount: formatNumber(disconnectedAccountsRequiringNotification),
                one: 'Reconnect {{displayCount}} account',
                other: 'Reconnect {{displayCount}} accounts',
              })}
            </P>
            <CircleArrowRight size={14} />
          </button>
        )}
      </div>
    )
  }

  if (anyPreviousYearIncomplete && earliestIncompletePeriod) {
    const unresolvedTasksCount = anyPreviousYearIncomplete.unresolvedTasks ?? 0
    const displayYear = formatDate(new Date(anyPreviousYearIncomplete.year, 0, 1), DateFormat.Year)
    return (
      <div className='Layer__tasks-header__notification' data-status='warning'>
        <div className='Layer__tasks-header__notification__text'>
          <P status='warning' invert>
            <CircleAlert size={11} />
          </P>
          <P size='sm' weight='bold' status='warning' invert>
            {tPlural(t, 'bookkeeping:label.count_open_tasks', {
              count: unresolvedTasksCount,
              displayCount: formatNumber(unresolvedTasksCount),
              displayYear,
              one: '{{displayCount}} open task in {{displayYear}}',
              other: '{{displayCount}} open tasks in {{displayYear}}',
            })}
          </P>
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
          <P size='sm' weight='bold' status='warning' invert>
            {t('bookkeeping:action.view_and_complete', 'View and complete')}
          </P>
          <CircleArrowRight size={14} />
        </button>
      </div>
    )
  }

  return null
}
