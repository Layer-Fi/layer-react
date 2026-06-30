import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useActiveBookkeepingPeriod } from '@hooks/features/bookkeeping/useActiveBookkeepingPeriod'
import { useBankAccountsContext } from '@contexts/BankAccountsContext/BankAccountsContext'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { BookkeepingStatus } from '@components/BookkeepingStatus/BookkeepingStatus'
import { Header } from '@components/Container/Header'
import type { ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'
import { SyncingBadge } from '@components/SyncingBadge/SyncingBadge'

interface ProfitAndLossHeaderStringOverrides {
  title?: string
  /**
   * @deprecated There is no longer a download button in this header
   */
  downloadButton?: ProfitAndLossDownloadButtonStringOverrides
}
export interface ProfitAndLossHeaderProps {
  className?: string
  stringOverrides?: ProfitAndLossHeaderStringOverrides
  withStatus?: boolean
  trailingContent?: ReactNode
}

export const ProfitAndLossHeader = ({
  className,
  withStatus = true,
  stringOverrides,
  trailingContent,
}: ProfitAndLossHeaderProps) => {
  const { t } = useTranslation()
  const { isSyncing } = useBankAccountsContext()

  const { activePeriod } = useActiveBookkeepingPeriod()
  const activePeriodStatus = activePeriod?.status

  return (
    <Header className={className}>
      <VStack gap='xs' fluid>
        <HStack fluid justify='space-between' align='center'>
          <HStack align='center' gap='sm'>
            <Heading level={3} size='sm' align='left'>
              {stringOverrides?.title || t('common:label.profit_loss', 'Profit & Loss')}
            </Heading>
            {isSyncing && <SyncingBadge />}
          </HStack>
          {trailingContent}
        </HStack>
        {withStatus && activePeriodStatus && (
          <BookkeepingStatus status={activePeriodStatus} monthNumber={activePeriod.month} />
        )}
      </VStack>
    </Header>
  )
}
