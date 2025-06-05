import { useCallback } from 'react'
import { RefreshCcw, UploadCloud } from 'lucide-react'
import { HStack, Spacer, VStack } from '../ui/Stack/Stack'
import { Button, ButtonVariant } from '../Button/Button'
import { Separator } from '../Separator/Separator'
import { useCreateCustomAccountTransactions } from '../../hooks/customAccounts/useCreateCustomAccountTransactions'
import type { CustomAccountParseCsvResponse } from '../../hooks/customAccounts/useCustomAccountParseCsv'
import type { Awaitable } from '../../types/utility/promises'
import { ValidateCsvTable } from '../CsvUpload/ValidateCsvTable'
import { templateHeaders } from './template'
import { convertCentsToCurrency, formatDate } from '../../utils/format'
import { SubmitAction, SubmitButton } from '../Button/SubmitButton'

interface UploadTransactionsValidateCsvStepProps {
  parseCsvResponse: CustomAccountParseCsvResponse
  selectedAccountId: string
  onGoBack: () => void
  onReupload: () => void
}

const formatters = {
  date: (parsed: string) => formatDate(parsed, 'MM/dd/yyyy'),
  amount: (parsed: number) => convertCentsToCurrency(parsed) ?? '',
}

export function UploadTransactionsValidateCsvStep(
  { parseCsvResponse, selectedAccountId, onGoBack, onReupload }: UploadTransactionsValidateCsvStepProps,
) {
  const { trigger: uploadTransactions, isMutating, error: uploadTransactionsError } = useCreateCustomAccountTransactions()

  const {
    is_valid: isValidCsv,
    new_transactions_preview: transactionsPreview,
    new_transactions_request: transactionsRequest,
  } = parseCsvResponse

  const onClickUploadTransactions = useCallback(() => {
    void uploadTransactions({
      ...transactionsRequest,
      customAccountId: selectedAccountId,
    })
  }, [selectedAccountId, transactionsRequest, uploadTransactions])

  return (
    <VStack gap='lg'>
      <ValidateCsvTable
        className='Layer__upload-transactions__preview_table'
        data={transactionsPreview}
        headers={templateHeaders}
        formatters={formatters}
      />
      <Separator />
      <HStack gap='xs'>
        <Button onClick={onGoBack} variant={ButtonVariant.secondary}>Back</Button>
        <Spacer />
        <Button
          onClick={onReupload}
          rightIcon={<RefreshCcw size={12} />}
          variant={isValidCsv ? ButtonVariant.secondary : ButtonVariant.primary}
        >
          Reupload
        </Button>
        {isValidCsv && (
          <SubmitButton
            processing={isMutating}
            error={!!uploadTransactionsError}
            onClick={onClickUploadTransactions}
            action={SubmitAction.UPLOAD}
            withRetry
          >
            {uploadTransactionsError ? 'Retry' : 'Upload transactions'}
          </SubmitButton>
        )}
      </HStack>
    </VStack>
  )
}
