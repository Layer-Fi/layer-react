import { useState } from 'react'
import { CircleAlert, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useBookkeepingStatusContext } from '@providers/features/bookkeeping/BookkeepingStatusContext/BookkeepingStatusContext'
import { Button } from '@ui/Button/Button'

import './reverseLedgerEntryButton.scss'

interface ReverseLedgerEntryButtonProps {
  onReverse: () => Promise<void>
  /** When true the entry has already been reversed, so the action is disabled. */
  alreadyReversed?: boolean
}

export const ReverseLedgerEntryButton = ({ onReverse, alreadyReversed }: ReverseLedgerEntryButtonProps) => {
  const { t } = useTranslation()
  const { isActiveBookkeepingStatus } = useBookkeepingStatusContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleClick = async () => {
    try {
      setIsProcessing(true)
      setIsError(false)
      await onReverse()
    }
    catch {
      setIsError(true)
    }
    finally {
      setIsProcessing(false)
    }
  }

  if (isActiveBookkeepingStatus) {
    return null
  }

  return (
    <div className='Layer__LedgerEntryDetails__Reverse'>
      <Button
        variant='outlined'
        status='danger'
        onPress={() => { void handleClick() }}
        isPending={isProcessing}
        tooltip={
          alreadyReversed
            ? t('generalLedger:ReverseLedgerEntryButton.label.entry_reversed', 'This entry has already been reversed')
            : isError
              ? t('generalLedger:ReverseLedgerEntryButton.error.operation_retry', 'Operation failed. Try again.')
              : undefined
        }
        isDisabled={alreadyReversed || isProcessing}
      >
        {t('generalLedger:ReverseLedgerEntryButton.action.reverse_entry', 'Reverse entry')}
        {isError ? <CircleAlert size={12} /> : <RefreshCcw size={12} />}
      </Button>
    </div>
  )
}
