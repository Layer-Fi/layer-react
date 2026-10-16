import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type CustomAccountParseCsvResponse, usePostCustomAccountParseCsv } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/post'
import { Button } from '@ui/Button/Button'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Label, P, Span } from '@ui/Typography/Text'
import { CopyTemplateHeaders } from '@blocks/CsvUpload/CopyTemplateHeaders/CopyTemplateHeaders'
import { CsvUpload } from '@blocks/CsvUpload/CsvUpload/CsvUpload'
import { DownloadCsvTemplateButton } from '@blocks/CsvUpload/DownloadCsvTemplateButton/DownloadCsvTemplateButton'
import { useWizard } from '@blocks/Wizard/Wizard'
import { allHeaders, templateExampleTransactions, templateHeaders } from '@features/bankTransactions/BankTransactionsUploadModal/template'
import { type AccountOption } from '@features/customAccounts/CustomAccountComboBox/AccountOption'
import { CustomAccountComboBox } from '@features/customAccounts/CustomAccountComboBox/CustomAccountComboBox'
import { isNewAccountOption } from '@features/customAccounts/CustomAccountComboBox/utils'

export type { AccountOption } from '@features/customAccounts/CustomAccountComboBox/AccountOption'

interface UploadTransactionsUploadCsvStepProps {
  selectedAccount: AccountOption | null
  onSelectAccount: (account: AccountOption | null) => void

  selectedFile: File | null
  onSelectFile: (file: File | null) => void

  onParseCsv: (parseCsvResponse: CustomAccountParseCsvResponse) => void
  onCancel?: () => void
}

export function BankTransactionsUploadCsvStep(
  { selectedAccount, onSelectAccount, selectedFile, onSelectFile, onParseCsv, onCancel }: UploadTransactionsUploadCsvStepProps,
) {
  const { t } = useTranslation()
  const { next } = useWizard()
  const { trigger: parseCsv, isMutating: isParsingCsv } = usePostCustomAccountParseCsv()
  const [hasParseCsvError, setHasParseCsvError] = useState(false)

  const onFileSelected = useCallback((file: File | null) => {
    setHasParseCsvError(false)
    onSelectFile(file)
  }, [onSelectFile])

  const isCreatingNewAccount = isNewAccountOption(selectedAccount)
  const onClickContinue = useCallback(() => {
    if (!selectedAccount || isCreatingNewAccount || !selectedFile) return

    void parseCsv({
      customAccountId: selectedAccount.value,
      file: selectedFile,
    }).then((parsedCsv) => {
      if (parsedCsv) {
        onParseCsv(parsedCsv)
        void next()
      }
    })
      .catch(() => { setHasParseCsvError(true) })
  }, [selectedAccount, isCreatingNewAccount, selectedFile, parseCsv, onParseCsv, next])

  const hasSelectedAccount = selectedAccount && !isCreatingNewAccount
  const getContinueTooltip = () => {
    if (!hasSelectedAccount && !selectedFile) return t('upload:action.select_account_and_file', 'Choose an account and a file to continue')
    if (!hasSelectedAccount) return t('upload:action.select_account_label', 'Select an account')
    if (!selectedFile) return t('upload:action.select_file_label', 'Choose a file')
    return null
  }
  return (
    <VStack gap='lg'>
      <VStack pis='3xs' gap='xs'>
        <Label size='md' htmlFor='account_name'>
          {t('upload:prompt.which_account_are_transactions_from', 'Which account are these transactions from?')}
        </Label>
        <CustomAccountComboBox
          inputId='account_name'
          label={t('upload:prompt.which_account_are_transactions_from', 'Which account are these transactions from?')}
          showLabel={false}
          placeholder={t('upload:action.select_or_create_account', 'Select or create an account')}
          selectedAccount={selectedAccount}
          onSelectAccount={onSelectAccount}
          className='Layer__upload-transactions__select-account-name-input'
        />
      </VStack>
      {!isCreatingNewAccount && (
        <>
          <VStack gap='xs'>
            <Label size='md'>
              {t('upload:label.transactions_file', 'Transactions file')}
            </Label>
            <CsvUpload file={selectedFile} onFileSelected={onFileSelected} />
            <HStack align='center' gap='xs' className='Layer__upload-transactions__requirements'>
              <Span size='sm' variant='subtle'>{t('upload:label.needs_columns', 'Needs columns')}</Span>
              <CopyTemplateHeaders headers={templateHeaders} />
              <Spacer />
              <DownloadCsvTemplateButton
                variant='text'
                fileName='upload_transactions.csv'
                csvProps={{ headers: allHeaders, rows: templateExampleTransactions }}
              >
                {t('upload:action.download_a_template', 'Download a template')}
              </DownloadCsvTemplateButton>
            </HStack>
          </VStack>
          <HStack align='center' gap='xs'>
            <HStack className='Layer__upload-transactions__parse-csv-error-message'>
              {hasParseCsvError && <P status='error'>{t('upload:error.could_not_parse_csv', 'We could not parse this CSV. Please review the file and try again.')}</P>}
            </HStack>
            <Spacer />
            {onCancel && (
              <Button variant='ghost' onPress={onCancel}>
                {t('common:action.cancel_label', 'Cancel')}
              </Button>
            )}
            <SubmitButton
              tooltip={getContinueTooltip()}
              isDisabled={!hasSelectedAccount || !selectedFile}
              isPending={isParsingCsv}
              isError={hasParseCsvError}
              onPress={onClickContinue}
              withRetry
              noIcon={!isParsingCsv}
            >
              {hasParseCsvError ? t('common:action.retry_label', 'Retry') : t('common:action.continue_label', 'Continue')}
            </SubmitButton>
          </HStack>
        </>
      )}
    </VStack>
  )
}
