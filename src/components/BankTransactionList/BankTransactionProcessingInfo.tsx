import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '../Tooltip/Tooltip'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'

export const BankTransactionProcessingInfo = () => (
  <DeprecatedTooltip offset={12}>
    <DeprecatedTooltipTrigger><BookkeepingStatus status={BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER} text='Processing' /></DeprecatedTooltipTrigger>
    <DeprecatedTooltipContent className='Layer__tooltip' width='md'>
      {'Our team will review and categorize this transaction. We\'ll reach out if we have any questions about it.'}
    </DeprecatedTooltipContent>
  </DeprecatedTooltip>
)
