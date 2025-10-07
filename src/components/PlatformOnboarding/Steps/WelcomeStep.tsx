import DocumentIcon from '../../../icons/Document'
import TrendingUpIcon from '../../../icons/TrendingUp'
import { DeprecatedButton } from '../../Button/Button'
import { Heading, HeadingSize, Text } from '../../Typography'
import { HStack, VStack } from '../../ui/Stack/Stack'

type WelcomeStepProps = {
  onNext: () => void
  title?: string
  description?: string
  stepsEnabled?: string[]
}

const defaultTitle = 'Welcome'
const defaultDescription = 'Welcome to the platform onboarding process'

export const WelcomeStep = ({ onNext, title = defaultTitle, description, stepsEnabled }: WelcomeStepProps) => {
  const buildDescription = () => {
    if (description) {
      return description
    }

    if (stepsEnabled) {
      let text = 'In this flow we’ll '
      if (stepsEnabled.includes('business-info')) {
        text += 'confirm your business information, '
      }
      if (stepsEnabled.includes('link-accounts')) {
        text += 'connect your financial accounts, '
      }
      text += 'and start managing your books like a pro.'
      return text
    }

    return defaultDescription
  }

  return (
    <>
      <div className='Layer__platform-onboarding__welcome'>
        <Heading className='Layer__platform-onboarding__heading' align='left'>{title}</Heading>
        <Text status='disabled'>{buildDescription()}</Text>
      </div>
      <DeprecatedButton onClick={onNext}>Get started</DeprecatedButton>
    </>
  )
}

export const WelcomeStepFooter = () => {
  return (
    <div className='Layer__platform-onboarding__welcome-footer'>
      <div className='Layer__platform-onboarding__welcome-footer__content'>
        <div className='Layer__platform-onboarding__welcome-footer__header'>
          <Heading align='left'>How it works</Heading>
          <Text status='disabled'>Discover how seamless accounting can transform your business.</Text>
        </div>
        <VStack gap='lg'>
          <VStack gap='xs'>
            <HStack gap='xs'>
              <TrendingUpIcon />
              <Heading size={HeadingSize.secondary}>Understand your business health</Heading>
            </HStack>
            <Text status='disabled'>Get an accurate picture of your financial performance and insight into how to grow your profit.</Text>
          </VStack>
          <VStack gap='xs'>
            <HStack gap='xs'>
              <DocumentIcon />
              <Heading size={HeadingSize.secondary}>Be ready for tax time</Heading>
            </HStack>
            <Text status='disabled'>Keep your business finances organized to avoid paying more taxes than needed or IRS fines at tax time.</Text>
          </VStack>
        </VStack>
      </div>
      <div className='Layer__platform-onboarding__welcome-footer__images'>
        <div className='Layer__platform-onboarding__welcome-footer__image'>
          <div className='Layer__platform__onboarding__welcome-footer__image-wrapper'>
            <img
              src='https://layer-public.s3.us-west-2.amazonaws.com/site-images/linked-accounts.png'
              alt='Connect your accounts'
            />
          </div>
          <div className='Layer__platform__onboarding__welcome-footer__image-text'>
            <Heading size={HeadingSize.secondary}>
              Connect your accounts
            </Heading>
            <Text as='p'>
              Connect your bank accounts and credit cards to see a complete
              picture of your business finances.
            </Text>
          </div>
        </div>
        <div className='Layer__platform-onboarding__welcome-footer__image'>
          <div className='Layer__platform__onboarding__welcome-footer__image-wrapper'>
            <img
              src='https://layer-public.s3.us-west-2.amazonaws.com/site-images/bookkeeping-tasks.png'
              alt='Bookkeeping tasks'
            />
          </div>
          <div className='Layer__platform__onboarding__welcome-footer__image-text'>
            <Heading size={HeadingSize.secondary}>
              Ongoing monthly bookkeeping
            </Heading>
            <Text as='p'>
              Receive a monthly report of your financial performance to review
              with your PSM.
            </Text>
          </div>
        </div>
        <div className='Layer__platform-onboarding__welcome-footer__image'>
          <div className='Layer__platform__onboarding__welcome-footer__image-wrapper'>
            <img
              src='https://layer-public.s3.us-west-2.amazonaws.com/site-images/revenue.png'
              alt='Profitability'
            />
          </div>
          <div className='Layer__platform__onboarding__welcome-footer__image-text'>
            <Heading size={HeadingSize.secondary}>
              See your profitability
            </Heading>
            <Text as='p'>
              Our bookkeeping team organized and categorizes your business
              transactions.
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
