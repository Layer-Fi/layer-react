import { DeprecatedButton } from '../../Button/Button'
import { Heading, Text } from '../../Typography'

type SummaryStepProps = {
  onNext: () => void
  title?: string
  description?: string
  nextBtnText?: string
}

const defaultTitle = 'You’re all set!'
const defaultDescription = 'We’re syncing your accounts. This process may take a while to complete.'
const defaultNextBtnText = 'Go to dashboard'

export const SummaryStep = ({ onNext, title = defaultTitle, description = defaultDescription, nextBtnText = defaultNextBtnText }: SummaryStepProps) => {
  return (
    <>
      <div className='Layer__platform-onboarding__summary'>
        <Heading className='Layer__platform-onboarding__heading' align='left'>{title}</Heading>
        <Text status='disabled'>{description}</Text>
      </div>
      <DeprecatedButton onClick={onNext}>{nextBtnText}</DeprecatedButton>
    </>
  )
}
