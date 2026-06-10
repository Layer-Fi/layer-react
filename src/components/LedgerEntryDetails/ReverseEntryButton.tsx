import { useState } from 'react'
import { CircleAlert, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ButtonVariant } from '@components/Button/Button'

import './reverseEntryButton.scss'

interface ReverseEntryButtonProps {
  onReverse: () => Promise<void>
  /** When true the entry has already been reversed, so the action is disabled. */
  alreadyReversed?: boolean
}

export const ReverseEntryButton = ({ onReverse, alreadyReversed }: ReverseEntryButtonProps) => {
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
        rightIcon={isError ? <CircleAlert size={12} /> : <RefreshCcw size={12} />}
        variant={ButtonVariant.secondary}
        onClick={isProcessing ? () => {} : handleClick}
        isProcessing={isProcessing}
        tooltip={
          alreadyReversed
            ? t('generalLedger:label.entry_reversed', 'This entry has already been reversed')
            : isError
              ? t('generalLedger:error.operation_retry', 'Operation failed. Try again.')
              : undefined
        }
        disabled={alreadyReversed}
      >
        {t('generalLedger:action.reverse_entry', 'Reverse entry')}
      </Button>
    </div>
  )
}
