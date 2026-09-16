import { useCallback, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type BankTransactionDataOnly } from '@schemas/features/bankTransactions/bankTransactionDataOnly'
import { type CustomAccountParseCsvResponse } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/post'
import { ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { Heading } from '@ui/Typography/Heading'
import { Wizard } from '@blocks/Wizard/Wizard'
import { BankTransactionsUploadConfirmationStep } from '@features/bankTransactions/BankTransactionsUploadModal/BankTransactionsUploadConfirmationStep'
import { type AccountOption, BankTransactionsUploadCsvStep } from '@features/bankTransactions/BankTransactionsUploadModal/BankTransactionsUploadCsvStep'
import { BankTransactionsValidateCsvStep } from '@features/bankTransactions/BankTransactionsUploadModal/BankTransactionsValidateCsvStep'
import { BankTransactionsUploadStep } from '@features/bankTransactions/BankTransactionsUploadModal/types'

import './bankTransactionsUploadWizard.scss'

type UploadTransactionsHeaderProps = {
  currentStep: BankTransactionsUploadStep
  isValid: boolean | undefined
  onClose?: () => void
}

function getTitle(
  currentStep: BankTransactionsUploadStep,
  isValid: boolean | undefined,
  t: TFunction,
) {
  switch (currentStep) {
    case BankTransactionsUploadStep.UploadCsv:
      return t('upload:action.upload_transactions', 'Upload transactions')
    case BankTransactionsUploadStep.ValidateCsv:
      return isValid ? t('upload:label.review_transactions', 'Review transactions') : t('upload:error.could_not_parse_transactions', 'Some transactions couldn’t be parsed')
    case BankTransactionsUploadStep.Confirmation:
      return ''
  }
}

function getDescription(
  currentStep: BankTransactionsUploadStep,
  isValid: boolean | undefined,
  t: TFunction,
) {
  switch (currentStep) {
    case BankTransactionsUploadStep.UploadCsv:
      return t('upload:action.import_file_transaction_bank', 'Import a file of transactions from your bank account or credit card')
    case BankTransactionsUploadStep.ValidateCsv:
      if (isValid) {
        return t('upload:label.transactions_parsed_successfully_click_upload', 'All transactions were parsed successfully. Click “Upload transactions” to finalize the import.')
      }
      return t('upload:validation.transactions_formatting_errors', 'We found formatting errors in some transactions. Please correct the highlighted rows in your file and reupload it.')
    case BankTransactionsUploadStep.Confirmation:
      return ''
  }
}
function UploadTransactionsHeader({ currentStep, isValid, onClose }: UploadTransactionsHeaderProps) {
  const { t } = useTranslation()
  if (currentStep === BankTransactionsUploadStep.Confirmation) return null

  const title = getTitle(currentStep, isValid, t)
  const description = getDescription(currentStep, isValid, t)

  return (
    <ModalTitleWithClose
      heading={<Heading level={1} size='sm'>{title}</Heading>}
      description={<Heading level={2} size='xs' variant='subtle' weight='normal'>{description}</Heading>}
      onClose={onClose}
      hideBottomPadding
    />
  )
}

type BankTransactionsUploadWizardProps = {
  onComplete?: () => void
}

export function BankTransactionsUploadWizard({ onComplete }: BankTransactionsUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState<BankTransactionsUploadStep>(BankTransactionsUploadStep.UploadCsv)
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [parseCsvResponse, setParseCsvResponse] = useState<CustomAccountParseCsvResponse | null>(null)
  const isValid = parseCsvResponse?.isValid
  const [uploadedTransactionsCount, setUploadedTransactionsCount] = useState(0)
  const onSelectAccount = useCallback((account: AccountOption | null) => {
    setSelectedAccount(account)
  }, [])

  const onSelectFile = useCallback((file: File | null) => {
    setFile(file)
    setParseCsvResponse(null)
  }, [])

  const onRestartFlow = useCallback(() => {
    setFile(null)
    setSelectedAccount(null)
    setParseCsvResponse(null)
    setUploadedTransactionsCount(0)
  }, [])

  const onParseCsv = useCallback((parseCsvResponse: CustomAccountParseCsvResponse) => {
    setParseCsvResponse(parseCsvResponse)
  }, [])

  const onUploadTransactionsSuccess = useCallback((txns: BankTransactionDataOnly[]) => {
    setUploadedTransactionsCount(txns.length)
  }, [])

  return (
    <section className='Layer__component Layer__upload-transactions'>
      <Wizard
        Header={<UploadTransactionsHeader currentStep={currentStep} isValid={isValid} onClose={onComplete} />}
        Footer={null}
        onComplete={onComplete}
        onStepChange={setCurrentStep}
      >
        <BankTransactionsUploadCsvStep
          onSelectAccount={onSelectAccount}
          selectedAccount={selectedAccount}
          onSelectFile={onSelectFile}
          selectedFile={file}
          onParseCsv={onParseCsv}
        />
        <BankTransactionsValidateCsvStep
          selectedAccountId={selectedAccount?.value}
          parseCsvResponse={parseCsvResponse}
          onSelectFile={onSelectFile}
          onUploadTransactionsSuccess={onUploadTransactionsSuccess}
        />
        <BankTransactionsUploadConfirmationStep
          onRestartFlow={onRestartFlow}
          uploadedTransactionsCount={uploadedTransactionsCount}
        />
      </Wizard>
    </section>
  )
}
