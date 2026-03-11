import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import ChevronRight from '@icons/ChevronRight'
import UploadCloud from '@icons/UploadCloud'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Button, ButtonVariant } from '@components/Button/Button'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Separator } from '@components/Separator/Separator'
import { UploadTransactionsStep } from '@components/UploadTransactions/types'
import { useWizard } from '@components/Wizard/Wizard'

type UploadTransactionsConfirmationStepProps = {
  onRestartFlow: () => void
  uploadedTransactionsCount: number
}

export function UploadTransactionsConfirmationStep({ onRestartFlow, uploadedTransactionsCount }: UploadTransactionsConfirmationStepProps) {
  const { t } = useTranslation()
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
        title={t('transactionsUploadedSuccessfully', 'Transactions uploaded successfully')}
        description={tPlural(t, 'countTransactionsHaveBeenUploadedToYourAccount', {
          count: uploadedTransactionsCount,
          one: '{{count}} transaction has been uploaded to your account.',
          other: '{{count}} transactions have been uploaded to your account.',
        })}
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
          {t('uploadAnotherFile', 'Upload another file')}
        </Button>
        <Button
          onClick={() => { void next() }}
          rightIcon={<ChevronRight />}
          className='Layer__upload-transactions__confirmation-step__button-row-item'
        >
          {t('imDoneUploadingTransactions', 'I’m done uploading transactions')}
        </Button>
      </HStack>
    </VStack>
  )
}
