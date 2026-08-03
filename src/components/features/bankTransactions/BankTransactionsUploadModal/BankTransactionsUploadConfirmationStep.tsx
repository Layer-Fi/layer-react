import { useCallback } from 'react'
import { ChevronRight, CloudUpload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Separator } from '@ui/Separator/Separator'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { useWizard } from '@blocks/Wizard/Wizard'
import { BankTransactionsUploadStep } from '@features/bankTransactions/BankTransactionsUploadModal/types'

type BankTransactionsUploadConfirmationStepProps = {
  onRestartFlow: () => void
  uploadedTransactionsCount: number
}

export function BankTransactionsUploadConfirmationStep({ onRestartFlow, uploadedTransactionsCount }: BankTransactionsUploadConfirmationStepProps) {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { goToStep, next } = useWizard()
  const goRestartFlow = useCallback(() => {
    onRestartFlow()
    goToStep(BankTransactionsUploadStep.UploadCsv)
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
          onPress={goRestartFlow}
          variant='outlined'
        >
          {t('upload:action.upload_another_file', 'Upload another file')}
          <CloudUpload size={12} />
        </Button>
        <Button
          onPress={() => { void next() }}
        >
          {t('upload:label.im_done_uploading', 'I’m done uploading transactions')}
          <ChevronRight size={18} />
        </Button>
      </HStack>
    </VStack>
  )
}
