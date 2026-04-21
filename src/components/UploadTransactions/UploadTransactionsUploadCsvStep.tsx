import { useCallback, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import type { CustomAccount } from '@internal-types/customAccounts'
import { humanizeEnum } from '@utils/format'
import { type CustomAccountParseCsvResponse, useCustomAccountParseCsv } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/useCustomAccountParseCsv'
import { useCustomAccounts } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import Check from '@icons/Check'
import { COMBO_BOX_CLASS_NAMES } from '@ui/ComboBox/classnames'
import { CreatableComboBox } from '@ui/ComboBox/CreatableComboBox'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Label, P, Span } from '@ui/Typography/Text'
import { SubmitButton } from '@components/Button/SubmitButton'
import { CopyTemplateHeadersButtonGroup } from '@components/CsvUpload/CopyTemplateHeadersButtonGroup'
import { CsvUpload } from '@components/CsvUpload/CsvUpload'
import { DownloadCsvTemplateButton } from '@components/CsvUpload/DownloadCsvTemplateButton'
import { CustomAccountForm } from '@components/CustomAccountForm/CustomAccountForm'
import { Separator } from '@components/Separator/Separator'
import { allHeaders, TEMPLATE_HEADERS, templateExampleTransactions } from '@components/UploadTransactions/template'
import { useWizard } from '@components/Wizard/Wizard'

export type AccountOption = {
  value: string
  label: string
  account: Partial<CustomAccount> & Pick<CustomAccount, 'accountName'>
  __isNew__?: true
}

const formatCreateLabel = (inputValue: string, t: TFunction) =>
  inputValue
    ? t('upload:action.create_input_value', 'Create "{{inputValue}}"', { inputValue })
    : t('upload:action.create_account', 'Create account')

const AccountOption = ({ option, fallback }: { option: AccountOption, fallback: React.ReactNode }) => {
  if (option.account && !option.__isNew__) {
    return (
      <HStack gap='xs' align='center'>
        <Check size={16} className={COMBO_BOX_CLASS_NAMES.OPTION_CHECK_ICON} />
        <VStack>
          <Span ellipsis>{option.account.accountName}</Span>
          <Span size='sm' variant='subtle' noWrap>
            {option.account.institutionName}
            {' · '}
            {humanizeEnum(option.account.accountSubtype!)}
          </Span>
        </VStack>
      </HStack>
    )
  }

  return fallback
}

const AccountSingleValue = ({ option, fallback }: { option: AccountOption, fallback: React.ReactNode }) => {
  if (option.account && !option.__isNew__) {
    return <Span ellipsis>{option.account.accountName}</Span>
  }

  return fallback
}

interface UploadTransactionsUploadCsvStepProps {
  selectedAccount: AccountOption | null
  onSelectAccount: (account: AccountOption | null) => void

  selectedFile: File | null
  onSelectFile: (file: File | null) => void

  onParseCsv: (parseCsvResponse: CustomAccountParseCsvResponse) => void
}

export function UploadTransactionsUploadCsvStep(
  { selectedAccount, onSelectAccount, selectedFile, onSelectFile, onParseCsv }: UploadTransactionsUploadCsvStepProps,
) {
  const { t } = useTranslation()
  const { next } = useWizard()
  const {
    data: customAccounts,
    isLoading: isLoadingCustomAccounts,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error: customAccountsError,
  } = useCustomAccounts({ userCreated: true })
  const { trigger: parseCsv, isMutating: isParsingCsv } = useCustomAccountParseCsv()
  const [hasParseCsvError, setHasParseCsvError] = useState(false)

  const accountOptions = useMemo(() => {
    if (!customAccounts) return []

    return customAccounts.map(account => ({
      value: account.id,
      label: account.accountName,
      account: account,
    }))
  }, [customAccounts])

  const onCreateOption = useCallback((inputValue: string) => {
    onSelectAccount({
      value: 'new_account',
      label: t('upload:action.create_account', 'Create account'),
      account: { accountName: inputValue },
      __isNew__: true,
    })
  }, [t, onSelectAccount])

  const onCreateAccountSuccess = useCallback((account: CustomAccount) => {
    onSelectAccount({
      value: account.id,
      label: account.accountName,
      account,
    })
  }, [onSelectAccount])

  const onFileSelected = useCallback((file: File | null) => {
    setHasParseCsvError(false)
    onSelectFile(file)
  }, [onSelectFile])

  const isCreatingNewAccount = selectedAccount && selectedAccount.value === 'new_account'
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
        <CreatableComboBox<AccountOption>
          inputId='account_name'
          placeholder={customAccountsError ? t('common:error.load_options', 'Failed to load options') : t('upload:action.select_account', 'Select account...')}
          options={accountOptions}
          onSelectedValueChange={onSelectAccount}
          onCreateOption={onCreateOption}
          formatCreateLabel={inputValue => formatCreateLabel(inputValue, t)}
          isValidNewOption={() => true}
          selectedValue={selectedAccount}
          isClearable
          isLoading={isLoadingCustomAccounts}
          isDisabled={!!customAccountsError}
          isError={!!customAccountsError}
          className='Layer__upload-transactions__select-account-name-input'
          slots={{ Option: AccountOption, SingleValue: AccountSingleValue }}
        />
      </VStack>
      {isCreatingNewAccount
        ? (
          <VStack className='Layer__upload-transactions__create-account-form'>
            <CustomAccountForm
              initialAccountName={selectedAccount.account.accountName}
              onCancel={() => onSelectAccount(null)}
              onSuccess={onCreateAccountSuccess}
            />
          </VStack>
        )
        : (
          <>
            <CsvUpload file={selectedFile} onFileSelected={onFileSelected} replaceDropTarget />
            <Separator />
            <VStack gap='xs' className='Layer__upload-transactions__template-section'>
              <P size='sm'>{t('upload:action.click_copy_required', 'Click to copy the required column headers')}</P>
              <HStack align='center' gap='xs' className='Layer__upload-transactions__template-section__button-row'>
                <CopyTemplateHeadersButtonGroup
                  headers={TEMPLATE_HEADERS}
                  className='Layer__upload-transactions__template-section__button-row-item'
                />
                <DownloadCsvTemplateButton
                  fileName='upload_transactions.csv'
                  csvProps={{ headers: allHeaders, rows: templateExampleTransactions }}
                  className='Layer__upload-transactions__template-section__button-row-item'
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
                disabled={!hasSelectedAccount || !selectedFile}
                processing={isParsingCsv}
                error={hasParseCsvError}
                onClick={onClickContinue}
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
