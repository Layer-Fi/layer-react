import { useCallback, useState } from 'react'
import { Wizard } from '../Wizard/Wizard'
import { Heading } from '../ui/Typography/Heading'
import type { Awaitable } from '../../types/utility/promises'
import { VStack } from '../ui/Stack/Stack'
import { type AccountOption, UploadTransactionsUploadCsvStep } from './UploadTransactionsUploadCsvStep'
import { UploadTransactionsValidateCsvStep } from './UploadTransactionsValidateCsvStep'
import { type CustomAccountParseCsvResponse } from '../../hooks/customAccounts/useCustomAccountParseCsv'
import { UploadTransactionsConfirmationStep } from './UploadTransactionsConfirmationStep'
import { UploadTransactionsStep } from './types'
import { BankTransaction } from '../../types'

type UploadTransactionsHeaderProps = {
  currentStep: UploadTransactionsStep
  isValid: boolean | undefined
}

function UploadTransactionsHeader({ currentStep, isValid }: UploadTransactionsHeaderProps) {
  if (currentStep === UploadTransactionsStep.Confirmation) return null

  return (
    <VStack gap='xs'>
      <Heading level={1}>
        {currentStep === UploadTransactionsStep.UploadCsv && 'Upload transactions'}
        {currentStep === UploadTransactionsStep.ValidateCsv
          && (isValid
            ? 'Review transactions'
            : 'Some transactions couldn\'t be parsed'
          )}
      </Heading>
      <Heading level={2} pbe='xl' size='2xs' variant='subtle' weight='normal'>
        {currentStep === UploadTransactionsStep.UploadCsv && 'Import a file of transactions from your bank account or credit card'}
        {currentStep === UploadTransactionsStep.ValidateCsv
          && (isValid
            ? 'All transactions were parsed successfully. Please review and confirm your transactions below to finalize the upload.'
            : 'We found formatting errors in some transactions. Please correct the highlighted rows in your file and reupload it.'
          )}
      </Heading>
    </VStack>
  )
}

type UploadTransactionsProps = {
  onComplete?: () => Awaitable<void>
}

export function UploadTransactions({ onComplete }: UploadTransactionsProps) {
  const [currentStep, setCurrentStep] = useState<UploadTransactionsStep>(UploadTransactionsStep.UploadCsv)

  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [parseCsvResponse, setParseCsvResponse] = useState<CustomAccountParseCsvResponse | null>(null)
  const isValid = parseCsvResponse?.is_valid
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

  const onUploadTransactionsSuccess = useCallback((txns: BankTransaction[]) => {
    setUploadedTransactionsCount(txns.length)
  }, [])

  return (
    <section className='Layer__component Layer__upload-transactions'>
      <Wizard
        Header={<UploadTransactionsHeader currentStep={currentStep} isValid={isValid} />}
        Footer={null}
        onComplete={onComplete}
        onStepChange={setCurrentStep}
      >
        <UploadTransactionsUploadCsvStep
          onSelectAccount={onSelectAccount}
          selectedAccount={selectedAccount}
          onSelectFile={onSelectFile}
          selectedFile={file}
          onParseCsv={onParseCsv}
        />
        <UploadTransactionsValidateCsvStep
          selectedAccountId={selectedAccount?.value}
          parseCsvResponse={parseCsvResponse}
          onSelectFile={onSelectFile}
          onUploadTransactionsSuccess={onUploadTransactionsSuccess}
        />
        <UploadTransactionsConfirmationStep
          onRestartFlow={onRestartFlow}
          uploadedTransactionsCount={uploadedTransactionsCount}
        />
      </Wizard>
    </section>
  )
}
