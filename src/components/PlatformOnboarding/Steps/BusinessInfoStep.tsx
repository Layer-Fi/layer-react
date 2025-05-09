import { BusinessForm } from '../../BusinessForm/BusinessForm'
import { Heading } from '../../ui/Typography/Heading'
import { Button, ButtonVariant } from '../../Button/Button'

type BusinessInfoStepProps = {
  title?: string
  onNext: () => void
  onBack?: () => void
}

const defaultTitle = 'Confirm your information'

export const BusinessInfoStep = ({ title = defaultTitle, onNext, onBack }: BusinessInfoStepProps) => {
  return (
    <>
      <Heading>{title}</Heading>
      <BusinessForm onSuccess={onNext} stringOverrides={{ saveButton: '' }} />
      <div className='Layer__platform-onboarding__button-row'>
        <Button onClick={onBack} variant={ButtonVariant.secondary}>Back</Button>
        <Button onClick={() => document.querySelector('.Layer__business-form')?.dispatchEvent(new Event('submit', { bubbles: true }))}>Next</Button>
      </div>
    </>
  )
}
