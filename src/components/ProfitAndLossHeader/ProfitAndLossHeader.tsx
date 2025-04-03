import { useMemo } from 'react'
import { Heading, HeadingSize } from '../../components/Typography'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import { Header } from '../Container'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { SyncingBadge } from '../SyncingBadge'
import { useGlobalDate } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import { useBookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriodStatus'

export interface ProfitAndLossHeaderProps {
  text?: string
  className?: string
  headingClassName?: string
  withDatePicker?: boolean
  withStatus?: boolean
}

export const ProfitAndLossHeader = ({
  text,
  className,
  headingClassName,
  withDatePicker,
  withStatus = true,
}: ProfitAndLossHeaderProps) => {
  const { data: linkedAccounts } = useLinkedAccounts()
  const { date } = useGlobalDate()

  const { status: bookkeepingMonthStatus } = useBookkeepingPeriodStatus({ currentMonthDate: date })

  const isSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  return (
    <Header className={className}>
      <span className='Layer__component-header__title-wrapper Layer__profit-and-loss__header'>
        <Heading size={HeadingSize.secondary} className={headingClassName} align='left'>
          {text || 'Profit & Loss'}
        </Heading>
        {isSyncing && <SyncingBadge />}
        {withStatus && bookkeepingMonthStatus && (
          <span className='Layer__profit-and-loss-header__bookkeeping-status'>
            <BookkeepingStatus status={bookkeepingMonthStatus} month={date.getMonth()} />
          </span>
        )}
      </span>
      {withDatePicker && <ProfitAndLoss.DatePicker />}
    </Header>
  )
}
