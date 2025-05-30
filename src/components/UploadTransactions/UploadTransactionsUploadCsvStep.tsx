import { useCallback, useMemo, useState } from 'react'
import { HStack, Spacer, VStack } from '../ui/Stack/Stack'
import { Label, P } from '../ui/Typography/Text'
import { useCustomAccounts } from '../../hooks/customAccounts/useCustomAccounts'
import { CreatableSelect } from '../Input/CreatableSelect'
import { CustomAccountForm } from '../CustomAccountForm/CustomAccountForm'
import { CsvUpload } from '../CsvUpload/CsvUpload'
import { Button } from '../Button/Button'
import UploadCloud from '../../icons/UploadCloud'
import { type CustomAccount } from '../../hooks/customAccounts/types'
import classNames from 'classnames'
import { Separator } from '../Separator/Separator'
import { DownloadCsvTemplateButton } from '../CsvUpload/DownloadCsvTemplateButton'
import { CopyTemplateHeadersButtonGroup } from '../CsvUpload/CopyTemplateHeadersButtonGroup'

type AccountOption = {
  value: string
  label: string
  created_account_name?: string
}

interface TemplateRow {
  Date: Date
  Description: string
  Amount: number
}
type TemplateHeader = keyof TemplateRow

const templateHeaders: TemplateHeader[] = ['Date', 'Description', 'Amount']
const templateExampleTransactions: TemplateRow[] = [
  {
    Date: new Date('2025-05-20'),
    Description: 'Grocery Store Purchase',
    Amount: -76.23,
  },
  {
    Date: new Date('2025-05-18'),
    Description: 'Monthly Interest',
    Amount: 12.45,
  },
]

const formatCreateLabel = (inputValue: string) => (
  <span style={{ fontStyle: 'italic' }}>
    +
    {' '}
    {inputValue ? `Create "${inputValue}"` : 'Create new account'}
  </span>
)

export function UploadTransactionsUploadCsvStep() {
  const { data: customAccounts, isLoading: isLoadingCustomAccounts, error: customAccountsError } = useCustomAccounts()
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const accountOptions = useMemo(() => {
    if (!customAccounts) return []

    return customAccounts.map(account => ({
      value: account.id,
      label: account.account_name,
    }))
  }, [customAccounts])

  const onChange = useCallback((option: AccountOption | null) => {
    setSelectedAccount(option)
  }, [])

  const onCreateOption = useCallback((inputValue: string) => {
    setSelectedAccount({
      value: 'new_account',
      label: 'Create new account',
      created_account_name: inputValue,
    })
  }, [])

  const onCancel = useCallback(() => {
    setSelectedAccount(null)
  }, [])

  const onSuccess = useCallback((account: CustomAccount) => {
    setSelectedAccount({
      value: account.id,
      label: account.accountName,
    })
  }, [])

  const inputClassName = classNames(
    'Layer__upload-transactions__select-account-name-input',
    !!customAccountsError && 'Layer__upload-transactions__select-account-name-input--error',
  )

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
          <CustomAccountForm initialAccountName={selectedAccount?.created_account_name ?? ''} onCancel={onCancel} onSuccess={onSuccess} />
        </VStack>
      )}
      <CsvUpload file={file} onFileSelected={setFile} />
      <Separator />
      <VStack gap='xs' className='Layer__upload-transactions__template-section'>
        <P size='sm'>Make sure to include the following columns</P>
        <HStack align='center'>
          <CopyTemplateHeadersButtonGroup templateHeaders={templateHeaders} />
          <Spacer />
          <DownloadCsvTemplateButton
            className='Layer__upload-transactions__template-section__download-template-button'
            fileName='upload_transactions.csv'
            csvProps={{ headers: templateHeaders, rows: templateExampleTransactions }}
          >
            Download template
          </DownloadCsvTemplateButton>
        </HStack>
      </VStack>
      <HStack>
        <Spacer />
        <Button
          rightIcon={<UploadCloud size={12} />}
          disabled={!selectedAccount || selectedAccount.value === 'new_account' || !file}
        >
          Upload transactions
        </Button>
      </HStack>
    </VStack>
  )
}
