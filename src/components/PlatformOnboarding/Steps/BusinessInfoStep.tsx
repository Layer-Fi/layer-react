import { BusinessForm } from '../../BusinessForm/BusinessForm'
import { Heading } from '../../ui/Typography/Heading'

type BusinessInfoStepProps = {
  title?: string
  onNext: () => void
}

const defaultTitle = 'Confirm your information'

export const BusinessInfoStep = ({ title = defaultTitle, onNext }: BusinessInfoStepProps) => {
  return (
    <>
      <Heading>{title}</Heading>
      <BusinessForm onSuccess={onNext} />
    </>
  )
}
