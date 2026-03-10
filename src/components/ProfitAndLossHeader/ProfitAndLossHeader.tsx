import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { isAnyBankAccountSyncing } from '@utils/bankAccount'
import { useActiveBookkeepingPeriod } from '@hooks/features/bookkeeping/useActiveBookkeepingPeriod'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'
import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { HStack } from '@ui/Stack/Stack'
import { BookkeepingStatus } from '@components/BookkeepingStatus/BookkeepingStatus'
import { Header } from '@components/Container/Header'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { ProfitAndLossDownloadButton } from '@components/ProfitAndLossDownloadButton/ProfitAndLossDownloadButton'
import type { ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'
import { SyncingBadge } from '@components/SyncingBadge/SyncingBadge'
import { Heading, HeadingSize } from '@components/Typography/Heading'

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
  dateSelectionMode?: DateSelectionMode
}

export const ProfitAndLossHeader = ({
  text,
  className,
  headingClassName,
  withDatePicker,
  withDownloadButton,
  withStatus = true,
  stringOverrides,
  dateSelectionMode = 'full',
}: ProfitAndLossHeaderProps) => {
  const { t } = useTranslation()
  const { data: linkedAccounts } = useLinkedAccounts()

  const { activePeriod } = useActiveBookkeepingPeriod()
  const activePeriodStatus = activePeriod?.status

  const isSyncing = useMemo(
    () => isAnyBankAccountSyncing(linkedAccounts ?? []),
    [linkedAccounts],
  )

  return (
    <Header className={className}>
      <span className='Layer__component-header__title-wrapper Layer__profit-and-loss__header'>
        <Heading size={HeadingSize.secondary} className={headingClassName} align='left'>
          {stringOverrides?.title || text || t('profitLoss', 'Profit & Loss')}
        </Heading>
        {isSyncing && <SyncingBadge />}
        {withStatus && activePeriodStatus && (
          <span className='Layer__profit-and-loss-header__bookkeeping-status'>
            <BookkeepingStatus status={activePeriodStatus} monthNumber={activePeriod.month} />
          </span>
        )}
      </span>
      <HStack gap='xs'>
        {withDatePicker && <CombinedDateRangeSelection mode={dateSelectionMode} showLabels={false} />}
        {withDownloadButton && <ProfitAndLossDownloadButton stringOverrides={stringOverrides?.downloadButton} />}
      </HStack>
    </Header>
  )
}
