import { BusinessForm } from '../../BusinessForm/BusinessForm'

type BusinessInfoStepProps = {
  onNext: () => void
}

export const BusinessInfoStep = ({ onNext }: BusinessInfoStepProps) => {
  return (
    <>
      <BusinessForm onSuccess={onNext} />
    </>
  )
}
