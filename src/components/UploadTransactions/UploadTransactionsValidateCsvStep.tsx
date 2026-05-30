import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { type CustomAccountTransactionRow } from '@internal-types/customAccounts'
import { DateFormat } from '@utils/i18n/date/patterns'
import type { CustomAccountParseCsvResponse } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/useCustomAccountParseCsv'
import { useCreateCustomAccountTransactions } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/useCreateCustomAccountTransactions'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { Button, ButtonVariant } from '@components/Button/Button'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { type PreviewCsv } from '@components/CsvUpload/types'
import { ValidateCsvTable } from '@components/CsvUpload/ValidateCsvTable'
import { Separator } from '@components/Separator/Separator'
import { TEMPLATE_HEADERS } from '@components/UploadTransactions/template'
import { useWizard } from '@components/Wizard/Wizard'

interface UploadTransactionsValidateCsvStepProps {
  parseCsvResponse: CustomAccountParseCsvResponse | null
  selectedAccountId?: string
  onSelectFile: (file: File | null) => void
  onUploadTransactionsSuccess: (transactions: BankTransaction[]) => void
}

const generateDynamicHeaders = (
  transactionsPreview: PreviewCsv<CustomAccountTransactionRow>,
) => {
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
      ...(hasReferenceNumber && { reference_number: 'Reference No.' }),
      ...TEMPLATE_HEADERS,
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
        <Button onClick={() => { void previous() }} variant={ButtonVariant.secondary}>{t('common:action.back', 'Back')}</Button>
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
              {uploadTransactionsError ? t('common:action.retry_label', 'Retry') : t('upload:action.upload_transactions', 'Upload transactions')}
            </SubmitButton>
          )
          : (
            <Button
              onClick={onClickReupload}
              rightIcon={<RefreshCcw size={12} />}
              variant={ButtonVariant.primary}
            >
              {t('upload:action.reupload', 'Reupload')}
            </Button>
          )}
      </HStack>
    </VStack>
  )
}
