import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
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
  const { formatNumber } = useIntlFormatter()
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
        title={t('upload:label.transactions_uploaded_successfully', 'Transactions uploaded successfully')}
        description={tPlural(t, 'upload:label.count_transactions_have', {
          count: uploadedTransactionsCount,
          displayCount: formatNumber(uploadedTransactionsCount),
          one: '{{displayCount}} transaction has been uploaded to your account.',
          other: '{{displayCount}} transactions have been uploaded to your account.',
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
          {t('upload:action.upload_another_file', 'Upload another file')}
        </Button>
        <Button
          onClick={() => { void next() }}
          rightIcon={<ChevronRight />}
          className='Layer__upload-transactions__confirmation-step__button-row-item'
        >
          {t('upload:label.im_done_uploading', 'I’m done uploading transactions')}
        </Button>
      </HStack>
    </VStack>
  )
}
