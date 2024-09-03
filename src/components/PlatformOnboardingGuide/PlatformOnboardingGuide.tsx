import React from 'react'
import ChartIcon from '../../icons/Chart'
import DocIcon from '../../icons/DocIcon'
import { Heading, HeadingSize, Text } from '../Typography'

export const PlatformOnboardingGuide = () => {
  return (
    <div className='Layer__platform__onboarding__guide'>
      <div className='Layer__platform__onboarding__how-it-works'>
        <div className='Layer__platform__onboarding__guide--benefits'>
          <div className='Layer__platform__onboarding__guide--benefit'>
            <Heading>How it works</Heading>
            <Text as='p'>
              Discover how seamless accounting can transform your business.
            </Text>
          </div>
          <div className='Layer__platform__onboarding__guide--benefit'>
            <div className='Layer__platform__onboarding__guide--heading-wrapper'>
              <ChartIcon />
              <Heading size={HeadingSize.secondary}>
                Understand your business health
              </Heading>
            </div>
            <Text as='p'>
              Get an accurate picture of your financial performance and insight
              into how to grow your profit.
            </Text>
          </div>
          <div className='Layer__platform__onboarding__guide--benefit'>
            <div className='Layer__platform__onboarding__guide--heading-wrapper'>
              <DocIcon />
              <Heading size={HeadingSize.secondary}>
                Be ready for tax time
              </Heading>
            </div>
            <Text as='p'>
              Keep your business finances organized to avoid paying more taxes
              than needed or IRS fines at tax time.
            </Text>
          </div>
        </div>
      </div>

      <div className='Layer__platform__onboarding__guide--elements'>
        <div className='Layer__platform__onboarding__guide--element'>
          <div className='Layer__platform__onboarding__guide--image-wrapper'>
            <img
              src='https://layer-public.s3.us-west-2.amazonaws.com/site-images/linked-accounts.png'
              alt='Connect your accounts'
            />
          </div>
          <div className='Layer__platform__onboarding__guide--text-wrapper'>
            <Heading size={HeadingSize.secondary}>
              Connect your accounts
            </Heading>
            <Text as='p'>
              Connect your bank accounts and credit cards to see a complete
              picture of your business finances.
            </Text>
          </div>
        </div>
        <div className='Layer__platform__onboarding__guide--element'>
          <div className='Layer__platform__onboarding__guide--image-wrapper'>
            <img
              src='https://layer-public.s3.us-west-2.amazonaws.com/site-images/bookkeeping-tasks.png'
              alt='Bookkeeping tasks'
            />
          </div>
          <div className='Layer__platform__onboarding__guide--text-wrapper'>
            <Heading size={HeadingSize.secondary}>
              Ongoing monthly bookkeeping
            </Heading>
            <Text as='p'>
              Receive a monthly report of your financial performance to review
              with your PSM.
            </Text>
          </div>
        </div>
        <div className='Layer__platform__onboarding__guide--element'>
          <div className='Layer__platform__onboarding__guide--image-wrapper'>
            <img
              src='https://layer-public.s3.us-west-2.amazonaws.com/site-images/revenue.png'
              alt='Profitability'
            />
          </div>
          <div className='Layer__platform__onboarding__guide--text-wrapper'>
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
