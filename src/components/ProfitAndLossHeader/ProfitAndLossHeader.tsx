import { Heading, HeadingSize } from '../../components/Typography/Heading'
import { useMemo } from 'react'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts/useLinkedAccounts'
import { Header } from '../Container/Header'
import { SyncingBadge } from '../SyncingBadge/SyncingBadge'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import { useActiveBookkeepingPeriod } from '../../hooks/bookkeeping/periods/useActiveBookkeepingPeriod'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker/ProfitAndLossDatePicker'
import { ProfitAndLossDownloadButton } from '../ProfitAndLossDownloadButton/ProfitAndLossDownloadButton'
import { HStack } from '../ui/Stack/Stack'
import type { ProfitAndLossDownloadButtonStringOverrides } from '../ProfitAndLossDownloadButton/types'
import './profitAndLossHeader.scss'

interface ProfitAndLossHeaderStringOverrides {
  title?: string
  downloadButton?: ProfitAndLossDownloadButtonStringOverrides
}
export interface ProfitAndLossHeaderProps {
  /**
   * @deprecated Use `stringOverrides.title` instead
   */
  text?: string
  className?: string
  headingClassName?: string
  stringOverrides?: ProfitAndLossHeaderStringOverrides
  withDatePicker?: boolean
  withDownloadButton?: boolean
  withStatus?: boolean
}

export const ProfitAndLossHeader = ({
  text,
  className,
  headingClassName,
  withDatePicker,
  withDownloadButton,
  withStatus = true,
  stringOverrides,
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
          {stringOverrides?.title || text || 'Profit & Loss'}
        </Heading>
        {isSyncing && <SyncingBadge />}
        {withStatus && activePeriodStatus && (
          <span className='Layer__profit-and-loss-header__bookkeeping-status'>
            <BookkeepingStatus status={activePeriodStatus} monthNumber={activePeriod.month} />
          </span>
        )}
      </span>
      <HStack gap='xs'>
        {withDatePicker && <ProfitAndLossDatePicker />}
        {withDownloadButton && <ProfitAndLossDownloadButton stringOverrides={stringOverrides?.downloadButton} />}
      </HStack>
    </Header>
  )
}
