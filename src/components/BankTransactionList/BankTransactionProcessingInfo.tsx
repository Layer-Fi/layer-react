import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip/Tooltip'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'

export const BankTransactionProcessingInfo = () => (
  <Tooltip offset={12}>
    <TooltipTrigger><BookkeepingStatus status='IN_PROGRESS_AWAITING_BOOKKEEPER' text='Processing' /></TooltipTrigger>
    <TooltipContent width='md'>
      {'Our team will review and categorize this transaction. We\'ll reach out if we have any questions about it.'}
    </TooltipContent>
  </Tooltip>
)
