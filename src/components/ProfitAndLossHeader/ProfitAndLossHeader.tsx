import { useMemo } from 'react'
import { Heading, HeadingSize } from '../../components/Typography'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import { Header } from '../Container'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { SyncingBadge } from '../SyncingBadge'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import { useActiveBookkeepingPeriod } from '../../hooks/bookkeeping/periods/useActiveBookkeepingPeriod'

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

  const { activePeriod } = useActiveBookkeepingPeriod()
  const activePeriodStatus = activePeriod?.status

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
        {withStatus && activePeriodStatus && (
          <span className='Layer__profit-and-loss-header__bookkeeping-status'>
            <BookkeepingStatus status={activePeriodStatus} monthNumber={activePeriod.month} />
          </span>
        )}
      </span>
      {withDatePicker && <ProfitAndLoss.DatePicker />}
    </Header>
  )
}
