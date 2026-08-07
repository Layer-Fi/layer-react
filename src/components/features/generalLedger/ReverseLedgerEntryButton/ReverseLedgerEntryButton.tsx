import { useState } from 'react'
import { CircleAlert, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'

import './reverseLedgerEntryButton.scss'

interface ReverseLedgerEntryButtonProps {
  onReverse: () => Promise<void>
  /** When true the entry has already been reversed, so the action is disabled. */
  alreadyReversed?: boolean
  /** When true a bookkeeper owns the ledger, so the action is disabled. */
  isBookkeepingEnabled?: boolean
}

export const ReverseLedgerEntryButton = ({
  onReverse,
  alreadyReversed,
  isBookkeepingEnabled = false,
}: ReverseLedgerEntryButtonProps) => {
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

  const tooltip = alreadyReversed
    ? t('generalLedger:ReverseLedgerEntryButton.label.entry_reversed', 'This entry has already been reversed')
    : isBookkeepingEnabled
      ? t('generalLedger:ReverseLedgerEntryButton.label.bookkeeping_enabled', 'Reversing entries is not available while bookkeeping is enabled')
      : isError
        ? t('generalLedger:ReverseLedgerEntryButton.error.operation_retry', 'Operation failed. Try again.')
        : undefined

  return (
    <div className='Layer__LedgerEntryDetails__Reverse'>
      <Button
        variant='outlined'
        status='danger'
        onPress={() => { void handleClick() }}
        isPending={isProcessing}
        tooltip={tooltip}
        isDisabled={alreadyReversed || isProcessing || isBookkeepingEnabled}
      >
        {t('generalLedger:ReverseLedgerEntryButton.action.reverse_entry', 'Reverse entry')}
        {isError ? <CircleAlert size={12} /> : <RefreshCcw size={12} />}
      </Button>
    </div>
  )
}
