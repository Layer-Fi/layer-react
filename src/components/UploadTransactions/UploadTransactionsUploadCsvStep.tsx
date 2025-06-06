import { useCallback, useMemo, useState } from 'react'
import { HStack, Spacer, VStack } from '../ui/Stack/Stack'
import { Label, P } from '../ui/Typography/Text'
import { SubmitButton } from '../Button'
import { useCustomAccounts } from '../../hooks/customAccounts/useCustomAccounts'
import { CreatableSelect } from '../Input/CreatableSelect'
import { CustomAccountForm } from '../CustomAccountForm/CustomAccountForm'
import { CsvUpload } from '../CsvUpload/CsvUpload'
import type { CustomAccount } from '../../hooks/customAccounts/types'
import classNames from 'classnames'
import { Separator } from '../Separator/Separator'
import { DownloadCsvTemplateButton } from '../CsvUpload/DownloadCsvTemplateButton'
import { CopyTemplateHeadersButtonGroup } from '../CsvUpload/CopyTemplateHeadersButtonGroup'
import { type CustomAccountParseCsvResponse, useCustomAccountParseCsv } from '../../hooks/customAccounts/useCustomAccountParseCsv'
import { templateHeaders, templateExampleTransactions } from './template'

type AccountOption = {
  value: string
  label: string
  createdAccountName?: string
}

const formatCreateLabel = (inputValue: string) => (
  <span style={{ fontStyle: 'italic' }}>
    +
    {' '}
    {inputValue ? `Create "${inputValue}"` : 'Create new account'}
  </span>
)

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
  const { data: customAccounts, isLoading: isLoadingCustomAccounts, error: customAccountsError } = useCustomAccounts()
  const { trigger: parseCsv, isMutating: isParsingCsv } = useCustomAccountParseCsv()
  const [hasParseCsvError, setHasParseCsvError] = useState(false)

  const accountOptions = useMemo(() => {
    if (!customAccounts) return []

    return customAccounts.map(account => ({
      value: account.id,
      label: account.accountName,
    }))
  }, [customAccounts])

  const onChange = useCallback((option: AccountOption | null) => {
    onSelectAccount(option)
  }, [onSelectAccount])

  const onCreateOption = useCallback((inputValue: string) => {
    onSelectAccount({
      value: 'new_account',
      label: 'Create new account',
      createdAccountName: inputValue,
    })
  }, [onSelectAccount])

  const onCancelCreateAccount = useCallback(() => {
    onSelectAccount(null)
  }, [onSelectAccount])

  const onCreateAccountSuccess = useCallback((account: CustomAccount) => {
    onSelectAccount({
      value: account.id,
      label: account.accountName,
    })
  }, [onSelectAccount])

  const onFileSelected = useCallback((file: File | null) => {
    setHasParseCsvError(false)
    onSelectFile(file)
  }, [onSelectFile])

  const onClickContinue = useCallback(() => {
    if (!selectedAccount || selectedAccount.value === 'new_account' || !selectedFile) return

    void parseCsv({
      customAccountId: selectedAccount.value,
      file: selectedFile,
    }).then((res) => { if (res) onParseCsv(res) })
      .catch(() => { setHasParseCsvError(true) })
  }, [selectedAccount, selectedFile, parseCsv, onParseCsv])

  const inputClassName = classNames(
    'Layer__upload-transactions__select-account-name-input',
    !!customAccountsError && 'Layer__upload-transactions__select-account-name-input--error',
  )

  const hasSelectedAccount = selectedAccount && selectedAccount.value !== 'new_account'
  return (
    <VStack gap='lg'>
      <HStack fluid align='center' gap='lg' className='Layer__upload-transactions__select-account-name-field'>
        <Label htmlFor='account_name'>
          Account name
        </Label>
        <CreatableSelect
          inputId='account_name'
          placeholder={customAccountsError ? 'Failed to load options' : 'Select or add...'}
          options={accountOptions}
          onChange={onChange}
          onCreateOption={onCreateOption}
          formatCreateLabel={formatCreateLabel}
          isValidNewOption={() => true}
          value={selectedAccount}
          isClearable
          isLoading={isLoadingCustomAccounts}
          disabled={!!customAccountsError}
          className={inputClassName}
        />
      </HStack>
      {selectedAccount && selectedAccount.value === 'new_account' && (
        <VStack className='Layer__upload-transactions__create-account-form'>
          <CustomAccountForm
            initialAccountName={selectedAccount.createdAccountName ?? ''}
            onCancel={onCancelCreateAccount}
            onSuccess={onCreateAccountSuccess}
          />
        </VStack>
      )}
      <CsvUpload file={selectedFile} onFileSelected={onFileSelected} replaceDropTarget />
      <Separator />
      <VStack gap='xs' className='Layer__upload-transactions__template-section'>
        <P size='sm'>Make sure to include the following columns</P>
        <HStack align='center'>
          <CopyTemplateHeadersButtonGroup headers={templateHeaders} />
          <Spacer />
          <DownloadCsvTemplateButton
            fileName='upload_transactions.csv'
            csvProps={{ headers: templateHeaders, rows: templateExampleTransactions }}
          >
            Download template
          </DownloadCsvTemplateButton>
        </HStack>
      </VStack>
      <HStack>
        <Spacer />
        <SubmitButton
          tooltip={(selectedFile && !hasSelectedAccount) ? 'Select an account' : null}
          disabled={!hasSelectedAccount || !selectedFile}
          processing={isParsingCsv}
          error={hasParseCsvError}
          onClick={onClickContinue}
          withRetry
          noIcon={!isParsingCsv}
        >
          {hasParseCsvError ? 'Retry' : 'Continue'}
        </SubmitButton>
      </HStack>
    </VStack>
  )
}
