import { BookkeepingPeriodStatus } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import { BookkeepingStatus } from '@components/BookkeepingStatus/BookkeepingStatus'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

export const BankTransactionsProcessingInfo = () => (
  <DeprecatedTooltip offset={12}>
    <DeprecatedTooltipTrigger><BookkeepingStatus status={BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER} text='Processing' /></DeprecatedTooltipTrigger>
    <DeprecatedTooltipContent className='Layer__tooltip' width='md'>
      {'Our team will review and categorize this transaction. We\'ll reach out if we have any questions about it.'}
    </DeprecatedTooltipContent>
  </DeprecatedTooltip>
)
