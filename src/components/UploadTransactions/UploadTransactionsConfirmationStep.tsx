import { useCallback } from 'react'
import { HStack, Spacer, VStack } from '../ui/Stack/Stack'
import { Button, ButtonVariant } from '../Button/Button'
import { useWizard } from '../Wizard/Wizard'
import { UploadTransactionsStep } from './types'
import { Separator } from '../Separator/Separator'
import { DataState, DataStateStatus } from '../DataState/DataState'
import pluralize from 'pluralize'
import ChevronRight from '../../icons/ChevronRight'
import UploadCloud from '../../icons/UploadCloud'

type UploadTransactionsConfirmationStepProps = {
  onRestartFlow: () => void
  uploadedTransactionsCount: number
}

export function UploadTransactionsConfirmationStep({ onRestartFlow, uploadedTransactionsCount }: UploadTransactionsConfirmationStepProps) {
  const { goToStep, next } = useWizard()
  const goRestartFlow = useCallback(() => {
    onRestartFlow()
    goToStep(UploadTransactionsStep.UploadCsv)
  }, [onRestartFlow, goToStep])

  return (
    <VStack gap='lg'>
      <DataState
        className='Layer__upload-transactions__confirmation-step__data-state'
        status={DataStateStatus.success}
        title='Transactions uploaded successfully'
        description={`${pluralize('transaction', uploadedTransactionsCount, true)} ${uploadedTransactionsCount === 1 ? 'has' : 'have'} been uploaded to your account.`}
      />
      <Separator />
      <HStack gap='xs'>
        <Spacer />
        <Button onClick={goRestartFlow} variant={ButtonVariant.secondary} rightIcon={<UploadCloud size={12} />}>
          Upload another file
        </Button>
        <Button onClick={() => { void next() }} rightIcon={<ChevronRight />}>
          I’m done uploading transactions
        </Button>
      </HStack>
    </VStack>
  )
}
