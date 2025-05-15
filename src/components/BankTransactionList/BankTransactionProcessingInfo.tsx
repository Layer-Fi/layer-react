import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip/Tooltip'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'

export const BankTransactionProcessingInfo = () => (
  <Tooltip offset={12}>
    <TooltipTrigger><BookkeepingStatus status={BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER} text='Processing' /></TooltipTrigger>
    <TooltipContent className='Layer__tooltip' width='md'>
      {'Our team will review and categorize this transaction. We\'ll reach out if we have any questions about it.'}
    </TooltipContent>
  </Tooltip>
)
