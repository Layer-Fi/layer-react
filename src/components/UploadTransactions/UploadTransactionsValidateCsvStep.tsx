import { useCallback } from 'react'
import { RefreshCcw } from 'lucide-react'
import { HStack, Spacer, VStack } from '../ui/Stack/Stack'
import { Button, ButtonVariant } from '../Button/Button'
import { Separator } from '../Separator/Separator'
import { useCreateCustomAccountTransactions } from '../../hooks/customAccounts/useCreateCustomAccountTransactions'
import type { CustomAccountParseCsvResponse } from '../../hooks/customAccounts/useCustomAccountParseCsv'
import { ValidateCsvTable } from '../CsvUpload/ValidateCsvTable'
import { templateHeaders } from './template'
import { convertCentsToCurrency, formatDate } from '../../utils/format'
import { SubmitAction, SubmitButton } from '../Button/SubmitButton'
import { Badge, BadgeVariant } from '../Badge'
import { useWizard } from '../Wizard/Wizard'
import { BankTransaction } from '../../types'

interface UploadTransactionsValidateCsvStepProps {
  parseCsvResponse: CustomAccountParseCsvResponse | null
  selectedAccountId?: string
  onSelectFile: (file: File | null) => void
  onUploadTransactionsSuccess: (transactions: BankTransaction[]) => void
}

const formatters = {
  date: (parsed: string) => formatDate(parsed, 'MM/dd/yyyy'),
  amount: (parsed: number) => convertCentsToCurrency(parsed) ?? '',
}

export function UploadTransactionsValidateCsvStep(
  { parseCsvResponse, selectedAccountId, onSelectFile, onUploadTransactionsSuccess }: UploadTransactionsValidateCsvStepProps,
) {
  const { previous, next } = useWizard()
  const { trigger: uploadTransactions, isMutating, error: uploadTransactionsError } = useCreateCustomAccountTransactions()

  const onClickReupload = useCallback(() => {
    onSelectFile(null)
    previous()
  }, [onSelectFile, previous])

  const {
    is_valid: isValidCsv,
    new_transactions_preview: transactionsPreview,
    new_transactions_request: transactionsRequest,
    invalid_transactions_count: invalidTransactionsCount,
    total_transactions_count: totalTransactionsCount,
  } = parseCsvResponse!

  const onClickUploadTransactions = useCallback(() => {
    void uploadTransactions({
      ...transactionsRequest,
      customAccountId: selectedAccountId!,
    }).then((transactions) => {
      if (transactions) {
        onUploadTransactionsSuccess?.(transactions)
        void next()
      }
    })
  }, [next, onUploadTransactionsSuccess, selectedAccountId, transactionsRequest, uploadTransactions])

  return (
    <VStack gap='lg'>
      <VStack gap='xs'>
        <HStack gap='xs'>
          {!isValidCsv
            && (
              <Badge variant={BadgeVariant.ERROR}>
                {`Invalid transactions: ${invalidTransactionsCount}`}
              </Badge>
            )}
          <Badge>{`Total transactions: ${totalTransactionsCount}`}</Badge>
        </HStack>
        <ValidateCsvTable
          className='Layer__upload-transactions__preview_table'
          data={transactionsPreview}
          headers={templateHeaders}
          formatters={formatters}
        />
      </VStack>
      <Separator />
      <HStack gap='xs'>
        <Button onClick={() => { void previous() }} variant={ButtonVariant.secondary}>Back</Button>
        <Spacer />
        {isValidCsv
          ? (
            <SubmitButton
              processing={isMutating}
              error={!!uploadTransactionsError}
              onClick={onClickUploadTransactions}
              action={SubmitAction.UPLOAD}
              withRetry
              iconAsPrimary={false}
            >
              {uploadTransactionsError ? 'Retry' : 'Upload transactions'}
            </SubmitButton>
          )
          : (
            <Button
              onClick={onClickReupload}
              rightIcon={<RefreshCcw size={12} />}
              variant={ButtonVariant.primary}
            >
              Reupload
            </Button>
          )}
      </HStack>
    </VStack>
  )
}
