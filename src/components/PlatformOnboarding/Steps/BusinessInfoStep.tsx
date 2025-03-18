import { BusinessForm } from '../../BusinessForm/BusinessForm'
import { Heading } from '../../ui/Typography/Heading'

type BusinessInfoStepProps = {
  title?: string
  onNext: () => void
}

const defaultTitle = 'We’ll use this information to contact you whenever we have questions on your books.'

export const BusinessInfoStep = ({ title = defaultTitle, onNext }: BusinessInfoStepProps) => {
  return (
    <>
      <Heading>{title}</Heading>
      <BusinessForm onSuccess={onNext} />
    </>
  )
}
