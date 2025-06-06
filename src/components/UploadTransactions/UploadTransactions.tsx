import { useCallback, useState } from 'react'
import { Wizard } from '../Wizard/Wizard'
import { Heading } from '../ui/Typography/Heading'
import type { Awaitable } from '../../types/utility/promises'
import { VStack } from '../ui/Stack/Stack'
import { type AccountOption, UploadTransactionsUploadCsvStep } from './UploadTransactionsUploadCsvStep'
import { UploadTransactionsValidateCsvStep } from './UploadTransactionsValidateCsvStep'
import { type CustomAccountParseCsvResponse } from '../../hooks/customAccounts/useCustomAccountParseCsv'

type UploadTransactionsProps = {
  onComplete?: () => Awaitable<void>
}

enum UploadTransactionsStep {
  UploadCsv,
  ValidateCsv,
}

export function UploadTransactions({ onComplete }: UploadTransactionsProps) {
  const [currentStep, setCurrentStep] = useState<UploadTransactionsStep>(UploadTransactionsStep.UploadCsv)

  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [parseCsvResponse, setParseCsvResponse] = useState<CustomAccountParseCsvResponse | null>(null)
  const isValid = parseCsvResponse?.is_valid

  const onSelectAccount = useCallback((account: AccountOption | null) => {
    setSelectedAccount(account)
  }, [])

  const onSelectFile = useCallback((file: File | null) => {
    setFile(file)
    setParseCsvResponse(null)
  }, [])

  const onParseCsv = useCallback((parseCsvResponse: CustomAccountParseCsvResponse) => {
    setParseCsvResponse(parseCsvResponse)
    setCurrentStep(UploadTransactionsStep.ValidateCsv)
  }, [])

  const goRestartFlow = useCallback(() => {
    setCurrentStep(UploadTransactionsStep.UploadCsv)
  }, [])

  const onReupload = useCallback(() => {
    setFile(null)
    setParseCsvResponse(null)
    setCurrentStep(UploadTransactionsStep.UploadCsv)
  }, [])

  return (
    <section className='Layer__component'>
      <Wizard
        Header={(
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
        )}
        Footer={null}
        onComplete={onComplete}
      >
        {currentStep === UploadTransactionsStep.UploadCsv
          && (
            <UploadTransactionsUploadCsvStep
              onSelectAccount={onSelectAccount}
              selectedAccount={selectedAccount}
              onSelectFile={onSelectFile}
              selectedFile={file}
              onParseCsv={onParseCsv}
            />
          )}
        {currentStep === UploadTransactionsStep.ValidateCsv
          && (
            <UploadTransactionsValidateCsvStep
              selectedAccountId={selectedAccount!.value}
              parseCsvResponse={parseCsvResponse!}
              onGoBack={goRestartFlow}
              onReupload={onReupload}
            />
          )}
      </Wizard>
    </section>
  )
}
