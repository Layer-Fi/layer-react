import { SubmitButton } from '../Button/SubmitButton'
import { useCallback, useMemo, useState } from 'react'
import { HStack, Spacer, VStack } from '../ui/Stack/Stack'
import { Label, P, Span } from '../ui/Typography/Text'
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
import { templateHeaders, allHeaders, templateExampleTransactions } from './template'
import { humanizeEnum } from '../../utils/format'
import { useWizard } from '../Wizard/Wizard'
import type { FormatOptionLabelMeta } from 'react-select'

export type AccountOption = {
  value: string
  label: string
  account: Partial<CustomAccount> & Pick<CustomAccount, 'accountName'>
  __isNew__?: true
}

const formatCreateLabel = (inputValue: string) => {
  return inputValue ? `Create "${inputValue}"` : 'Create account'
}

const formatOptionLabel = (option: AccountOption, meta?: FormatOptionLabelMeta<AccountOption>) => {
  if (option.account && !option.__isNew__) {
    return (
      <VStack>
        <Span ellipsis>{option.account.accountName}</Span>
        {meta?.context === 'menu'
          && (
            <Span size='sm' variant='subtle' noWrap>
              {option.account.institutionName}
              {' · '}
              {humanizeEnum(option.account.accountSubtype!)}
            </Span>
          )}
      </VStack>
    )
  }
  return <Span>{option.label}</Span>
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
  const { next } = useWizard()
  const {
    data: customAccounts,
    isLoading: isLoadingCustomAccounts,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error: customAccountsError,
  } = useCustomAccounts({ userCreated: true })
  const { trigger: parseCsv, isMutating: isParsingCsv, error: parseCsvError } = useCustomAccountParseCsv()
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
      label: 'Create account',
      account: { accountName: inputValue },
      __isNew__: true,
    })
  }, [onSelectAccount])

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

  const inputClassName = classNames(
    'Layer__upload-transactions__select-account-name-input',
    !!customAccountsError && 'Layer__upload-transactions__select-account-name-input--error',
  )

  const hasSelectedAccount = selectedAccount && !isCreatingNewAccount
  return (
    <VStack gap='lg'>
      <VStack gap='xs' className='Layer__upload-transactions__select-account-name-field'>
        <Label size='md' htmlFor='account_name'>
          Which account are these transactions from?
        </Label>
        <CreatableSelect
          inputId='account_name'
          placeholder={customAccountsError ? 'Failed to load options' : 'Select account...'}
          options={accountOptions}
          formatOptionLabel={formatOptionLabel}
          onChange={onSelectAccount}
          onCreateOption={onCreateOption}
          formatCreateLabel={formatCreateLabel}
          isValidNewOption={() => true}
          value={selectedAccount}
          isClearable
          isLoading={isLoadingCustomAccounts}
          disabled={!!customAccountsError}
          className={inputClassName}
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
              <P size='sm'>Click to copy the required column headers</P>
              <HStack align='center' gap='xs' className='Layer__upload-transactions__template-section__button-row'>
                <CopyTemplateHeadersButtonGroup
                  headers={templateHeaders}
                  className='Layer__upload-transactions__template-section__button-row-item'
                />
                <DownloadCsvTemplateButton
                  fileName='upload_transactions.csv'
                  csvProps={{ headers: allHeaders, rows: templateExampleTransactions }}
                  className='Layer__upload-transactions__template-section__button-row-item'
                >
                  Download template
                </DownloadCsvTemplateButton>
              </HStack>
            </VStack>
            <HStack align='center' gap='xs'>
              <HStack className='Layer__upload-transactions__parse-csv-error-message'>
                {hasParseCsvError && <P status='error'>{parseCsvError?.getAllMessages()?.[0] || parseCsvError?.getMessage()}</P>}
              </HStack>
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
          </>
        )}
    </VStack>
  )
}
