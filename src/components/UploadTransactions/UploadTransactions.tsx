import { useCallback, useState } from 'react'
import { Wizard } from '../Wizard/Wizard'
import { Heading } from '../ui/Typography/Heading'
import type { Awaitable } from '../../types/utility/promises'
import { VStack } from '../ui/Stack/Stack'
import { P } from '../ui/Typography/Text'
import { UploadTransactionsUploadCsvStep } from './UploadTransactionsUploadCsvStep'
import { UploadTransactionsValidateCsvStep } from './UploadTransactionsValidateCsvStep'
import { type CustomAccountParseCsvResponse } from '../../hooks/customAccounts/useCustomAccountParseCsv'

type UploadTransactionsProps = {
  onComplete?: () => Awaitable<void>
}

enum UploadTransactionsStep {
  UploadCsv,
  ValidateCsv,
}

type AccountOption = {
  value: string
  label: string
  createdAccountName?: string
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
            <Heading>
              {currentStep === UploadTransactionsStep.UploadCsv && 'Upload bank transactions'}
              {currentStep === UploadTransactionsStep.ValidateCsv
                && (isValid
                  ? 'Confirm transactions'
                  : 'Failed to parse transactions'
                )}
            </Heading>
            <P pbe='xl' size='sm' variant='subtle'>
              {currentStep === UploadTransactionsStep.UploadCsv && 'Add file downloaded from your bank account'}
              {currentStep === UploadTransactionsStep.ValidateCsv
                && (isValid
                  ? 'Confirm that the data from uploaded file matches what you see in your account'
                  : (
                    <span>
                      There were errors while parsing the uploaded file.
                      <br />
                      Please ensure that the CSV conforms to the accepted format.
                    </span>
                  )
                )}
            </P>
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
