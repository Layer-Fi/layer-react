import { useCallback } from 'react'
import classNames from 'classnames'
import i18next from 'i18next'
import { RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { type CustomAccountTransactionRow } from '@internal-types/customAccounts'
import { convertCentsToCurrency, formatDate } from '@utils/format'
import type { CustomAccountParseCsvResponse } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/useCustomAccountParseCsv'
import { useCreateCustomAccountTransactions } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/useCreateCustomAccountTransactions'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { Button, ButtonVariant } from '@components/Button/Button'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { type PreviewCsv } from '@components/CsvUpload/types'
import { ValidateCsvTable } from '@components/CsvUpload/ValidateCsvTable'
import { Separator } from '@components/Separator/Separator'
import { templateHeaders } from '@components/UploadTransactions/template'
import { useWizard } from '@components/Wizard/Wizard'

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

const generateDynamicHeaders = (transactionsPreview: PreviewCsv<CustomAccountTransactionRow>) => {
  const hasExternalId = transactionsPreview.some(transaction =>
    transaction.external_id?.parsed != null,
  )
  const hasReferenceNumber = transactionsPreview.some(transaction =>
    transaction.reference_number?.parsed != null,
  )
  return {
    hasExternalId,
    hasReferenceNumber,
    headers: {
      ...(hasExternalId && { external_id: 'External ID' }),
      ...(hasReferenceNumber && { reference_number: i18next.t('referenceNo', 'Reference No.') }),
      ...templateHeaders,
    },
  }
}

export function UploadTransactionsValidateCsvStep(
  { parseCsvResponse, selectedAccountId, onSelectFile, onUploadTransactionsSuccess }: UploadTransactionsValidateCsvStepProps,
) {
  const { t } = useTranslation()
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

  const { headers: dynamicHeaders, hasExternalId, hasReferenceNumber } = generateDynamicHeaders(transactionsPreview)

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
                {t('invalidTransactionsInvalidtransactionscount', 'Invalid transactions: {{invalidTransactionsCount}}', { invalidTransactionsCount })}
              </Badge>
            )}
          <Badge>{t('totalTransactionsTotaltransactionscount', 'Total transactions: {{totalTransactionsCount}}', { totalTransactionsCount })}</Badge>
        </HStack>
        <ValidateCsvTable
          className={classNames(
            'Layer__upload-transactions__preview_table',
            hasExternalId && 'Layer__upload-transactions__preview_table--has-external-id',
            hasReferenceNumber && 'Layer__upload-transactions__preview_table--has-reference-number',
          )}
          data={transactionsPreview}
          headers={dynamicHeaders}
          formatters={formatters}
        />
      </VStack>
      <Separator />
      <HStack gap='xs'>
        <Button onClick={() => { void previous() }} variant={ButtonVariant.secondary}>{t('back', 'Back')}</Button>
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
              {uploadTransactionsError ? t('retry', 'Retry') : t('uploadTransactions', 'Upload transactions')}
            </SubmitButton>
          )
          : (
            <Button
              onClick={onClickReupload}
              rightIcon={<RefreshCcw size={12} />}
              variant={ButtonVariant.primary}
            >
              {t('reupload', 'Reupload')}
            </Button>
          )}
      </HStack>
    </VStack>
  )
}
