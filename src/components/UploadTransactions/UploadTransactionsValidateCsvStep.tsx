import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransactionDataOnly } from '@schemas/bankTransactions/bankTransactionDataOnly'
import { type PreviewCsv } from '@schemas/csvUpload'
import { type CustomAccountTransactionRow } from '@schemas/customAccounts'
import { DateFormat } from '@utils/i18n/date/patterns'
import type { CustomAccountParseCsvResponse } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/useCustomAccountParseCsv'
import { useCreateCustomAccountTransactions } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/useCreateCustomAccountTransactions'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { SubmitAction, SubmitButton } from '@ui/Button/SubmitButton'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { ValidateCsvTable } from '@components/CsvUpload/ValidateCsvTable'
import { Separator } from '@components/Separator/Separator'
import { templateHeaders } from '@components/UploadTransactions/template'
import { useWizard } from '@components/Wizard/Wizard'

interface UploadTransactionsValidateCsvStepProps {
  parseCsvResponse: CustomAccountParseCsvResponse | null
  selectedAccountId?: string
  onSelectFile: (file: File | null) => void
  onUploadTransactionsSuccess: (transactions: BankTransactionDataOnly[]) => void
}

const generateDynamicHeaders = (
  transactionsPreview: PreviewCsv<CustomAccountTransactionRow>,
) => {
  const hasExternalId = transactionsPreview.some(transaction =>
    transaction.externalId?.parsed != null,
  )
  const hasReferenceNumber = transactionsPreview.some(transaction =>
    transaction.referenceNumber?.parsed != null,
  )
  return {
    hasExternalId,
    hasReferenceNumber,
    headers: {
      ...(hasExternalId && { externalId: 'External ID' }),
      ...(hasReferenceNumber && { referenceNumber: 'Reference No.' }),
      ...templateHeaders,
    },
  }
}

export function UploadTransactionsValidateCsvStep(
  { parseCsvResponse, selectedAccountId, onSelectFile, onUploadTransactionsSuccess }: UploadTransactionsValidateCsvStepProps,
) {
  const { t } = useTranslation()
  const { formatCurrencyFromCents, formatDate, formatNumber } = useIntlFormatter()
  const { previous, next } = useWizard()
  const { trigger: uploadTransactions, isMutating, error: uploadTransactionsError } = useCreateCustomAccountTransactions()

  const formatters = useMemo(() => ({
    date: (parsed: string) => formatDate(parsed, DateFormat.DateNumericPadded),
    amount: (parsed: number) => formatCurrencyFromCents(parsed),
  }), [formatCurrencyFromCents, formatDate])

  const onClickReupload = useCallback(() => {
    onSelectFile(null)
    previous()
  }, [onSelectFile, previous])

  const {
    isValid: isValidCsv,
    newTransactionsPreview: transactionsPreview,
    newTransactionsRequest: transactionsRequest,
    invalidTransactionsCount,
    totalTransactionsCount,
  } = parseCsvResponse!

  const { headers: dynamicHeaders, hasExternalId, hasReferenceNumber } = generateDynamicHeaders(transactionsPreview)

  const onClickUploadTransactions = useCallback(() => {
    void uploadTransactions({
      ...transactionsRequest,
      customAccountId: selectedAccountId!,
    }).then((transactions) => {
      if (transactions) {
        onUploadTransactionsSuccess?.([...transactions])
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
                {t('upload:validation.transactions_invalid_count', 'Invalid transactions: {{invalidTransactionsCount}}', { invalidTransactionsCount: formatNumber(invalidTransactionsCount) })}
              </Badge>
            )}
          <Badge>{t('upload:label.total_transactions_count', 'Total transactions: {{totalTransactionsCount}}', { totalTransactionsCount: formatNumber(totalTransactionsCount) })}</Badge>
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
        <Button onPress={() => { void previous() }} variant='outlined'>{t('common:action.back', 'Back')}</Button>
        <Spacer />
        {isValidCsv
          ? (
            <SubmitButton
              isPending={isMutating}
              isError={!!uploadTransactionsError}
              onPress={onClickUploadTransactions}
              action={SubmitAction.UPLOAD}
              withRetry
            >
              {uploadTransactionsError ? t('common:action.retry_label', 'Retry') : t('upload:action.upload_transactions', 'Upload transactions')}
            </SubmitButton>
          )
          : (
            <Button onPress={onClickReupload}>
              {t('upload:action.reupload', 'Reupload')}
              <RefreshCcw size={12} />
            </Button>
          )}
      </HStack>
    </VStack>
  )
}
