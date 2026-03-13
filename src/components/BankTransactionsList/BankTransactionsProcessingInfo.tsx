import { useTranslation } from 'react-i18next'

import { BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import Clock from '@icons/Clock'
import { HStack } from '@ui/Stack/Stack'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { BookkeepingStatus } from '@components/BookkeepingStatus/BookkeepingStatus'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

import './bankTransactionsProcessingInfo.scss'
interface BankTransactionsProcessingInfoProps {
  showAsBadge?: boolean
}

export const BankTransactionsProcessingInfo = ({ showAsBadge = false }: BankTransactionsProcessingInfoProps) => {
  const { t } = useTranslation()
  const tooltipContent = t('ourTeamWillReviewAndCategorizeThisTransactionWellReachOutIfWeHaveAnyQuestionsAboutIt', 'Our team will review and categorize this transaction. We\'ll reach out if we have any questions about it.')

  if (showAsBadge) {
    return (
      <HStack gap='xs' align='center' fluid className='Layer__BankTransactionsProcessingInfo'>
        <Badge
          size={BadgeSize.SMALL}
          icon={<Clock size={11} />}
          variant={BadgeVariant.INFO}
        >
          {t('processing', 'Processing')}
        </Badge>
      </HStack>
    )
  }

  return (
    <DeprecatedTooltip offset={12}>
      <DeprecatedTooltipTrigger><BookkeepingStatus status={BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER} text='Processing' /></DeprecatedTooltipTrigger>
      <DeprecatedTooltipContent className='Layer__tooltip' width='md'>
        {tooltipContent}
      </DeprecatedTooltipContent>
    </DeprecatedTooltip>
  )
}
