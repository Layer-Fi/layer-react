import { useCallback } from 'react'
import pluralize from 'pluralize'

import ChevronRight from '@icons/ChevronRight'
import UploadCloud from '@icons/UploadCloud'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Button, ButtonVariant } from '@components/Button/Button'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Separator } from '@components/Separator/Separator'
import { useWizard } from '@components/Wizard/Wizard'
import { ManageUploadTransactionsStep } from './types'

type ManageUploadTransactionsConfirmationStepProps = {
  onRestartFlow: () => void
  transactionsCount: number
}

export function DeleteUploadTransactionsConfirmationStep({ onRestartFlow, transactionsCount }: ManageUploadTransactionsConfirmationStepProps) {
  const { goToStep, next } = useWizard()
  const goRestartFlow = useCallback(() => {
    onRestartFlow()
    goToStep(ManageUploadTransactionsStep.ManageUploads)
  }, [onRestartFlow, goToStep])

  return (
    <VStack gap='lg'>
      <DataState
        className='Layer__upload-transactions__confirmation-step__data-state'
        status={DataStateStatus.success}
        title='Transactions deleted successfully'
        description={`${pluralize('transaction', transactionsCount, true)} ${transactionsCount === 1 ? 'has' : 'have'} been deleted from your account.`}
      />
      <Separator />
      <HStack gap='xs' className='Layer__upload-transactions__confirmation-step__button-row'>
        <Spacer />
        <Button
          onClick={goRestartFlow}
          variant={ButtonVariant.secondary}
          rightIcon={<UploadCloud size={12} />}
          className='Layer__upload-transactions__confirmation-step__button-row-item'
        >
          Delete another file
        </Button>
        <Button
          onClick={() => { void next() }}
          rightIcon={<ChevronRight />}
          className='Layer__upload-transactions__confirmation-step__button-row-item'
        >
          I’m done deleting uploads
        </Button>
      </HStack>
    </VStack>
  )
}
