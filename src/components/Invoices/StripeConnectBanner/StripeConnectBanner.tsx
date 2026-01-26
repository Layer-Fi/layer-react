import { StripeAccountStatus } from '@schemas/stripeAccountStatus'
import { Banner } from '@ui/Banner/Banner'
import { VStack } from '@ui/Stack/Stack'
import { useStripeAccountStatus } from '@features/invoices/api/useStripeAccountStatus'

import './stripeConnectBanner.scss'

import { ConnectStripeButton } from './ConnectStripeButton'
import { useStripeConnect } from './useStripeConnect'

export const StripeConnectBanner = () => {
  const { data, isLoading, isError } = useStripeAccountStatus()
  const { handleConnectStripe, isMutating, isConnectError } = useStripeConnect()

  if (isLoading || isError) {
    return null
  }

  const status = data?.accountStatus

  if (status === StripeAccountStatus.Active) {
    return null
  }

  if (status === StripeAccountStatus.Pending) {
    return (
      <VStack pi='lg' pbe='md' className='Layer__StripeConnectBanner__wrapper'>
        <Banner
          variant='default'
          title='Stripe account under review'
          description='Once complete, you can start accepting card and bank payments.'
        />
      </VStack>
    )
  }

  if (status === StripeAccountStatus.NotCreated) {
    return (
      <VStack pi='lg' pbe='md' className='Layer__StripeConnectBanner__wrapper'>
        <Banner
          variant='info'
          title='Stripe payments not enabled'
          description='Set up your Stripe account to start accepting card and bank payments for your invoices.'
          slots={{
            Button: (
              <ConnectStripeButton
                isError={isConnectError}
                isMutating={isMutating}
                onClick={() => void handleConnectStripe()}
              />
            ),
          }}
        />
      </VStack>
    )
  }

  if (status === StripeAccountStatus.Incomplete) {
    return (
      <VStack pi='lg' pbe='md' className='Layer__StripeConnectBanner__wrapper'>
        <Banner
          variant='warning'
          title='Stripe setup incomplete'
          description='Finish setting up your Stripe account to start accepting card and bank payments for your invoices.'
          slots={{
            Button: (
              <ConnectStripeButton
                isError={isConnectError}
                isMutating={isMutating}
                onClick={() => void handleConnectStripe()}
              />
            ),
          }}
        />
      </VStack>
    )
  }

  return null
}
