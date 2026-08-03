import { type ReactNode } from 'react'
import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useActiveBookkeepingPeriod } from '@hooks/features/bookkeeping/useActiveBookkeepingPeriod'
import { useBankAccountsContext } from '@providers/linkedAccounts/BankAccountsContext/BankAccountsContext'
import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { DeprecatedHeader } from '@blocks/Layout/DeprecatedHeader/DeprecatedHeader'
import { BookkeepingStatus } from '@features/bookkeeping/BookkeepingStatus/BookkeepingStatus'
import type { ProfitAndLossDownloadButtonStringOverrides } from '@features/profitAndLoss/ProfitAndLossDownloadButton/types'

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
    <DeprecatedHeader className={className}>
      <VStack gap='xs' fluid>
        <HStack fluid justify='space-between' align='center'>
          <HStack align='center' gap='sm'>
            <Heading level={3} size='sm' align='left'>
              {stringOverrides?.title || t('common:label.profit_loss', 'Profit & Loss')}
            </Heading>
            {isSyncing && (
              <Badge
                icon={<Loader className='Layer__anim--rotating' size={12} />}
                size={BadgeSize.SMALL}
                variant={BadgeVariant.INFO}
              >
                {t('common:state.syncing', 'Syncing...')}
              </Badge>
            )}
          </HStack>
          {trailingContent}
        </HStack>
        {withStatus && activePeriodStatus && (
          <BookkeepingStatus status={activePeriodStatus} monthNumber={activePeriod.month} />
        )}
      </VStack>
    </DeprecatedHeader>
  )
}
