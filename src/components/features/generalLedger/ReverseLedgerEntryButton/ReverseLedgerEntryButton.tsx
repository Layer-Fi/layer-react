import { useState } from 'react'
import { CircleAlert, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'

import './reverseLedgerEntryButton.scss'

interface ReverseLedgerEntryButtonProps {
  onReverse: () => Promise<void>
  /** When true the entry has already been reversed, so the action is disabled. */
  alreadyReversed?: boolean
}

export const ReverseLedgerEntryButton = ({ onReverse, alreadyReversed }: ReverseLedgerEntryButtonProps) => {
  const { t } = useTranslation()
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

  return (
    <div className='Layer__LedgerEntryDetails__Reverse'>
      <Button
        variant='outlined'
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
