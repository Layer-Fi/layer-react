import { useCallback, useState } from 'react'
import { ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { Heading } from '@ui/Typography/Heading'
import { Wizard } from '@components/Wizard/Wizard'

import './ManageUploadTransactions.scss'
import { ManageUploadTransactionsStep } from './types'
import DeleteUploadTransactionsStep from './DeleteUploadTransactionsStep'
import { DeleteUploadTransactionsConfirmationStep } from './DeleteUploadTransactionsConfirmationStep'

type ManageUploadTransactionsHeaderProps = {
  currentStep: ManageUploadTransactionsStep
  onClose?: () => void
}

function getTitle(currentStep: ManageUploadTransactionsStep) {
  switch (currentStep) {
    case ManageUploadTransactionsStep.ManageUploads:
      return 'Manage uploaded transactions'
    case ManageUploadTransactionsStep.Confirmation:
      return ''
  }
}

function getDescription(currentStep: ManageUploadTransactionsStep) {
  switch (currentStep) {
    case ManageUploadTransactionsStep.ManageUploads:
      return 'Bulk delete transactions by uploads'
    case ManageUploadTransactionsStep.Confirmation:
      return ''
  }
}
function UploadTransactionsHeader({ currentStep, onClose }: ManageUploadTransactionsHeaderProps) {
  if (currentStep === ManageUploadTransactionsStep.Confirmation) return null

  const title = getTitle(currentStep)
  const description = getDescription(currentStep)

  return (
    <ModalTitleWithClose
      heading={<Heading level={1} size='sm'>{title}</Heading>}
      description={<Heading level={2} size='xs' variant='subtle' weight='normal'>{description}</Heading>}
      onClose={onClose}
    />
  )
}

type UploadTransactionsProps = {
  onComplete?: () => void
}

export function ManageUploadTransactions({ onComplete }: UploadTransactionsProps) {
  const [currentStep, setCurrentStep] = useState<ManageUploadTransactionsStep>(ManageUploadTransactionsStep.ManageUploads)
  const [transactionsCount, setTransactionsCount] = useState(0)
  const onRestartFlow = useCallback(() => {
    setTransactionsCount(0)
  }, [])

  return (
    <section className='Layer__component Layer__upload-transactions'>
      <Wizard
        Header={<UploadTransactionsHeader currentStep={currentStep}  onClose={onComplete} />}
        Footer={null}
        onComplete={onComplete}
        onStepChange={setCurrentStep}
      >
      <DeleteUploadTransactionsStep
        setTransactionsCount={setTransactionsCount}
      />
      <DeleteUploadTransactionsConfirmationStep
        onRestartFlow={onRestartFlow}
        transactionsCount={transactionsCount}
      />
      </Wizard>
    </section>
  )
}
