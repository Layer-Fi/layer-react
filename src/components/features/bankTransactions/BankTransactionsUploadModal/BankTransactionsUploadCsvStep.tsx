import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type CustomAccountParseCsvResponse, usePostCustomAccountParseCsv } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/post'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { Separator } from '@ui/Separator/Separator'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'
import { CopyTemplateHeadersButtonGroup } from '@blocks/CsvUpload/CopyTemplateHeadersButtonGroup/CopyTemplateHeadersButtonGroup'
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
}

export function BankTransactionsUploadCsvStep(
  { selectedAccount, onSelectAccount, selectedFile, onSelectFile, onParseCsv }: UploadTransactionsUploadCsvStepProps,
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
          selectedAccount={selectedAccount}
          onSelectAccount={onSelectAccount}
          className='Layer__upload-transactions__select-account-name-input'
        />
      </VStack>
      {!isCreatingNewAccount && (
        <>
          <CsvUpload file={selectedFile} onFileSelected={onFileSelected} replaceDropTarget />
          <Separator />
          <VStack gap='xs' className='Layer__upload-transactions__template-section'>
            <P size='sm'>{t('upload:action.click_copy_required', 'Click to copy the required column headers')}</P>
            <HStack align='center' gap='xs' className='Layer__upload-transactions__template-section__button-row'>
              <CopyTemplateHeadersButtonGroup
                headers={templateHeaders}
                className='Layer__upload-transactions__template-section__button-row-item'
              />
              <DownloadCsvTemplateButton
                fileName='upload_transactions.csv'
                csvProps={{ headers: allHeaders, rows: templateExampleTransactions }}
              >
                {t('upload:action.download_template', 'Download template')}
              </DownloadCsvTemplateButton>
            </HStack>
          </VStack>
          <HStack align='center' gap='xs'>
            <HStack className='Layer__upload-transactions__parse-csv-error-message'>
              {hasParseCsvError && <P status='error'>{t('upload:error.could_not_parse_csv', 'We could not parse this CSV. Please review the file and try again.')}</P>}
            </HStack>
            <Spacer />
            <SubmitButton
              tooltip={(selectedFile && !hasSelectedAccount) ? t('upload:action.select_account_label', 'Select an account') : null}
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
